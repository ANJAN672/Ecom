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
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * OrdersController - Order and checkout endpoints
 * 
 * All routes are protected
 */
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    /**
     * POST /orders
     * Create a new order (checkout)
     */
    @Post()
    create(@Body() createOrderDto: CreateOrderDto, @Request() req) {
        return this.ordersService.createOrder(createOrderDto, req.user.userId);
    }

    /**
     * GET /orders
     * Get all orders for current user
     */
    @Get()
    findAll(@Request() req) {
        return this.ordersService.findAllByUser(req.user.userId);
    }

    /**
     * GET /orders/:id
     * Get a single order by ID
     */
    @Get(':id')
    findOne(@Param('id') id: string, @Request() req) {
        return this.ordersService.findOne(id, req.user.userId);
    }

    /**
     * GET /orders/by-number/:orderNumber
     * Get order by order number (e.g., ORD-20260204-ABC12)
     */
    @Get('by-number/:orderNumber')
    findByOrderNumber(@Param('orderNumber') orderNumber: string, @Request() req) {
        return this.ordersService.findByOrderNumber(orderNumber, req.user.userId);
    }

    /**
     * PATCH /orders/:id/status
     * Update order status (for sellers)
     */
    @Patch(':id/status')
    updateStatus(
        @Param('id') id: string,
        @Body() updateStatusDto: UpdateOrderStatusDto,
        @Request() req,
    ) {
        return this.ordersService.updateStatus(id, updateStatusDto, req.user.userId);
    }

    /**
     * PATCH /orders/:id/cancel
     * Cancel an order
     */
    @Patch(':id/cancel')
    cancel(@Param('id') id: string, @Request() req) {
        return this.ordersService.cancelOrder(id, req.user.userId);
    }
}
