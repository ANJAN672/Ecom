import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from './config/database.config';

// Feature Modules (will create these next)
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { CartModule } from './modules/cart/cart.module';
import { OrdersModule } from './modules/orders/orders.module';

/**
 * AppModule - Root module of the application
 * 
 * Module Imports Explained:
 * 
 * 1. ConfigModule.forRoot()
 *    - Loads .env file into process.env
 *    - isGlobal: true makes it available everywhere without re-importing
 * 
 * 2. TypeOrmModule.forRoot()
 *    - Configures database connection
 *    - Uses our databaseConfig factory
 * 
 * 3. Feature Modules
 *    - Each module handles a specific feature (users, products, etc.)
 *    - Keeps code organized and maintainable
 */
@Module({
  imports: [
    // Load environment variables from .env file
    ConfigModule.forRoot({
      isGlobal: true, // Available in all modules without importing
      envFilePath: '.env',
    }),

    // Configure TypeORM with PostgreSQL
    TypeOrmModule.forRoot(databaseConfig()),

    // Feature modules
    UsersModule,
    AuthModule,
    CategoriesModule,
    ProductsModule,
    AddressesModule,
    CartModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
