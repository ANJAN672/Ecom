import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Request,
    Query,
    ForbiddenException,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, UpdateStockDto, ProductQueryDto } from './dto/product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '../../common/enums';

/**
 * ProductsController - Handles product-related HTTP requests
 * 
 * Public Routes:
 * - GET /products - Browse all products
 * - GET /products/:id - View single product
 * 
 * Protected Routes (Seller only):
 * - POST /products - Create product
 * - PATCH /products/:id - Update product
 * - PATCH /products/:id/stock - Update stock
 * - DELETE /products/:id - Delete product
 */
@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    /**
     * POST /products
     * Create a new product (Seller only)
     */
    @Post()
    @UseGuards(JwtAuthGuard)
    create(@Body() createProductDto: CreateProductDto, @Request() req) {
        // Check if user is a seller
        if (req.user.role !== UserRole.SELLER) {
            throw new ForbiddenException('Only sellers can create products');
        }
        return this.productsService.create(createProductDto, req.user.userId);
    }

    /**
     * GET /products
     * Get all products with filtering (Public)
     * 
     * Query params: search, categoryId, inStock, minPrice, maxPrice, page, limit
     */
    @Get()
    findAll(@Query() queryDto: ProductQueryDto) {
        return this.productsService.findAll(queryDto);
    }

    /**
     * GET /products/my-products
     * Get products created by current seller
     */
    @Get('my-products')
    @UseGuards(JwtAuthGuard)
    findMyProducts(@Request() req) {
        return this.productsService.findBySeller(req.user.userId);
    }

    /**
     * GET /products/:id
     * Get a single product by ID (Public)
     */
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.productsService.findOne(id);
    }

    /**
     * PATCH /products/:id
     * Update a product (Owner only)
     */
    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    update(
        @Param('id') id: string,
        @Body() updateProductDto: UpdateProductDto,
        @Request() req,
    ) {
        return this.productsService.update(id, updateProductDto, req.user.userId, req.user.role);
    }

    /**
     * PATCH /products/:id/stock
     * Update product stock (Owner only)
     * 
     * Dedicated endpoint for inventory management
     */
    @Patch(':id/stock')
    @UseGuards(JwtAuthGuard)
    updateStock(
        @Param('id') id: string,
        @Body() updateStockDto: UpdateStockDto,
        @Request() req,
    ) {
        return this.productsService.updateStock(id, updateStockDto, req.user.userId);
    }

    /**
     * DELETE /products/:id
     * Soft delete (deactivate) a product (Owner only)
     */
    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    remove(@Param('id') id: string, @Request() req) {
        return this.productsService.deactivate(id, req.user.userId);
    }
}
