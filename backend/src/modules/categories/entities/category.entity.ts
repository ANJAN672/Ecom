import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';

/**
 * Category Entity - Represents product categories
 * 
 * This is a separate table (Option B you chose) which allows:
 * - CRUD operations on categories
 * - Filter products by category
 * - Category management without modifying products
 */
@Entity('categories')
export class Category {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true, length: 100 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ nullable: true })
    imageUrl: string;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // One category has many products
    @OneToMany(() => Product, (product) => product.category)
    products: Product[];
}
