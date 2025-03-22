import { ScrapedProduct } from '../scrapers';

// The product object passed around in the message queue
export interface ProductJob extends ScrapedProduct {
    website_id: number; // Add the internal website_id to the scraped product
}

export interface ProductWithExternalCategoryId extends ProductJob {
    external_category_id: number;
}

export interface ProductWithExternalId extends ProductJob {
    external_id: number;
}

export interface Category {
    name: string;
    website_id: number;
    id?: number;
}

export interface Manufacturer {
    name: string;
    id: number;
}

export interface JobData {
    name: string;
    data: ProductJob;
}