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
import { Address } from '../../addresses/entities/address.entity';
import { OrderItem } from './order-item.entity';
import { OrderStatus, PaymentMethod, PaymentStatus } from '../../../common/enums';

/**
 * Order Entity - Represents a placed order
 * 
 * Order Flow:
 * 1. User checks out with cart items
 * 2. Order created with PENDING status
 * 3. Status updates as order progresses
 * 
 * Note: We store a COPY of address details, not a reference
 * This is because if user changes address later, the order
 * should still show the original delivery address
 */
@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /**
     * Order number - Human readable identifier
     * Format: ORD-YYYYMMDD-XXXXX (generated in service)
     */
    @Column({ unique: true })
    orderNumber: string;

    @Column({
        type: 'enum',
        enum: OrderStatus,
        default: OrderStatus.PENDING,
    })
    status: OrderStatus;

    @Column({
        type: 'enum',
        enum: PaymentMethod,
    })
    paymentMethod: PaymentMethod;

    @Column({
        type: 'enum',
        enum: PaymentStatus,
        default: PaymentStatus.PENDING,
    })
    paymentStatus: PaymentStatus;

    /**
     * Total amount for the order
     * Calculated from order items at checkout time
     */
    @Column({ type: 'decimal', precision: 12, scale: 2 })
    totalAmount: number;

    // Shipping Address (COPY of address at time of order)
    @Column({ length: 100 })
    shippingName: string;

    @Column({ length: 15 })
    shippingPhone: string;

    @Column({ length: 255 })
    shippingAddressLine1: string;

    @Column({ length: 255, nullable: true })
    shippingAddressLine2: string;

    @Column({ length: 100 })
    shippingCity: string;

    @Column({ length: 100 })
    shippingState: string;

    @Column({ length: 10 })
    shippingPinCode: string;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Relationship: Many orders belong to one user
    @ManyToOne(() => User, (user) => user.orders, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: string;

    // One order has many order items
    @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
    orderItems: OrderItem[];
}
