import { ScrapedProduct } from '../scrapers/scraper.types.js';
import { ParsedMetadata } from '../services/metadata.service.js';

// The product object passed around in the message queue
export interface ProductJob extends ScrapedProduct {
    category_id: number; // Add the internal category_id to the scraped product
    website_id: number; // Add the internal website_id to the scraped product
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
    raw_metadata: Record<string, string>;
    created_at: Date;
    updated_at: Date;
}

export interface ProductRawMetadata {
    internal_product_id: number;
    external_metadatas: {
        external_product_id: number;
        raw_metadata: Record<string, string>;
    }[]
}

export interface InternalProduct {
    id: number;
    name: string;
    category_id: number;
    manufacturer_id?: number;
    raw_metadata: Record<string, string>;
    parsed_metadata: ParsedMetadata;
}

interface LastestPrice {
    price: number,
    created_at: string,
    website_id: number,
    is_available: boolean
}

export interface InternalProductLatestPrice {
    id: number,
    name: string,
    category_id: number,
    manufacturer_id: number,
    raw_metadata: Record<string, string>,
    parsed_metadata: Record<string, string>,
    created_at: string,
    updated_at: string,
    prices: LastestPrice[],
}

export interface InternalProductLastestPriceWithLowstAvailablePrice extends InternalProductLatestPrice {
    lowest_available_price: LastestPrice
}

export interface InternalProductWithPrice extends InternalProduct {
    prices: {
        website_id: number
        price: number,
        url: string,
        website: string,
        created_at: string,
        is_available: string,
    }
}

export interface InternalProductWebsites {
    id: number;
    name: string;
    websites: {
        website_id: number;
        website_name: string;
        product_url: string;
    }
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
