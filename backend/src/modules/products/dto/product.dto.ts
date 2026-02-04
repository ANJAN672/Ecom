import {
    IsNotEmpty,
    IsString,
    IsNumber,
    IsOptional,
    IsBoolean,
    IsPositive,
    Min,
    MaxLength,
    IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Product DTOs
 */

export class CreateProductDto {
    @IsNotEmpty({ message: 'Product name is required' })
    @IsString()
    @MaxLength(200)
    name: string;

    @IsNotEmpty({ message: 'Description is required' })
    @IsString()
    description: string;

    @IsNotEmpty({ message: 'Price is required' })
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Price must be a valid number with max 2 decimal places' })
    @IsPositive({ message: 'Price must be positive' })
    @Type(() => Number) // Transform string to number
    price: number;

    @IsNotEmpty({ message: 'Stock quantity is required' })
    @IsNumber()
    @Min(0, { message: 'Stock quantity cannot be negative' })
    @Type(() => Number)
    stockQuantity: number;

    @IsOptional()
    @IsUUID('4', { message: 'Invalid category ID' })
    categoryId?: string;

    @IsOptional()
    @IsString()
    imageUrl?: string;

    /**
     * Optional: Search term for Unsplash to auto-fetch image
     * If provided and no imageUrl, we'll search Unsplash
     */
    @IsOptional()
    @IsString()
    imageSearchTerm?: string;
}

export class UpdateProductDto {
    @IsOptional()
    @IsString()
    @MaxLength(200)
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    @Type(() => Number)
    price?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    stockQuantity?: number;

    @IsOptional()
    @IsUUID('4')
    categoryId?: string;

    @IsOptional()
    @IsString()
    imageUrl?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

/**
 * DTO for updating stock quantity specifically
 */
export class UpdateStockDto {
    @IsNotEmpty()
    @IsNumber()
    @Min(0, { message: 'Stock quantity cannot be negative' })
    @Type(() => Number)
    stockQuantity: number;
}

/**
 * Query params for filtering/searching products
 */
export class ProductQueryDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsUUID('4')
    categoryId?: string;

    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    inStock?: boolean;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    minPrice?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    maxPrice?: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    page?: number = 1;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    limit?: number = 10;
}
