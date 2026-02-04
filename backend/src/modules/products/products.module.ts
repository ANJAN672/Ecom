import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { UnsplashService } from '../../common/services/unsplash.service';

@Module({
    imports: [TypeOrmModule.forFeature([Product])],
    controllers: [ProductsController],
    providers: [ProductsService, UnsplashService],
    exports: [ProductsService], // Export for Cart and Orders modules
})
export class ProductsModule { }
