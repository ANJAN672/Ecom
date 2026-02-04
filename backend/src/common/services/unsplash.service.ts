import { Injectable, Logger } from '@nestjs/common';

/**
 * UnsplashService - Fetches images from Unsplash API
 * 
 * API Documentation: https://unsplash.com/documentation
 * 
 * Why Unsplash?
 * - High-quality, free images
 * - Good for product mockups
 * - Easy to use API
 * 
 * Rate Limits (Demo):
 * - 50 requests per hour
 * - Apply for production for 5000/hour
 */
@Injectable()
export class UnsplashService {
    private readonly logger = new Logger(UnsplashService.name);
    private readonly accessKey: string;
    private readonly baseUrl = 'https://api.unsplash.com';

    constructor() {
        this.accessKey = process.env.UNSPLASH_ACCESS_KEY || '';

        if (!this.accessKey) {
            this.logger.warn('UNSPLASH_ACCESS_KEY not found in environment variables');
        }
    }

    /**
     * Search for an image on Unsplash
     * 
     * @param query - Search term (e.g., "laptop", "shoes", "book")
     * @returns Image URL or null if not found
     * 
     * How it works:
     * 1. Search Unsplash for the query
     * 2. Return the first result's regular-sized image
     * 3. Fall back to null if no results
     */
    async searchImage(query: string): Promise<string | null> {
        if (!this.accessKey) {
            this.logger.warn('Cannot search Unsplash: No API key configured');
            return null;
        }

        try {
            const url = `${this.baseUrl}/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Client-ID ${this.accessKey}`,
                },
            });

            if (!response.ok) {
                this.logger.error(`Unsplash API error: ${response.status} ${response.statusText}`);
                return null;
            }

            const data = await response.json();

            if (data.results && data.results.length > 0) {
                const photo = data.results[0];

                // Trigger download endpoint as per Unsplash guidelines
                await this.triggerDownload(photo.links.download_location);

                // Return the regular sized image (good balance of quality/size)
                return photo.urls.regular;
            }

            return null;
        } catch (error) {
            this.logger.error(`Error searching Unsplash: ${error.message}`);
            return null;
        }
    }

    /**
     * Get a random image from Unsplash
     * 
     * @param query - Optional query to filter results
     * @returns Image URL or null
     */
    async getRandomImage(query?: string): Promise<string | null> {
        if (!this.accessKey) {
            return null;
        }

        try {
            let url = `${this.baseUrl}/photos/random?orientation=landscape`;
            if (query) {
                url += `&query=${encodeURIComponent(query)}`;
            }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Client-ID ${this.accessKey}`,
                },
            });

            if (!response.ok) {
                return null;
            }

            const photo = await response.json();

            // Trigger download as per guidelines
            await this.triggerDownload(photo.links.download_location);

            return photo.urls.regular;
        } catch (error) {
            this.logger.error(`Error getting random image: ${error.message}`);
            return null;
        }
    }

    /**
     * Trigger download event (required by Unsplash API guidelines)
     * This tracks downloads for photographers
     */
    private async triggerDownload(downloadLocation: string): Promise<void> {
        try {
            await fetch(`${downloadLocation}?client_id=${this.accessKey}`);
        } catch (error) {
            // Non-critical, just log it
            this.logger.debug(`Could not trigger download: ${error.message}`);
        }
    }
}
