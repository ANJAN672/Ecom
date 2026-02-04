import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import { CartItem } from '../../cart/entities/cart-item.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';

/**
 * Product Entity - The core of our e-commerce
 * 
 * Key Features:
 * - Linked to a seller (User with SELLER role)
 * - Linked to a category
 * - Stock management with isInStock computed field
 * - Price stored as decimal for accuracy
 */
@Entity('products')
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 200 })
    name: string;

    @Column({ type: 'text' })
    description: string;

    /**
     * Price stored as decimal(10, 2)
     * - 10 total digits, 2 after decimal
     * - Example: 99999999.99 (max)
     * - Why decimal? Float has precision issues with money
     */
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    /**
     * Stock quantity - How many items available
     * When this reaches 0, product becomes "out of stock"
     */
    @Column({ type: 'int', default: 0 })
    stockQuantity: number;

    /**
     * Convenience field - Updated when stockQuantity changes
     * Makes queries easier: WHERE isInStock = true
     */
    @Column({ default: true })
    isInStock: boolean;

    /**
     * Product image URL from Unsplash
     */
    @Column({ nullable: true })
    imageUrl: string;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Relationships

    /**
     * Many products belong to one seller
     * @ManyToOne - This product has ONE seller
     * @JoinColumn - Creates the foreign key column
     */
    @ManyToOne(() => User, (user) => user.products, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'sellerId' })
    seller: User;

    @Column()
    sellerId: string;

    /**
     * Many products belong to one category
     */
    @ManyToOne(() => Category, (category) => category.products, {
        onDelete: 'SET NULL',
        nullable: true
    })
    @JoinColumn({ name: 'categoryId' })
    category: Category;

    @Column({ nullable: true })
    categoryId: string;

    // One product can be in many cart items
    @OneToMany(() => CartItem, (cartItem) => cartItem.product)
    cartItems: CartItem[];

    // One product can be in many order items
    @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
    orderItems: OrderItem[];
}
