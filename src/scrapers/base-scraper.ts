import { CategoryName } from '../constants.js';
import pThrottle from 'p-throttle';
import { request } from 'undici';
import { ProductJob } from '../types/product.types.js';

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
        limit: 10,     // 100 requests per second
        interval: 10000, // 5 seconds delay between requests
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
     * Return a scraped product
     */
    abstract scrapeProducts(): AsyncGenerator<ProductJob>;
}