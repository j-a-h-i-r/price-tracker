import { ScrapedProduct } from '../scrapers';

// The product object passed around in the message queue
export interface ProductJob extends ScrapedProduct {
    category_id: number; // Add the internal category_id to the scraped product
    website_id: number; // Add the internal website_id to the scraped product
}

export interface ProductWithExternalCategoryId extends ProductJob {
    external_category_id: number;
}

export interface ProductWithExternalId extends ProductJob {
    external_id: number;
}

export interface InternalProduct {
    id: number;
    name: string;
    category_id: number;
    manufacturer_id?: number;
    metadata: any;
}

export interface Manufacturer {
    name: string;
    id: number;
}
