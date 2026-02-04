import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';

/**
 * UsersModule - Bundles together user-related components
 * 
 * Module Structure:
 * - imports: Other modules this module depends on
 * - controllers: Request handlers for this module
 * - providers: Services, guards, etc. for this module
 * - exports: What this module makes available to other modules
 * 
 * TypeOrmModule.forFeature([User]):
 * - Registers the User entity repository for this module
 * - Allows UsersService to inject the User repository
 */
@Module({
    imports: [
        TypeOrmModule.forFeature([User]), // Register User repository
    ],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService], // Other modules can use UsersService
})
export class UsersModule { }
