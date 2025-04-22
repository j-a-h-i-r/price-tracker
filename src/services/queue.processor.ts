import { ExternalManufacturer, ProductJob } from '../types/product.types.js';
import { ProductService } from './product.service.js';
import logger from '../core/logger.js';
import { queueEvent, parseEvent } from '../events.js';
import { Queue } from './queue.js';

/**
 * TODO: Make a dedicate queue class that works on a batch
 * The queue class should do the following:
 * 1/ Add jobs to the queue
 * 2/ Register processors for the queue
 * 3/ If the batch is full or the max wait time is reached, send batches to the processor
 */
export class QueueProcessor {
    private readonly BATCH_SIZE = 15;
    private readonly MAX_WAIT_MILLIS = 10 * 1000;
    private readonly productService: ProductService;
    private queue: Queue

    constructor() {
        this.queue = new Queue(this.processBatch.bind(this), {
            batchSize: this.BATCH_SIZE,
            maxWaitMillis: this.MAX_WAIT_MILLIS,
        });
        this.productService = new ProductService();
        this.setupEventListener();
    }

    private setupEventListener() {
        queueEvent.subscribe(async (job: ProductJob) => {
            logger.debug(`Received job to process. Product name ${job.name}`);
            logger.debug('Adding product in queue to process');
            this.queue.add(job);
        });

        parseEvent.subscribe(async (totalScrapedProducts: number) => {
            logger.info(`Parsing done. Scraped ${totalScrapedProducts} products`);
            await this.processScrapedProducts();
        });
    }

    // TODO: Run this method on a schedule
    private async processScrapedProducts() {
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

        // Sync metadata. here's the following to keep in mind:
        // 1. If a metadata is parsed from external websites, it should be updated 
        // in the internal products table
        // 2. If we have manually overriden a metadata, it should not be updated
        try {
            await this.productService.saveNormalizedMetadata();
        } catch (error) {
            logger.error(error, 'Failed to save normalized metadata');
        }
    }

    private async processBatch(products: ProductJob[]): Promise<void> {
        logger.info(`Processing batch of ${products.length} jobs`);
        if (products.length === 0) {
            logger.info('No products to process');
            return;
        }
        try {
            logger.info(products, 'Batch being processed');
            
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
