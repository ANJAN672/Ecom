import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './entities/cart-item.entity';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { ProductsService } from '../products/products.service';

/**
 * CartService - Amazon-style persistent shopping cart
 * 
 * Features:
 * - Add/remove items
 * - Update quantities
 * - Validate stock before adding
 * - Calculate totals
 * - Clear cart (after checkout)
 */
@Injectable()
export class CartService {
    constructor(
        @InjectRepository(CartItem)
        private readonly cartRepository: Repository<CartItem>,
        private readonly productsService: ProductsService,
    ) { }

    /**
     * Add item to cart
     * 
     * If product already in cart, increase quantity
     * Validates stock availability
     */
    async addToCart(addToCartDto: AddToCartDto, userId: string): Promise<CartItem> {
        const { productId, quantity } = addToCartDto;

        // Validate product exists and has enough stock
        const product = await this.productsService.findOne(productId);

        if (!product.isInStock) {
            throw new BadRequestException(`"${product.name}" is out of stock`);
        }

        if (product.stockQuantity < quantity) {
            throw new BadRequestException(
                `Only ${product.stockQuantity} items available for "${product.name}"`,
            );
        }

        // Check if item already in cart
        const existingItem = await this.cartRepository.findOne({
            where: { userId, productId },
        });

        if (existingItem) {
            // Update quantity
            const newQuantity = existingItem.quantity + quantity;

            // Validate total quantity against stock
            if (product.stockQuantity < newQuantity) {
                throw new BadRequestException(
                    `Cannot add ${quantity} more. Only ${product.stockQuantity - existingItem.quantity} more available.`,
                );
            }

            existingItem.quantity = newQuantity;
            return this.cartRepository.save(existingItem);
        }

        // Create new cart item
        const cartItem = this.cartRepository.create({
            userId,
            productId,
            quantity,
        });

        return this.cartRepository.save(cartItem);
    }

    /**
     * Get all items in user's cart with product details and totals
     */
    async getCart(userId: string) {
        const items = await this.cartRepository.find({
            where: { userId },
            relations: ['product', 'product.category'],
            order: { createdAt: 'DESC' },
        });

        // Calculate totals
        let subtotal = 0;
        const cartItems = items.map((item) => {
            const itemTotal = Number(item.product.price) * item.quantity;
            subtotal += itemTotal;

            return {
                id: item.id,
                quantity: item.quantity,
                product: {
                    id: item.product.id,
                    name: item.product.name,
                    price: item.product.price,
                    imageUrl: item.product.imageUrl,
                    stockQuantity: item.product.stockQuantity,
                    isInStock: item.product.isInStock,
                    category: item.product.category?.name,
                },
                itemTotal,
                // Warning if stock is low or item became out of stock
                stockWarning: !item.product.isInStock
                    ? 'Out of stock'
                    : item.product.stockQuantity < item.quantity
                        ? `Only ${item.product.stockQuantity} available`
                        : null,
            };
        });

        return {
            items: cartItems,
            itemCount: items.length,
            subtotal: subtotal.toFixed(2),
            // Could add tax, shipping, etc. here
            total: subtotal.toFixed(2),
        };
    }

    /**
     * Update cart item quantity
     */
    async updateQuantity(
        cartItemId: string,
        updateDto: UpdateCartItemDto,
        userId: string,
    ): Promise<CartItem> {
        const cartItem = await this.findCartItem(cartItemId, userId);

        // Validate stock
        const product = await this.productsService.findOne(cartItem.productId);

        if (product.stockQuantity < updateDto.quantity) {
            throw new BadRequestException(
                `Only ${product.stockQuantity} items available for "${product.name}"`,
            );
        }

        cartItem.quantity = updateDto.quantity;
        return this.cartRepository.save(cartItem);
    }

    /**
     * Remove item from cart
     */
    async removeFromCart(cartItemId: string, userId: string): Promise<void> {
        const cartItem = await this.findCartItem(cartItemId, userId);
        await this.cartRepository.remove(cartItem);
    }

    /**
     * Clear entire cart (used after checkout)
     */
    async clearCart(userId: string): Promise<void> {
        await this.cartRepository.delete({ userId });
    }

    /**
     * Get cart items for checkout validation
     */
    async getCartItemsForCheckout(userId: string): Promise<CartItem[]> {
        return this.cartRepository.find({
            where: { userId },
            relations: ['product'],
        });
    }

    /**
     * Validate cart items have sufficient stock
     * Returns validation result with any issues
     */
    async validateCartForCheckout(userId: string): Promise<{
        valid: boolean;
        issues: Array<{ productName: string; issue: string }>;
    }> {
        const items = await this.getCartItemsForCheckout(userId);
        const issues: Array<{ productName: string; issue: string }> = [];

        for (const item of items) {
            if (!item.product.isInStock) {
                issues.push({
                    productName: item.product.name,
                    issue: 'Out of stock',
                });
            } else if (item.product.stockQuantity < item.quantity) {
                issues.push({
                    productName: item.product.name,
                    issue: `Only ${item.product.stockQuantity} available (you have ${item.quantity} in cart)`,
                });
            }
        }

        return {
            valid: issues.length === 0,
            issues,
        };
    }

    /**
     * Helper: Find cart item and verify ownership
     */
    private async findCartItem(id: string, userId: string): Promise<CartItem> {
        const cartItem = await this.cartRepository.findOne({
            where: { id, userId },
        });

        if (!cartItem) {
            throw new NotFoundException('Cart item not found');
        }

        return cartItem;
    }
}
