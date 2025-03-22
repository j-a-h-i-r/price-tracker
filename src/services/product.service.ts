import { knex } from '../core/db';
import { Category, Manufacturer, ProductJob, ProductWithExternalCategoryId, ProductWithExternalId } from '../types/product.types';
import logger from '../core/logger';

export class ProductService {
    async savePrices(products: ProductWithExternalId[]): Promise<void> {
        const prices = products.map((product) => ({
            external_product_id: product.external_id,
            is_available: product.isAvailable,
            price: product.price,
        }));
        
        await knex('prices').insert(prices);
    }

    async saveExternalProducts(products: ProductWithExternalCategoryId[]): Promise<ProductWithExternalId[]> {
        const dbProducts = products.map((product) => ({
            name: product.name,
            url: product.url,
            website_id: product.website_id,
            external_category_id: product.external_category_id,
            metadata: product.metadata,
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

    /**
     * Creates a map of website_id to a map of category name to category id
     * to easily process external categories
     * @returns A map of website_id to a map of category name to category id
     */
    async getExternalCategoriesMapForWebsites(): Promise<Map<number, Map<string, number>>> {
        const categories = await knex<Category>('external_categories')
            .select('*');
        const websiteCategoriesMap: Map<number, Map<string, number>> = new Map();
        categories.forEach((category) => {
            const { website_id, name, id } = category;
            if (websiteCategoriesMap.has(website_id)) {
                websiteCategoriesMap.get(website_id)?.set(name, id!);
            } else {
                websiteCategoriesMap.set(website_id, new Map([[name, id!]]));
            }
        });
        return websiteCategoriesMap;
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
            .ignore()
            .returning('*');
    }
}