import { ExternalManufacturer, ExternalProduct, ProductJob } from '../types/product.types.js';
import { ProductService } from './product.service.js';
import logger from '../core/logger.js';
import { queueEvent, parseEvent } from '../events.js';

/**
 * TODO: Make a dedicate queue class that works on a batch
 * The queue class should do the following:
 * 1/ Add jobs to the queue
 * 2/ Register processors for the queue
 * 3/ If the batch is full or the max wait time is reached, send batches to the processor
 */
export class QueueProcessor {
    private jobs: ProductJob[] = [];
    private lastProcessedTime: number;
    private readonly BATCH_SIZE = 100;
    private readonly MAX_WAIT_MILLIS = 10 * 1000;
    private readonly productService: ProductService;
    private processing = false;
    private timer: NodeJS.Timeout | null = null;

    constructor() {
        this.lastProcessedTime = Date.now();
        this.productService = new ProductService();
        this.setupEventListener();
    }

    private setupEventListener() {
        queueEvent.subscribe(async (job: ProductJob) => {
            logger.debug(`Received job to process. Product name ${job.name}`);
            logger.debug('Adding product in queue to process');
            this.jobs.push(job);
            await this.processIfNeeded();
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

    private async getManufacturersMap(): Promise<Map<string, number>> {
        const manufacturers = await this.productService.getManufacturers();
        const map =  new Map<string, number>();
        manufacturers.forEach((manufacturer) => {
            map.set(manufacturer.name, manufacturer.id);
        });
        return map;
    }

    private processExternalProduct(product: ExternalProduct) {
        return {
            name: product.name,
            category_id: product.category_id,
            metadata: this.processMetadata(product),
        };
    }

    // TODO: Implement this method
    private processMetadata(product: ExternalProduct): Record<string, string> {
        if (product.category_id === 3) {
            return this.processTabletMetadata(product.raw_metadata);
        } else {
            return product.raw_metadata;
        }
    }

    // TODO: Implement this method
    private processTabletMetadata(metadata: Record<string, string>): Record<string, string> {
        return metadata;
    }

    private async processIfNeeded(): Promise<void> {
        if (this.processing) return;
        
        /**
         * We set the timer in only one condition. That is when the batch size is not reached
         * and the max wait time is not reached.
         * And it is set in shouldProcessBatch method
         * Since we are calling this method in the next line, that method will 
         * determine if the timer should be set or not. So we clear the timer here
         */
        if (this.timer) {
            clearTimeout(this.timer);
        }

        if (this.shouldProcessBatch()) {
            this.processing = true;
            // clearTimeout(this.timer!);
            await this.processBatch();
            this.processing = false;

            if (this.jobs.length > 0) {
                // There are more jobs to process so we trigger the processIfNeeded again
                // But to avoid stack overflow, we use setImmediate to call the function
                setImmediate(() => {
                    this.processIfNeeded();
                });
            }
        }
    }

    private shouldProcessBatch(): boolean {
        // No jobs to process
        if (this.jobs.length === 0) {
            return false;
        }

        // If the batch size is reached, process the batch
        if (this.jobs.length >= this.BATCH_SIZE) {
            return true;
        }

        // If over the max wait time, process the batch
        const currentTime = Date.now();
        if (currentTime - this.lastProcessedTime >= this.MAX_WAIT_MILLIS) {
            return true;
        }

        // The queue is not empty but the batch size is not reached
        // and the max wait time is not reached
        // So we don't to schedule the batch processing after the max wait time
        this.timer = setTimeout(() => {
            this.processIfNeeded();
        }, this.MAX_WAIT_MILLIS);
        return false;
    }

    private async processBatch(): Promise<void> {
        clearTimeout(this.timer!);
        logger.info(`Processing batch of ${this.jobs.length} jobs`);
        try {
            // This isn't efficient at all
            // Find something like a deque to get the batch efficiently
            const products = this.jobs.slice(0, this.BATCH_SIZE);
            this.jobs = this.jobs.slice(this.BATCH_SIZE);
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
        } finally {
            this.lastProcessedTime = Date.now();
            // this.processIfNeeded();
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
        const saved = await this.productService.saveExternalManufacturers(distinctManufacturers);
        const manufacturersWebsiteMap = new Map<number, Map<string, number>>();
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
