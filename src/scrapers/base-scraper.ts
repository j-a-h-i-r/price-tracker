import { ScrapedProduct, Scraper } from './scraper.types';
import { ScrapeConsumer, ScrapeProducer } from './scrape-events';
import logger from '../core/logger';

export interface CategoryLink {
    category: string;
    url: string;
}

export abstract class BaseScraper implements Scraper {
    protected abstract readonly categories: CategoryLink[];
    protected requestCount = 0;
    // Request limit before we need to wait
    protected readonly REQUEST_LIMIT = 200;
    // Wait time in milliseconds
    protected readonly WAIT_FOR_MS = 5 * 1000;

    /**
     * Helper function to wait for a given number of milliseconds
     * @param milliseconds 
     * @returns 
     */
    protected wait(milliseconds: number) {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }

    protected jitterWait() {
        const jitter = Math.floor(Math.random() * 500);
        return this.wait(jitter);
    }

    
    /**
     * Helper function to check if we need to wait. If we go over the request limit
     * this should automatically wait.
     * Call it before making any request that should be limited.
     * @returns 
     */
    protected waitIfNeeded() {
        this.requestCount += 1;
        if (this.requestCount >= this.REQUEST_LIMIT) {
            this.requestCount = 0;
            logger.info(`Waiting for ${this.WAIT_FOR_MS}ms`);
            return this.wait(this.WAIT_FOR_MS);
        }
        return Promise.resolve();
    }

    abstract scrapeCategory(category: string): Promise<ScrapedProduct[]>;

    scrape(): ScrapeConsumer {
        const producer = new ScrapeProducer();
        const consumer = new ScrapeConsumer(producer.getEmitter());
        
        (async () => {
            try {
                const results = await Promise.all(
                    this.categories.map(async ({category, url}) => {
                        const products = await this.scrapeCategory(url);
                        producer.emit(category, products);
                        return products;
                    })
                );
                
                const allProducts = results.flat();
                producer.emitComplete(allProducts);
                producer.removeListeners();
            } catch (error) {
                producer.emitError(error as Error);
                producer.removeListeners();
            }
        })();
    
        return consumer;
    }
}