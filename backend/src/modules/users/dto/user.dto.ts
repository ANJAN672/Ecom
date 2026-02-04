import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../../../common/enums';

/**
 * DTOs (Data Transfer Objects) - Used for:
 * 1. Input validation (using class-validator decorators)
 * 2. Type safety for incoming request data
 * 3. API documentation (what data endpoints expect)
 * 
 * Why DTOs instead of using Entity directly?
 * - Entity may have fields we don't want user to set (like id, createdAt)
 * - We can have different DTOs for create vs update
 * - Decouples API contract from database schema
 */

/**
 * CreateUserDto - Used when registering a new user
 */
export class CreateUserDto {
    @IsNotEmpty({ message: 'First name is required' })
    @IsString()
    @MaxLength(50)
    firstName: string;

    @IsNotEmpty({ message: 'Last name is required' })
    @IsString()
    @MaxLength(50)
    lastName: string;

    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Please provide a valid email' })
    email: string;

    @IsNotEmpty({ message: 'Password is required' })
    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters' })
    password: string;
}

/**
 * UpdateUserDto - Used when updating user profile
 * All fields are optional (partial update)
 */
export class UpdateUserDto {
    @IsOptional()
    @IsString()
    @MaxLength(50)
    firstName?: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    lastName?: string;

    @IsOptional()
    @IsEmail({}, { message: 'Please provide a valid email' })
    email?: string;
}

/**
 * BecomeSeller DTO - When user wants to upgrade to seller role
 */
export class BecomeSellerDto {
    @IsEnum(UserRole)
    role: UserRole.SELLER;
}
