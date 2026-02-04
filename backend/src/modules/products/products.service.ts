import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto, UpdateProductDto, UpdateStockDto, ProductQueryDto } from './dto/product.dto';
import { UnsplashService } from '../../common/services/unsplash.service';
import { UserRole } from '../../common/enums';

/**
 * ProductsService - Core business logic for products
 * 
 * Key Features:
 * - CRUD operations
 * - Stock management (out-of-stock handling)
 * - Search and filtering
 * - Unsplash image integration
 * - Seller authorization
 */
@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private readonly productsRepository: Repository<Product>,
        private readonly unsplashService: UnsplashService,
    ) { }

    /**
     * Create a new product
     * 
     * Flow:
     * 1. If no imageUrl but imageSearchTerm provided, fetch from Unsplash
     * 2. Set isInStock based on stockQuantity
     * 3. Save product
     */
    async create(createProductDto: CreateProductDto, sellerId: string): Promise<Product> {
        let imageUrl: string | undefined = createProductDto.imageUrl;

        // Fetch image from Unsplash if search term provided
        if (!imageUrl && createProductDto.imageSearchTerm) {
            const fetchedImage = await this.unsplashService.searchImage(createProductDto.imageSearchTerm);
            imageUrl = fetchedImage ?? undefined;
        }

        // If still no image, try product name
        if (!imageUrl) {
            const fetchedImage = await this.unsplashService.searchImage(createProductDto.name);
            imageUrl = fetchedImage ?? undefined;
        }

        const product = this.productsRepository.create({
            ...createProductDto,
            imageUrl,
            sellerId,
            isInStock: createProductDto.stockQuantity > 0,
        });

        return this.productsRepository.save(product);
    }

    /**
     * Find all products with filtering, search, and pagination
     * 
     * Query Parameters:
     * - search: Search in product name
     * - categoryId: Filter by category
     * - inStock: Filter by stock availability
     * - minPrice/maxPrice: Price range filter
     * - page/limit: Pagination
     */
    async findAll(queryDto: ProductQueryDto) {
        const { search, categoryId, inStock, minPrice, maxPrice, page = 1, limit = 10 } = queryDto;

        // Build where clause dynamically
        const where: any = { isActive: true };

        if (search) {
            where.name = Like(`%${search}%`);
        }

        if (categoryId) {
            where.categoryId = categoryId;
        }

        if (inStock !== undefined) {
            where.isInStock = inStock;
        }

        // Price range filtering
        if (minPrice !== undefined && maxPrice !== undefined) {
            where.price = Between(minPrice, maxPrice);
        } else if (minPrice !== undefined) {
            where.price = MoreThanOrEqual(minPrice);
        } else if (maxPrice !== undefined) {
            where.price = LessThanOrEqual(maxPrice);
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Fetch products with relations
        const [products, total] = await this.productsRepository.findAndCount({
            where,
            relations: ['category', 'seller'],
            order: { createdAt: 'DESC' },
            skip,
            take: limit,
        });

        return {
            data: products,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Find one product by ID
     */
    async findOne(id: string): Promise<Product> {
        const product = await this.productsRepository.findOne({
            where: { id },
            relations: ['category', 'seller'],
        });

        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        return product;
    }

    /**
     * Get products by seller
     */
    async findBySeller(sellerId: string): Promise<Product[]> {
        return this.productsRepository.find({
            where: { sellerId },
            relations: ['category'],
            order: { createdAt: 'DESC' },
        });
    }

    /**
     * Update a product
     * Only the seller who created it can update
     */
    async update(
        id: string,
        updateProductDto: UpdateProductDto,
        userId: string,
        userRole: UserRole,
    ): Promise<Product> {
        const product = await this.findOne(id);

        // Check ownership (unless admin)
        if (product.sellerId !== userId) {
            throw new ForbiddenException('You can only update your own products');
        }

        // Update isInStock if stockQuantity is being updated
        if (updateProductDto.stockQuantity !== undefined) {
            updateProductDto['isInStock'] = updateProductDto.stockQuantity > 0;
        }

        Object.assign(product, updateProductDto);
        return this.productsRepository.save(product);
    }

    /**
     * Update stock quantity
     * 
     * This is a dedicated method for inventory management
     * Automatically updates isInStock flag
     */
    async updateStock(id: string, updateStockDto: UpdateStockDto, userId: string): Promise<Product> {
        const product = await this.findOne(id);

        if (product.sellerId !== userId) {
            throw new ForbiddenException('You can only update stock for your own products');
        }

        product.stockQuantity = updateStockDto.stockQuantity;
        product.isInStock = updateStockDto.stockQuantity > 0;

        return this.productsRepository.save(product);
    }

    /**
     * Decrease stock when item is purchased
     * Called during checkout process
     * 
     * @throws BadRequestException if not enough stock
     */
    async decreaseStock(id: string, quantity: number): Promise<Product> {
        const product = await this.findOne(id);

        if (product.stockQuantity < quantity) {
            throw new BadRequestException(
                `Not enough stock for "${product.name}". Available: ${product.stockQuantity}`,
            );
        }

        product.stockQuantity -= quantity;
        product.isInStock = product.stockQuantity > 0;

        return this.productsRepository.save(product);
    }

    /**
     * Increase stock (for restocking or order cancellation)
     */
    async increaseStock(id: string, quantity: number): Promise<Product> {
        const product = await this.findOne(id);

        product.stockQuantity += quantity;
        product.isInStock = true;

        return this.productsRepository.save(product);
    }

    /**
     * Delete a product
     * Only the seller who created it can delete
     */
    async remove(id: string, userId: string): Promise<void> {
        const product = await this.findOne(id);

        if (product.sellerId !== userId) {
            throw new ForbiddenException('You can only delete your own products');
        }

        await this.productsRepository.remove(product);
    }

    /**
     * Soft delete (deactivate) a product
     */
    async deactivate(id: string, userId: string): Promise<Product> {
        const product = await this.findOne(id);

        if (product.sellerId !== userId) {
            throw new ForbiddenException('You can only deactivate your own products');
        }

        product.isActive = false;
        return this.productsRepository.save(product);
    }
}
