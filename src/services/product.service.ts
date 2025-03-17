import { knex } from '../core/db';
import { Category, ProductJob, ProductWithExternalCategoryId, ProductWithExternalId } from '../types/product.types';
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

    async saveExternalCategories(categories: Category[]): Promise<Category[]> {
        return knex('external_categories')
            .insert(categories)
            .onConflict(['name', 'website_id'])
            .merge()
            .returning('*');
    }
}