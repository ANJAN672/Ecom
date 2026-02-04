import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';

/**
 * AddressesService - Manages user addresses
 * 
 * Features:
 * - Multiple addresses per user (like Amazon)
 * - Default address management
 * - User can only access their own addresses
 */
@Injectable()
export class AddressesService {
    constructor(
        @InjectRepository(Address)
        private readonly addressesRepository: Repository<Address>,
    ) { }

    /**
     * Create a new address for a user
     * 
     * If this is the first address or isDefault is true,
     * we need to ensure only one default address exists
     */
    async create(createAddressDto: CreateAddressDto, userId: string): Promise<Address> {
        // Count existing addresses
        const existingCount = await this.addressesRepository.count({
            where: { userId },
        });

        // If this is the first address, make it default
        if (existingCount === 0) {
            createAddressDto.isDefault = true;
        }

        // If setting as default, unset other defaults first
        if (createAddressDto.isDefault) {
            await this.unsetDefaultAddresses(userId);
        }

        const address = this.addressesRepository.create({
            ...createAddressDto,
            userId,
        });

        return this.addressesRepository.save(address);
    }

    /**
     * Get all addresses for a user
     */
    async findAll(userId: string): Promise<Address[]> {
        return this.addressesRepository.find({
            where: { userId },
            order: { isDefault: 'DESC', createdAt: 'DESC' },
        });
    }

    /**
     * Get a single address
     */
    async findOne(id: string, userId: string): Promise<Address> {
        const address = await this.addressesRepository.findOne({
            where: { id },
        });

        if (!address) {
            throw new NotFoundException(`Address with ID ${id} not found`);
        }

        // Check ownership
        if (address.userId !== userId) {
            throw new ForbiddenException('You can only access your own addresses');
        }

        return address;
    }

    /**
     * Get default address for a user
     */
    async findDefault(userId: string): Promise<Address | null> {
        return this.addressesRepository.findOne({
            where: { userId, isDefault: true },
        });
    }

    /**
     * Update an address
     */
    async update(id: string, updateAddressDto: UpdateAddressDto, userId: string): Promise<Address> {
        const address = await this.findOne(id, userId);

        // If setting as default, unset others
        if (updateAddressDto.isDefault) {
            await this.unsetDefaultAddresses(userId);
        }

        Object.assign(address, updateAddressDto);
        return this.addressesRepository.save(address);
    }

    /**
     * Set an address as default
     */
    async setDefault(id: string, userId: string): Promise<Address> {
        const address = await this.findOne(id, userId);

        // Unset all other defaults
        await this.unsetDefaultAddresses(userId);

        address.isDefault = true;
        return this.addressesRepository.save(address);
    }

    /**
     * Delete an address
     */
    async remove(id: string, userId: string): Promise<void> {
        const address = await this.findOne(id, userId);

        const wasDefault = address.isDefault;
        await this.addressesRepository.remove(address);

        // If we deleted the default, make another one default
        if (wasDefault) {
            const remaining = await this.addressesRepository.findOne({
                where: { userId },
                order: { createdAt: 'DESC' },
            });

            if (remaining) {
                remaining.isDefault = true;
                await this.addressesRepository.save(remaining);
            }
        }
    }

    /**
     * Helper: Unset all default addresses for a user
     */
    private async unsetDefaultAddresses(userId: string): Promise<void> {
        await this.addressesRepository.update(
            { userId, isDefault: true },
            { isDefault: false },
        );
    }
}
