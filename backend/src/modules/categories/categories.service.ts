import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

/**
 * CategoriesService - Business logic for category operations
 */
@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category)
        private readonly categoriesRepository: Repository<Category>,
    ) { }

    /**
     * Create a new category
     */
    async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
        // Check if category name already exists
        const existingCategory = await this.categoriesRepository.findOne({
            where: { name: createCategoryDto.name },
        });

        if (existingCategory) {
            throw new ConflictException('Category with this name already exists');
        }

        const category = this.categoriesRepository.create(createCategoryDto);
        return this.categoriesRepository.save(category);
    }

    /**
     * Get all active categories
     */
    async findAll(): Promise<Category[]> {
        return this.categoriesRepository.find({
            where: { isActive: true },
            order: { name: 'ASC' },
        });
    }

    /**
     * Get all categories (including inactive) - for admin
     */
    async findAllAdmin(): Promise<Category[]> {
        return this.categoriesRepository.find({
            order: { name: 'ASC' },
        });
    }

    /**
     * Get a single category by ID
     */
    async findOne(id: string): Promise<Category> {
        const category = await this.categoriesRepository.findOne({
            where: { id },
        });

        if (!category) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }

        return category;
    }

    /**
     * Get category with its products
     */
    async findOneWithProducts(id: string): Promise<Category> {
        const category = await this.categoriesRepository.findOne({
            where: { id },
            relations: ['products'],
        });

        if (!category) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }

        return category;
    }

    /**
     * Update a category
     */
    async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
        const category = await this.findOne(id);

        // Check if new name conflicts with existing category
        if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
            const existingCategory = await this.categoriesRepository.findOne({
                where: { name: updateCategoryDto.name },
            });
            if (existingCategory) {
                throw new ConflictException('Category with this name already exists');
            }
        }

        Object.assign(category, updateCategoryDto);
        return this.categoriesRepository.save(category);
    }

    /**
     * Delete a category
     * Note: Products in this category will have categoryId set to null
     */
    async remove(id: string): Promise<void> {
        const category = await this.findOne(id);
        await this.categoriesRepository.remove(category);
    }
}
