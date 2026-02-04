import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { AddressType } from '../../../common/enums';

/**
 * Address Entity - Stores user delivery addresses
 * 
 * Like Amazon, users can save multiple addresses
 * and select one during checkout
 */
@Entity('addresses')
export class Address {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // Recipient info (might be different from user)
    @Column({ length: 100 })
    fullName: string;

    @Column({ length: 15 })
    phoneNumber: string;

    @Column({ length: 255 })
    addressLine1: string;

    @Column({ length: 255, nullable: true })
    addressLine2: string;

    @Column({ length: 100 })
    city: string;

    @Column({ length: 100 })
    state: string;

    @Column({ length: 10 })
    pinCode: string;

    @Column({ length: 100, nullable: true })
    landmark: string;

    @Column({
        type: 'enum',
        enum: AddressType,
        default: AddressType.HOME,
    })
    type: AddressType;

    /**
     * Is this the default address for the user?
     * Only one address per user should be default
     */
    @Column({ default: false })
    isDefault: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Relationship: Many addresses belong to one user
    @ManyToOne(() => User, (user) => user.addresses, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: string;
}
