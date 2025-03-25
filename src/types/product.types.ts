import { ScrapedProduct } from '../scrapers/scraper.types.js';

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

export interface ProductWithManufacturerId extends ProductJob {
    external_manufacturer_id: number;
}

export interface ProductWithExternalIdAndManufacturer extends ProductWithExternalId {
    external_manufacturer_id: number;
}

export interface ExternalProduct {
    id: number;
    internal_product_id?: number;
    category_id: number;
    website_id: number;
    name: string;
    url: string;
    metadata: Record<string, string>;
    created_at: Date;
    updated_at: Date;
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

export interface ExternalManufacturer {
    id: number;
    name: string;
    website_id: number;
    manufacturer_id?: number;
}
