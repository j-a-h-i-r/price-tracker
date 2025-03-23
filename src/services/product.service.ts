import { knex } from '../core/db';
import { Manufacturer, ProductJob, ProductWithExternalId } from '../types/product.types';
import { Category } from '../constants';

export class ProductService {
    async savePrices(products: ProductWithExternalId[]): Promise<void> {
        const prices = products.map((product) => ({
            external_product_id: product.external_id,
            is_available: product.isAvailable,
            price: product.price,
        }));
        
        await knex('prices').insert(prices);
    }

    async saveExternalProducts(products: ProductJob[]): Promise<ProductWithExternalId[]> {
        const dbProducts = products.map((product) => ({
            name: product.name,
            url: product.url,
            website_id: product.website_id,
            metadata: product.metadata,
            category_id: product.category_id,
        }));

        const ids = await knex('external_products')
            .insert(dbProducts)
            .onConflict(['url'])
            .merge(['name', 'url', 'metadata'])
            .returning('id');

        return products.map((product, index) => ({
            ...product,
            external_id: ids[index].id
        }));
    }

    async saveExternalCategories(categories: Category[]): Promise<Category[]> {
        return knex('external_categories')
            .insert(categories)
            .onConflict(['name', 'website_id'])
            .merge()
            .returning('*');
    }

    async getManufacturersMap(): Promise<Map<string, number>> {
        const manufacturers = await knex<Manufacturer>('manufacturers').select('*');
        const manufacturersMap = new Map<string, number>();
        manufacturers.forEach((manufacturer) => {
            manufacturersMap.set(manufacturer.name, manufacturer.id);
        });
        return manufacturersMap;
    }

    async saveManufacturers(manufacturers: string[]): Promise<Manufacturer[]> {
        const dbManufacturers = manufacturers.map((manufacturer) => ({ name: manufacturer }));
        return knex<Manufacturer>('manufacturers')
            .insert(dbManufacturers)
            .onConflict(['name'])
            .merge()
            .returning('*');
    }
}