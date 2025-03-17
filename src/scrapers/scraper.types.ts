import { ScrapeConsumer } from './scrape-events';

export interface ScrapedProduct {
    name: string
    price: number | null
    slug: string
    manufacturer: string
    metadata: any
    isAvailable: boolean
    url: string
    category: string    // raw category string 
}

export interface Website {
    website_id: number
    name: string
    url: string
}

export interface Scraper {
    scrape(): ScrapeConsumer;
}

export type ScrapeListener = (category: string, products: ScrapedProduct[]) => void;
