import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { CartService } from '../cart/cart.service';
import { ProductsService } from '../products/products.service';
import { AddressesService } from '../addresses/addresses.service';
import { OrderStatus, PaymentMethod, PaymentStatus } from '../../common/enums';

/**
 * OrdersService - Handles order creation and management
 * 
 * Checkout Flow:
 * 1. Validate cart (items exist, stock available)
 * 2. Get shipping address
 * 3. Create order with order items
 * 4. Decrease stock for each product
 * 5. Clear user's cart
 * 6. Handle payment (COD for now)
 * 
 * Uses database transaction to ensure atomicity
 */
@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private readonly ordersRepository: Repository<Order>,
        @InjectRepository(OrderItem)
        private readonly orderItemsRepository: Repository<OrderItem>,
        private readonly cartService: CartService,
        private readonly productsService: ProductsService,
        private readonly addressesService: AddressesService,
        private readonly dataSource: DataSource, // For transactions
    ) { }

    /**
     * Create an order from cart items (Checkout)
     * 
     * This is a complex operation that must be atomic:
     * - Either everything succeeds, or nothing happens
     * - Uses database transactions
     */
    async createOrder(createOrderDto: CreateOrderDto, userId: string): Promise<Order> {
        const { addressId, paymentMethod, notes } = createOrderDto;

        // Validate payment method
        if (paymentMethod !== PaymentMethod.COD) {
            throw new BadRequestException(
                `${paymentMethod.toUpperCase()} is coming soon! Only Cash on Delivery is available now.`,
            );
        }

        // Validate cart
        const cartValidation = await this.cartService.validateCartForCheckout(userId);
        if (!cartValidation.valid) {
            throw new BadRequestException({
                message: 'Some items in your cart are unavailable',
                issues: cartValidation.issues,
            });
        }

        // Get cart items
        const cartItems = await this.cartService.getCartItemsForCheckout(userId);
        if (cartItems.length === 0) {
            throw new BadRequestException('Your cart is empty');
        }

        // Get shipping address
        const address = await this.addressesService.findOne(addressId, userId);

        // Calculate total
        let totalAmount = 0;
        for (const item of cartItems) {
            totalAmount += Number(item.product.price) * item.quantity;
        }

        // Generate order number
        const orderNumber = this.generateOrderNumber();

        // Start transaction
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Create order
            const order = this.ordersRepository.create({
                orderNumber,
                userId,
                status: OrderStatus.PENDING,
                paymentMethod,
                paymentStatus: PaymentStatus.PENDING,
                totalAmount,
                notes,
                // Copy address details
                shippingName: address.fullName,
                shippingPhone: address.phoneNumber,
                shippingAddressLine1: address.addressLine1,
                shippingAddressLine2: address.addressLine2,
                shippingCity: address.city,
                shippingState: address.state,
                shippingPinCode: address.pinCode,
            });

            const savedOrder = await queryRunner.manager.save(order);

            // Create order items and decrease stock
            for (const cartItem of cartItems) {
                // Create order item
                const orderItem = this.orderItemsRepository.create({
                    orderId: savedOrder.id,
                    productId: cartItem.productId,
                    quantity: cartItem.quantity,
                    priceAtPurchase: cartItem.product.price,
                    subtotal: Number(cartItem.product.price) * cartItem.quantity,
                    productName: cartItem.product.name,
                    productImage: cartItem.product.imageUrl,
                });
                await queryRunner.manager.save(orderItem);

                // Decrease stock
                await this.productsService.decreaseStock(cartItem.productId, cartItem.quantity);
            }

            // Clear cart
            await this.cartService.clearCart(userId);

            // Commit transaction
            await queryRunner.commitTransaction();

            // Return order with items
            return this.findOne(savedOrder.id, userId);

        } catch (error) {
            // Rollback on error
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Get all orders for a user
     */
    async findAllByUser(userId: string): Promise<Order[]> {
        return this.ordersRepository.find({
            where: { userId },
            relations: ['orderItems'],
            order: { createdAt: 'DESC' },
        });
    }

    /**
     * Get a single order
     */
    async findOne(id: string, userId: string): Promise<Order> {
        const order = await this.ordersRepository.findOne({
            where: { id },
            relations: ['orderItems', 'user'],
        });

        if (!order) {
            throw new NotFoundException(`Order with ID ${id} not found`);
        }

        // Verify ownership
        if (order.userId !== userId) {
            throw new ForbiddenException('You can only view your own orders');
        }

        return order;
    }

    /**
     * Get order by order number
     */
    async findByOrderNumber(orderNumber: string, userId: string): Promise<Order> {
        const order = await this.ordersRepository.findOne({
            where: { orderNumber },
            relations: ['orderItems'],
        });

        if (!order) {
            throw new NotFoundException(`Order ${orderNumber} not found`);
        }

        if (order.userId !== userId) {
            throw new ForbiddenException('You can only view your own orders');
        }

        return order;
    }

    /**
     * Update order status (for sellers/admin)
     */
    async updateStatus(
        id: string,
        updateStatusDto: UpdateOrderStatusDto,
        userId: string,
    ): Promise<Order> {
        const order = await this.ordersRepository.findOne({
            where: { id },
            relations: ['orderItems'],
        });

        if (!order) {
            throw new NotFoundException(`Order with ID ${id} not found`);
        }

        // Validate status transition
        this.validateStatusTransition(order.status, updateStatusDto.status);

        order.status = updateStatusDto.status;

        // Update payment status for COD
        if (order.paymentMethod === PaymentMethod.COD && updateStatusDto.status === OrderStatus.DELIVERED) {
            order.paymentStatus = PaymentStatus.COMPLETED;
        }

        return this.ordersRepository.save(order);
    }

    /**
     * Cancel an order
     */
    async cancelOrder(id: string, userId: string): Promise<Order> {
        const order = await this.findOne(id, userId);

        // Can only cancel pending or confirmed orders
        if (![OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(order.status)) {
            throw new BadRequestException(
                'Cannot cancel order. Order is already shipped or delivered.',
            );
        }

        // Restore stock
        for (const item of order.orderItems) {
            if (item.productId) {
                await this.productsService.increaseStock(item.productId, item.quantity);
            }
        }

        order.status = OrderStatus.CANCELLED;
        return this.ordersRepository.save(order);
    }

    /**
     * Generate unique order number
     * Format: ORD-YYYYMMDD-XXXXX
     */
    private generateOrderNumber(): string {
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.random().toString(36).substring(2, 7).toUpperCase();
        return `ORD-${dateStr}-${random}`;
    }

    /**
     * Validate order status transitions
     */
    private validateStatusTransition(current: OrderStatus, next: OrderStatus): void {
        const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
            [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
            [OrderStatus.CONFIRMED]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
            [OrderStatus.SHIPPED]: [OrderStatus.OUT_FOR_DELIVERY],
            [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.DELIVERED],
            [OrderStatus.DELIVERED]: [],
            [OrderStatus.CANCELLED]: [],
        };

        if (!allowedTransitions[current].includes(next)) {
            throw new BadRequestException(
                `Cannot change status from ${current} to ${next}`,
            );
        }
    }
}
