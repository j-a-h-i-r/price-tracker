import { type ScrapedProduct } from '../scrapers/scraper.types.ts';
import { type ParsedMetadata } from '../services/metadata.service.ts';

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
    raw_metadata: Record<string, string>;
    created_at: Date;
    updated_at: Date;
}

export interface ExternalProductRawMetadata {
    external_product_id: number;
    raw_metadata: Record<string, string>;
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
    created_at: string,
    updated_at: string,
    prices: LastestPrice[],
}

export interface InternalProductLastestPriceWithLowstAvailablePrice extends InternalProductLatestPrice {
    lowest_available_price: number,
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

export interface PossibleProductMatch {
    product_id: number,
    product_name: string,
    similar_products: {
        product_id: number,
        product_name: string,
        similarity_score: number,
    }[],
}

export interface TrackedProductResult {
    current_price: number,
    target_price: number,
    product_name: string,
    product_url: string,
}

export interface TrackedProductBelowPrice {
    email: string,
    products: TrackedProductResult[],
}

export interface ExternalProductAPI {
    external_product_id: number,
    website_id: number,
    name: string,
    url: string,
}

export interface ExternalProductPrice {
    external_product_id: number,
    is_available: boolean,
    price: number,
    created_at: string,
    updated_at: string,
}

export interface ProductVariant {
    name: string;
    values: {
        value: string;
        display_text: string;
    }[];
    display_text: string;
    unit: string;
}

export interface ExternalProductMetadata {
    name: string;
    value: string;
    unit: string;
    name_display_text: string;
    value_display_text: string;
}