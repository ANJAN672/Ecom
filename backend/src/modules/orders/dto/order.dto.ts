import {
    IsNotEmpty,
    IsString,
    IsOptional,
    IsEnum,
    IsUUID,
    MaxLength,
} from 'class-validator';
import { PaymentMethod, OrderStatus } from '../../../common/enums';

/**
 * Order DTOs
 */

/**
 * DTO for creating an order (checkout)
 */
export class CreateOrderDto {
    @IsNotEmpty({ message: 'Shipping address is required' })
    @IsUUID('4', { message: 'Invalid address ID' })
    addressId: string;

    @IsNotEmpty({ message: 'Payment method is required' })
    @IsEnum(PaymentMethod, { message: 'Invalid payment method' })
    paymentMethod: PaymentMethod;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    notes?: string;
}

/**
 * DTO for updating order status (by seller)
 */
export class UpdateOrderStatusDto {
    @IsNotEmpty()
    @IsEnum(OrderStatus)
    status: OrderStatus;
}
