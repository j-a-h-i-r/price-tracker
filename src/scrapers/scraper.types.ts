import { CategoryName } from '../constants.js';
import { ScrapeConsumer } from './scrape-events.js';

export interface ScrapedProduct {
    name: string
    price: number | null
    slug: string
    manufacturer: string
    raw_metadata: Record<string, string>
    isAvailable: boolean
    url: string
}

export interface Website {
    website_id: number
    name: string
    url: string
}

export interface Scraper {
    scrape(): ScrapeConsumer;
}

export type ScrapeListener = (category: CategoryName, products: ScrapedProduct[]) => void;
