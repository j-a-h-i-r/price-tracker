import { ExternalManufacturer, ProductJob } from '../types/product.types.js';
import { ProductService } from './product.service.js';
import logger from '../core/logger.js';
import { Writable } from 'stream';

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
        // First let's normalize the manufacturers
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
            const manufacturersMap = await this.processAndPersistExternalManufacturers(products);
            const productsWithManufacturerIds = products.map((product) => ({
                ...product,
                external_manufacturer_id: manufacturersMap.get(product.website_id)!.get(product.manufacturer)!,
            }));
            const savedProducts = await this.productService.saveExternalProducts(productsWithManufacturerIds);
            await this.productService.savePrices(savedProducts);

            logger.info(`Successfully processed batch of ${products.length} products`);
        } catch (error) {
            logger.error(error, 'Failed to process batch');
        }
    }

    private async processAndPersistExternalManufacturers(products: ProductJob[]) {
        const manufacturersPerWebsite = new Map<number, Set<string>>();
        products.forEach((product) => {
            if (!manufacturersPerWebsite.has(product.website_id)) {
                manufacturersPerWebsite.set(product.website_id, new Set());
            }
            manufacturersPerWebsite.get(product.website_id)!.add(product.manufacturer);
        });
        const distinctManufacturers: Omit<ExternalManufacturer, 'id'>[] = [];
        manufacturersPerWebsite.forEach((manufacturers, website_id) => {
            manufacturers.forEach((manufacturer) => {
                distinctManufacturers.push({
                    name: manufacturer,
                    website_id,
                });
            });
        });
        // Save the manufacturers in the DB
        const manufacturersWebsiteMap = new Map<number, Map<string, number>>();
        if (distinctManufacturers.length === 0) {
            logger.info('No manufacturers to process');
            return manufacturersWebsiteMap;
        }
        const saved = await this.productService.saveExternalManufacturers(distinctManufacturers);
        saved.forEach((manufacturer) => {
            const { website_id, name, id } = manufacturer;
            if (!manufacturersWebsiteMap.has(website_id)) {
                manufacturersWebsiteMap.set(website_id, new Map());
            }
            manufacturersWebsiteMap.get(website_id)!.set(name, id);
        });
        return manufacturersWebsiteMap;
    }
}
