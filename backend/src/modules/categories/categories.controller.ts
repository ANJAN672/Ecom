import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * CategoriesController - Handles category-related HTTP requests
 * 
 * Public routes: GET (anyone can browse categories)
 * Protected routes: POST, PATCH, DELETE (sellers only in real app)
 */
@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    /**
     * POST /categories
     * Create a new category
     */
    @Post()
    @UseGuards(JwtAuthGuard)
    create(@Body() createCategoryDto: CreateCategoryDto) {
        return this.categoriesService.create(createCategoryDto);
    }

    /**
     * GET /categories
     * Get all active categories (public)
     */
    @Get()
    findAll() {
        return this.categoriesService.findAll();
    }

    /**
     * GET /categories/:id
     * Get a single category
     */
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.categoriesService.findOne(id);
    }

    /**
     * GET /categories/:id/products
     * Get category with its products
     */
    @Get(':id/products')
    findOneWithProducts(@Param('id') id: string) {
        return this.categoriesService.findOneWithProducts(id);
    }

    /**
     * PATCH /categories/:id
     * Update a category
     */
    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
        return this.categoriesService.update(id, updateCategoryDto);
    }

    /**
     * DELETE /categories/:id
     * Delete a category
     */
    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    remove(@Param('id') id: string) {
        return this.categoriesService.remove(id);
    }
}
