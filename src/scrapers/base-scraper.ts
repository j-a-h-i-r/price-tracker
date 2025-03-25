import { ScrapedProduct, Scraper } from './scraper.types.js';
import { ScrapeConsumer, ScrapeProducer } from './scrape-events.js';
import logger from '../core/logger.js';
import { CategoryName } from '../constants.js';
import pThrottle from 'p-throttle';
import config from '../core/config.js';

export interface CategoryLink {
    category: CategoryName;
    url: string;
}

export abstract class BaseScraper implements Scraper {
    protected abstract readonly categories: CategoryLink[];

    protected readonly throttle = pThrottle({
        limit: 100,     // 100 requests per second
        interval: 1000,
    })

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
                logger.error(error, 'Failed to scrape');
                producer.emitError(error as Error);
                producer.removeListeners();
            }
        })();
    
        return consumer;
    }
}