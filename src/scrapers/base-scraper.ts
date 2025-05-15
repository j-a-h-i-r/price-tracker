import { CategoryName } from '../constants.js';
import pThrottle from 'p-throttle';
import { request } from 'undici';
import { ProductJob } from '../types/product.types.js';
import { scrapedWebsiteCategoryGauge } from '../monitoring/metrics.js';

export interface CategoryLink {
    category: CategoryName;
    url: string;
}

export interface ProductLink {
    url: string;
    category: CategoryLink;
}

export abstract class BaseScraper {
    protected abstract readonly categories: CategoryLink[];

    protected readonly throttle = pThrottle({
        limit: 100,     // 100 requests per second
        interval: 5000, // 5 seconds delay between requests
    });

    /**
     * A throttled function to make GET requests
     * @param url The URL to fetch
     * @returns 
     */
    protected fetchWithThrottle(url: string) {
        return this.throttle((_url) => {
            return request(_url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.7; rv:136.0) Gecko/20100101 Firefox/136.0'
                }
            }).then((response) => {
                return response;
            });
        })(url);
    }

    /**
     * Utlity function to emit metrics with number of products scraped
     * in each category for a website
     * @param category 
     * @param count 
     * @param websiteName 
     */
    emitScrapeMetric(category: CategoryName, count: number, websiteName: string) {
        scrapedWebsiteCategoryGauge.record(count, {
            category: category,
            website: websiteName,
        });
    }

    /**
     * Return a scraped product
     */
    abstract scrapeProducts(): AsyncGenerator<ProductJob>;
}