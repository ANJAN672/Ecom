import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { UserRole } from '../../../common/enums';
import { Address } from '../../addresses/entities/address.entity';
import { Product } from '../../products/entities/product.entity';
import { CartItem } from '../../cart/entities/cart-item.entity';
import { Order } from '../../orders/entities/order.entity';

/**
 * User Entity - Represents a user in the system
 * 
 * TypeORM Decorators Explained:
 * - @Entity() - Marks this class as a database table
 * - @PrimaryGeneratedColumn('uuid') - Auto-generated UUID primary key
 * - @Column() - Regular column, can specify type, uniqueness, etc.
 * - @CreateDateColumn() - Auto-set when record is created
 * - @UpdateDateColumn() - Auto-updated when record is modified
 * - @OneToMany() - One user has many addresses/products/etc.
 */
@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 50 })
    firstName: string;

    @Column({ length: 50 })
    lastName: string;

    @Column({ unique: true })
    email: string;

    @Column({ select: false }) // Won't be returned in queries by default (security)
    password: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.CUSTOMER,
    })
    role: UserRole;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Relationships
    // A user can have multiple addresses
    @OneToMany(() => Address, (address) => address.user)
    addresses: Address[];

    // A seller can have multiple products
    @OneToMany(() => Product, (product) => product.seller)
    products: Product[];

    // A user can have multiple cart items
    @OneToMany(() => CartItem, (cartItem) => cartItem.user)
    cartItems: CartItem[];

    // A user can have multiple orders
    @OneToMany(() => Order, (order) => order.user)
    orders: Order[];
}
