import { ScrapedProduct, Scraper } from './scraper.types.js';
import { ScrapeConsumer, ScrapeProducer } from './scrape-events.js';
import logger from '../core/logger.js';
import { CategoryName } from '../constants.js';
import pThrottle from 'p-throttle';
import axios from 'axios';

export interface CategoryLink {
    category: CategoryName;
    url: string;
}

export abstract class BaseScraper implements Scraper {
    protected abstract readonly categories: CategoryLink[];

    protected readonly throttle = pThrottle({
        limit: 100,     // 100 requests per second
        interval: 5000, // 5 seconds delay between requests
    });

    /**
     * A throttled function to make GET requests using axios
     * @param url The URL to fetch
     * @returns 
     */
    protected axiosGet(url: string) {
        return this.throttle((url) => {
            return axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.7; rv:136.0) Gecko/20100101 Firefox/136.0'
                },
            });
        })(url);
    } 

    abstract scrapeCategory(category: string): Promise<ScrapedProduct[]>;

    scrape(): ScrapeConsumer {
        const producer = new ScrapeProducer();
        const consumer = new ScrapeConsumer(producer.getEmitter());
        
        (async () => {
            try {
                const results = await Promise.all(
                    this.categories.map(async ({category, url}) => {
                        try {
                            const products = await this.scrapeCategory(url);
                            producer.emit(category, products);
                            return products;
                        } catch (error) {
                            logger.error(error, `Failed to scrape category ${category} with url: ${url}`);
                            producer.emitError(error as Error);
                            return [];
                        }
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