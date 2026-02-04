import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

/**
 * Auth DTOs - For login and signup validation
 */

/**
 * SignupDto - Same as CreateUserDto but specifically for registration
 */
export class SignupDto {
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
 * LoginDto - For user authentication
 */
export class LoginDto {
    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Please provide a valid email' })
    email: string;

    @IsNotEmpty({ message: 'Password is required' })
    @IsString()
    password: string;
}
