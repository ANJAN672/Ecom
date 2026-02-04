import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { UserRole } from '../../common/enums';

/**
 * UsersService - Handles all user-related business logic
 * 
 * @Injectable() marks this as a NestJS provider
 * @InjectRepository() injects the TypeORM repository for User entity
 * 
 * Why Repository Pattern?
 * - Abstracts database operations
 * - TypeORM provides CRUD methods (find, save, delete, etc.)
 * - Easy to mock for testing
 */
@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) { }

    /**
     * Create a new user
     * 
     * Flow:
     * 1. Check if email already exists
     * 2. Hash the password (NEVER store plain text!)
     * 3. Create and save user
     */
    async create(createUserDto: CreateUserDto): Promise<User> {
        // Check for existing email
        const existingUser = await this.usersRepository.findOne({
            where: { email: createUserDto.email },
        });

        if (existingUser) {
            throw new ConflictException('Email already registered');
        }

        // Hash password with bcrypt
        // Salt rounds: 10 is a good balance of security and speed
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

        // Create user instance
        const user = this.usersRepository.create({
            ...createUserDto,
            password: hashedPassword,
        });

        // Save to database and return
        return this.usersRepository.save(user);
    }

    /**
     * Find all users
     * Note: Pagination should be added for production
     */
    async findAll(): Promise<User[]> {
        return this.usersRepository.find();
    }

    /**
     * Find one user by ID
     */
    async findOne(id: string): Promise<User> {
        const user = await this.usersRepository.findOne({
            where: { id },
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return user;
    }

    /**
     * Find user by email (used for login)
     * Note: We need to select password explicitly here
     */
    async findByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOne({
            where: { email },
            select: ['id', 'firstName', 'lastName', 'email', 'password', 'role', 'isActive'],
        });
    }

    /**
     * Update user profile
     */
    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.findOne(id);

        // Check if new email already exists (if email is being changed)
        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const existingUser = await this.usersRepository.findOne({
                where: { email: updateUserDto.email },
            });
            if (existingUser) {
                throw new ConflictException('Email already in use');
            }
        }

        // Merge updates with existing user
        Object.assign(user, updateUserDto);

        return this.usersRepository.save(user);
    }

    /**
     * Upgrade user to seller role
     */
    async becomeSeller(id: string): Promise<User> {
        const user = await this.findOne(id);
        user.role = UserRole.SELLER;
        return this.usersRepository.save(user);
    }

    /**
     * Delete user (soft delete could be added)
     */
    async remove(id: string): Promise<void> {
        const user = await this.findOne(id);
        await this.usersRepository.remove(user);
    }
}
