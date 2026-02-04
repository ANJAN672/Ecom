import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { SignupDto, LoginDto } from './dto/auth.dto';

/**
 * AuthService - Handles authentication logic
 * 
 * Responsibilities:
 * - User registration (signup)
 * - User authentication (login)
 * - JWT token generation
 */
@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) { }

    /**
     * Register a new user
     * 
     * Flow:
     * 1. Create user via UsersService
     * 2. Generate JWT token
     * 3. Return user info + token
     */
    async signup(signupDto: SignupDto) {
        // Create user (password hashing is done in UsersService)
        const user = await this.usersService.create(signupDto);

        // Generate JWT token
        const token = this.generateToken(user);

        // Return user info (without password) and token
        return {
            message: 'Registration successful',
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
            },
            accessToken: token,
        };
    }

    /**
     * Authenticate user and return JWT token
     * 
     * Flow:
     * 1. Find user by email
     * 2. Verify password with bcrypt
     * 3. Generate JWT token
     * 4. Return user info + token
     */
    async login(loginDto: LoginDto) {
        // Find user by email (with password field selected)
        const user = await this.usersService.findByEmail(loginDto.email);

        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }

        if (!user.isActive) {
            throw new UnauthorizedException('Account is deactivated');
        }

        // Compare provided password with hashed password
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid email or password');
        }

        // Generate JWT token
        const token = this.generateToken(user);

        return {
            message: 'Login successful',
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
            },
            accessToken: token,
        };
    }

    /**
     * Generate JWT token
     * 
     * Payload includes:
     * - sub: User ID (standard JWT claim for subject)
     * - email: User's email
     * - role: User's role (for authorization)
     * 
     * Why these claims?
     * - sub is standard for identifying the user
     * - email for display/validation
     * - role for authorization checks
     */
    private generateToken(user: any): string {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };

        return this.jwtService.sign(payload);
    }
}
