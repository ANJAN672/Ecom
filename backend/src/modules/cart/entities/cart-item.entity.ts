import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';

/**
 * CartItem Entity - Represents items in a user's shopping cart
 * 
 * Amazon-style persistent cart:
 * - Saved to database (survives browser close)
 * - Tied to user account (accessible from any device)
 * - Quantity can be updated
 * 
 * @Unique constraint ensures a user can't have duplicate products
 * (Instead, we update the quantity)
 */
@Entity('cart_items')
@Unique(['userId', 'productId']) // One product per user in cart
export class CartItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'int', default: 1 })
    quantity: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Relationship: Many cart items belong to one user
    @ManyToOne(() => User, (user) => user.cartItems, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: string;

    // Relationship: Many cart items reference one product
    @ManyToOne(() => Product, (product) => product.cartItems, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'productId' })
    product: Product;

    @Column()
    productId: string;
}
