import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto, LoginDto } from './dto/auth.dto';

/**
 * AuthController - Handles authentication endpoints
 * 
 * Endpoints:
 * - POST /auth/signup - Register new user
 * - POST /auth/login - Authenticate user
 * 
 * Note: These routes are NOT protected (users need to login first!)
 */
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    /**
     * POST /auth/signup
     * Register a new user
     * 
     * @HttpCode(HttpStatus.CREATED) - Return 201 status on success
     */
    @Post('signup')
    @HttpCode(HttpStatus.CREATED)
    async signup(@Body() signupDto: SignupDto) {
        return this.authService.signup(signupDto);
    }

    /**
     * POST /auth/login
     * Authenticate user and return JWT token
     * 
     * @HttpCode(HttpStatus.OK) - Return 200 status (not 201 for POST)
     */
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }
}
