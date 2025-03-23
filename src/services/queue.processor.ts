import { ProductJob } from '../types/product.types';
import { ProductService } from './product.service';
import logger from '../core/logger';
import { queueEvent } from '../events';

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
            
            // Save the manufacturers in DB
            await this.processAndPersistManufacturers(products);
            const savedProducts = await this.productService.saveExternalProducts(products);
            await this.productService.savePrices(savedProducts);

            logger.info(`Successfully processed batch of ${products.length} products`);
        } catch (error) {
            logger.error(error, 'Failed to process batch');
        } finally {
            this.lastProcessedTime = Date.now();
            // this.processIfNeeded();
        }
    }

    private async processAndPersistManufacturers(products: ProductJob[]) {
        const manufacturers = products.map((product) => product.manufacturer);
        const distinctManufacturers = [...new Set(manufacturers)];
        const savedManufacturers = await this.productService.saveManufacturers(distinctManufacturers);
        const manufacturersMap = new Map<string, number>();
        savedManufacturers.forEach((manufacturer) => {          
            manufacturersMap.set(manufacturer.name, manufacturer.id);
        });
        return manufacturersMap;
    }
}
