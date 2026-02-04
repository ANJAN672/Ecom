import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';

/**
 * OrderItem Entity - Individual items within an order
 * 
 * Why separate from Order?
 * - One order can have multiple products
 * - Each product has its own quantity and price
 * - Price is LOCKED at time of purchase (product price may change later)
 */
@Entity('order_items')
export class OrderItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'int' })
    quantity: number;

    /**
     * Price at time of purchase
     * We store this because product price may change later
     * Order history should show what customer actually paid
     */
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    priceAtPurchase: number;

    /**
     * Subtotal for this item (quantity * priceAtPurchase)
     * Stored for convenience
     */
    @Column({ type: 'decimal', precision: 12, scale: 2 })
    subtotal: number;

    // Product info copied for historical reference
    @Column({ length: 200 })
    productName: string;

    @Column({ nullable: true })
    productImage: string;

    @CreateDateColumn()
    createdAt: Date;

    // Relationship: Many order items belong to one order
    @ManyToOne(() => Order, (order) => order.orderItems, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'orderId' })
    order: Order;

    @Column()
    orderId: string;

    // Reference to product (may be null if product deleted)
    @ManyToOne(() => Product, (product) => product.orderItems, {
        onDelete: 'SET NULL',
        nullable: true
    })
    @JoinColumn({ name: 'productId' })
    product: Product;

    @Column({ nullable: true })
    productId: string;
}
