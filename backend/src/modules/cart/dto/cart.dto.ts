import { IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Cart DTOs
 */

export class AddToCartDto {
    @IsNotEmpty({ message: 'Product ID is required' })
    @IsUUID('4', { message: 'Invalid product ID' })
    productId: string;

    @IsNumber()
    @Min(1, { message: 'Quantity must be at least 1' })
    @Type(() => Number)
    quantity: number = 1;
}

export class UpdateCartItemDto {
    @IsNumber()
    @Min(1, { message: 'Quantity must be at least 1' })
    @Type(() => Number)
    quantity: number;
}
