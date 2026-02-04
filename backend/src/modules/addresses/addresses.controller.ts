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
import { AddressesService } from './addresses.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * AddressesController - Handles address-related HTTP requests
 * 
 * All routes are protected - users can only manage their own addresses
 */
@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressesController {
    constructor(private readonly addressesService: AddressesService) { }

    /**
     * POST /addresses
     * Create a new address
     */
    @Post()
    create(@Body() createAddressDto: CreateAddressDto, @Request() req) {
        return this.addressesService.create(createAddressDto, req.user.userId);
    }

    /**
     * GET /addresses
     * Get all addresses for current user
     */
    @Get()
    findAll(@Request() req) {
        return this.addressesService.findAll(req.user.userId);
    }

    /**
     * GET /addresses/default
     * Get the default address
     */
    @Get('default')
    findDefault(@Request() req) {
        return this.addressesService.findDefault(req.user.userId);
    }

    /**
     * GET /addresses/:id
     * Get a single address
     */
    @Get(':id')
    findOne(@Param('id') id: string, @Request() req) {
        return this.addressesService.findOne(id, req.user.userId);
    }

    /**
     * PATCH /addresses/:id
     * Update an address
     */
    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateAddressDto: UpdateAddressDto,
        @Request() req,
    ) {
        return this.addressesService.update(id, updateAddressDto, req.user.userId);
    }

    /**
     * PATCH /addresses/:id/set-default
     * Set an address as default
     */
    @Patch(':id/set-default')
    setDefault(@Param('id') id: string, @Request() req) {
        return this.addressesService.setDefault(id, req.user.userId);
    }

    /**
     * DELETE /addresses/:id
     * Delete an address
     */
    @Delete(':id')
    remove(@Param('id') id: string, @Request() req) {
        return this.addressesService.remove(id, req.user.userId);
    }
}
