import {
    IsNotEmpty,
    IsString,
    IsOptional,
    IsBoolean,
    IsEnum,
    MaxLength,
    Matches,
} from 'class-validator';
import { AddressType } from '../../../common/enums';

/**
 * Address DTOs
 */

export class CreateAddressDto {
    @IsNotEmpty({ message: 'Full name is required' })
    @IsString()
    @MaxLength(100)
    fullName: string;

    @IsNotEmpty({ message: 'Phone number is required' })
    @IsString()
    @Matches(/^[0-9]{10}$/, { message: 'Phone number must be 10 digits' })
    phoneNumber: string;

    @IsNotEmpty({ message: 'Address line 1 is required' })
    @IsString()
    @MaxLength(255)
    addressLine1: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    addressLine2?: string;

    @IsNotEmpty({ message: 'City is required' })
    @IsString()
    @MaxLength(100)
    city: string;

    @IsNotEmpty({ message: 'State is required' })
    @IsString()
    @MaxLength(100)
    state: string;

    @IsNotEmpty({ message: 'PIN code is required' })
    @IsString()
    @Matches(/^[0-9]{6}$/, { message: 'PIN code must be 6 digits' })
    pinCode: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    landmark?: string;

    @IsOptional()
    @IsEnum(AddressType)
    type?: AddressType = AddressType.HOME;

    @IsOptional()
    @IsBoolean()
    isDefault?: boolean = false;
}

export class UpdateAddressDto {
    @IsOptional()
    @IsString()
    @MaxLength(100)
    fullName?: string;

    @IsOptional()
    @IsString()
    @Matches(/^[0-9]{10}$/, { message: 'Phone number must be 10 digits' })
    phoneNumber?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    addressLine1?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    addressLine2?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    city?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    state?: string;

    @IsOptional()
    @IsString()
    @Matches(/^[0-9]{6}$/, { message: 'PIN code must be 6 digits' })
    pinCode?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    landmark?: string;

    @IsOptional()
    @IsEnum(AddressType)
    type?: AddressType;

    @IsOptional()
    @IsBoolean()
    isDefault?: boolean;
}
