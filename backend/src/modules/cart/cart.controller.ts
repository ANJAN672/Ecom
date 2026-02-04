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
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * CartController - Shopping cart endpoints
 * 
 * All routes are protected - cart is tied to user account
 */
@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
    constructor(private readonly cartService: CartService) { }

    /**
     * POST /cart
     * Add item to cart
     */
    @Post()
    addToCart(@Body() addToCartDto: AddToCartDto, @Request() req) {
        return this.cartService.addToCart(addToCartDto, req.user.userId);
    }

    /**
     * GET /cart
     * Get cart contents with totals
     */
    @Get()
    getCart(@Request() req) {
        return this.cartService.getCart(req.user.userId);
    }

    /**
     * GET /cart/validate
     * Validate cart for checkout (check stock availability)
     */
    @Get('validate')
    validateCart(@Request() req) {
        return this.cartService.validateCartForCheckout(req.user.userId);
    }

    /**
     * PATCH /cart/:id
     * Update cart item quantity
     */
    @Patch(':id')
    updateQuantity(
        @Param('id') id: string,
        @Body() updateDto: UpdateCartItemDto,
        @Request() req,
    ) {
        return this.cartService.updateQuantity(id, updateDto, req.user.userId);
    }

    /**
     * DELETE /cart/:id
     * Remove item from cart
     */
    @Delete(':id')
    removeFromCart(@Param('id') id: string, @Request() req) {
        return this.cartService.removeFromCart(id, req.user.userId);
    }

    /**
     * DELETE /cart
     * Clear entire cart
     */
    @Delete()
    clearCart(@Request() req) {
        return this.cartService.clearCart(req.user.userId);
    }
}
