import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { CartItem } from './entities/cart-item.entity';
import { ProductsModule } from '../products/products.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([CartItem]),
        ProductsModule, // Need ProductsService for stock validation
    ],
    controllers: [CartController],
    providers: [CartService],
    exports: [CartService], // Export for Orders module (checkout)
})
export class CartModule { }
