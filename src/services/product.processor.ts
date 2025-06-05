import { ExternalManufacturer, ProductJob } from '../types/product.types.js';
import { ProductService } from './product.service.js';
import logger from '../core/logger.js';
import { Writable } from 'stream';
import { sendEmailForTrackedProducts } from './pricetrack.service.js';
import { cache } from '../core/cache.js';

export class ScrapedProductsProcessor extends Writable {
    private readonly productService: ProductService;

    constructor() {
        super({ objectMode: true });
        this.productService = new ProductService();
    }

    /**
     * Will be triggered when a new batch of products is received
     * @param products 
     * @param encoding 
     * @param callback 
     */
    _write(products: ProductJob[], encoding: BufferEncoding, callback?: (error: Error | null | undefined) => void) {
        logger.info(`Received batch of ${products.length} products`);
        this.processBatch(products)
        .then(() => {
            logger.info(`Successfully processed batch of ${products.length} products`);
        }).catch((error) => {
            logger.error(error, 'Failed to process batch');
        }).finally(() => {
            // Don't want to stop the streaming by throwing an error
            // So we just log the error and call the callback with null
            callback?.(null);
        });
    }

    /**
     * Will be triggered when the stream is finished
     * https://github.com/nodejs/node/pull/12828
     * @param cb 
     * @returns 
     */
    _final(callback: (error?: Error | null) => void): void {
        logger.info('Finished processing all products');
        this.postProcessScrapedProducts().then(() => {
            logger.info('Finished processing all products');
        }).catch((error) => {
            logger.error(error, 'Failed to process all products');
        }).finally(() => {
            callback();
        });
    }

    private async postProcessScrapedProducts() {
        // Scraping session is done.

        try {
            logger.info('Refreshing latest prices materialized view');
            this.productService.refreshLatestPricesMaterializedView();
        } catch (error) {
            logger.error(error, 'Failed to refresh latest prices materialized view');
        }

        // First let's sync the manufacturers. We stored the external manufacturers for
        // each batch. Now we'll sync all the new manufacturers with the internal manufacturers
        // and associate the external manufacturers with the internal manufacturers
        try {
            logger.info('Syncing external and internal manufacturers');
            await this.productService.syncManufacturers();
        } catch (error) {
            logger.error(error, 'Failed to sync manufacturers');
        }

        try {
            logger.info('Syncing external products');
            await this.productService.syncProducts();
        } catch (error) {
            logger.error(error, 'Failed to sync external products');
        }

        try {
            await this.productService.saveNormalizedMetadata();
        } catch (error) {
            logger.error(error, 'Failed to save normalized metadata');
        }

        // Calculate the similar products, associate them if the similarity is high enough
        // and clean up the similar products for non-existing internal products
        try {
            await this.productService.storePossibleSimilarProducts();
            await this.productService.autoMergeHighlySimilarProducts();
            await this.productService.cleanUpSimilarProductsForNonExistingInternalProducts();
        } catch (error) {
            logger.error(error, 'Failed to store possible similar products');
        }

        // Invalidate the cache for the products
        try {
            logger.info('Invalidating cache for products');
            cache.clear();
        } catch (error) {
            logger.error(error, 'Failed to invalidate cache for products');
        }

        setTimeout(() => {
            logger.info('Finished processing all products. Checkign for tracked products');
            sendEmailForTrackedProducts();
        }
        , 1000);
    }

    /**
     * Process a batch of products
     * @param products 
     */
    private async processBatch(products: ProductJob[]): Promise<void> {
        logger.info(`Processing batch of ${products.length} jobs`);
        if (products.length === 0) {
            logger.info('No products to process');
            return;
        }
        try {
            // Save the manufacturers in DB

            const manufacturers: Omit<ExternalManufacturer, 'id'>[] = products.map((product) => {
                return {
                    name: product.manufacturer,
                    website_id: product.website_id,
                };
            });

            // Save raw external manufacturers in DB
            // If its a new manufacturer it will have null as the internal manufacturer id
            await this.productService.saveExternalManufacturers(manufacturers);

            // This is the only place where we know the name of the manufacturer for an external product
            // So we'll fetch the external manufacturers and get the external manufacturer id
            const manufacturersWebsiteMap = await this.productService.getExternalManufacturerMap();
            const productsWithManufacturerId = products.map((product) => {
                const externalManufacturerId = manufacturersWebsiteMap
                    .get(product.manufacturer)!
                    .get(product.website_id)!
                    .id!;
                return {
                    ...product,
                    external_manufacturer_id: externalManufacturerId,
                };
            });

            const savedProducts = await this.productService.saveExternalProducts(productsWithManufacturerId);
            await this.productService.savePrices(savedProducts);

            logger.info(`Successfully processed batch of ${products.length} products`);
        } catch (error) {
            logger.error(error, 'Failed to process batch');
            logger.error(products, 'Batch of products that failed to process');
        }
    }
}
