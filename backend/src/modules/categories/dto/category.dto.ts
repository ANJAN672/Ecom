import { IsNotEmpty, IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

/**
 * Category DTOs
 */

export class CreateCategoryDto {
    @IsNotEmpty({ message: 'Category name is required' })
    @IsString()
    @MaxLength(100)
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    imageUrl?: string;
}

export class UpdateCategoryDto {
    @IsOptional()
    @IsString()
    @MaxLength(100)
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    imageUrl?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
