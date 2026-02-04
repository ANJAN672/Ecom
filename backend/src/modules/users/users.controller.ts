import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * UsersController - Handles HTTP requests for /users routes
 * 
 * Decorators Explained:
 * @Controller('users') - All routes prefixed with /users
 * @Get(), @Post(), etc. - HTTP method decorators
 * @Param('id') - Extract URL parameter
 * @Body() - Extract request body
 * @UseGuards() - Protect route with authentication
 * @Request() - Access the request object (contains user after auth)
 */
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    /**
     * GET /users
     * Get all users (should be admin-only in production)
     */
    @Get()
    @UseGuards(JwtAuthGuard)
    findAll() {
        return this.usersService.findAll();
    }

    /**
     * GET /users/me
     * Get current logged-in user's profile
     */
    @Get('me')
    @UseGuards(JwtAuthGuard)
    getProfile(@Request() req) {
        return this.usersService.findOne(req.user.userId);
    }

    /**
     * GET /users/:id
     * Get a specific user by ID
     */
    @Get(':id')
    @UseGuards(JwtAuthGuard)
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }

    /**
     * PATCH /users/me
     * Update current user's profile
     */
    @Patch('me')
    @UseGuards(JwtAuthGuard)
    updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(req.user.userId, updateUserDto);
    }

    /**
     * POST /users/become-seller
     * Upgrade current user to seller role
     */
    @Post('become-seller')
    @UseGuards(JwtAuthGuard)
    becomeSeller(@Request() req) {
        return this.usersService.becomeSeller(req.user.userId);
    }

    /**
     * DELETE /users/:id
     * Delete a user (should be admin-only or self-only)
     */
    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }
}
