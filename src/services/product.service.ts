import { knex } from '../core/db.js';
import { ExternalManufacturer, ExternalProduct, InternalProduct, Manufacturer, ProductJob, ProductWithExternalId, ProductWithExternalIdAndManufacturer, ProductWithManufacturerId } from '../types/product.types.js';
import { Category } from '../constants.js';

export class ProductService {
    async savePrices(products: ProductWithExternalIdAndManufacturer[]): Promise<void> {
        const prices = products.map((product) => ({
            external_product_id: product.external_id,
            is_available: product.isAvailable,
            price: product.price,
        }));
        
        await knex('prices').insert(prices);
    }

    async getExternalProducts(): Promise<ExternalProduct[]> {
        return knex<ExternalProduct>('external_products').select('*');
    }

    async saveExternalProducts(products: ProductWithManufacturerId[]): Promise<ProductWithExternalIdAndManufacturer[]> {
        const dbProducts = products.map((product) => ({
            name: product.name,
            url: product.url,
            website_id: product.website_id,
            metadata: product.metadata,
            category_id: product.category_id,
            external_manufacturer_id: product.external_manufacturer_id,
            // Don't include the internal_product_id since it will overwrite the existing one to null
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

    async getExternalManufacturers(): Promise<ExternalManufacturer[]> {
        return knex<ExternalManufacturer>('external_manufacturers').select('*');
    }

    async saveExternalManufacturers(manufacturers: Omit<ExternalManufacturer, 'id'>[]): Promise<ExternalManufacturer[]> {
        const dbManufacturers = manufacturers.map((manufacturer) => ({
            name: manufacturer.name,
            website_id: manufacturer.website_id,
        }));
        return await knex<ExternalManufacturer>('external_manufacturers')
            .insert(dbManufacturers)
            .onConflict(['name', 'website_id'])
            .merge()
            .returning('*');
    }

    async getManufacturers(): Promise<Manufacturer[]> {
        return knex<Manufacturer>('manufacturers')
            .select('*');
    }

    async saveManufacturers(manufacturers: string[]): Promise<Manufacturer[]> {
        const dbManufacturers = manufacturers.map((manufacturer) => ({
            name: manufacturer,
        }));
        return knex<Manufacturer>('manufacturers')
            .insert(dbManufacturers)
            .onConflict(['name'])
            .merge()
            .returning('*');
    }

    async associateExternalManufacturers(): Promise<void> {
        return knex.raw(`
            UPDATE external_manufacturers em
            SET manufacturer_id = m.id
            FROM manufacturers m
            WHERE
                LOWER(em.name) = m.name
                and em.manufacturer_id is null;
        `);
    }

    async saveInternalProducts(products: Omit<InternalProduct, 'id'>[]): Promise<void> {
        const dbProducts = products.map((product) => ({
            name: product.name,
            category_id: product.category_id,
            metadata: product.metadata,
        }));

        if (dbProducts.length > 0) {
            await knex('internal_products').insert(dbProducts);
        }
    }

    async associateProducts() {
        return knex.raw(`
            UPDATE external_products ep
            SET internal_product_id = ip.id
            FROM internal_products ip
            WHERE
                ep.name = ip.name
                and ep.category_id = ip.category_id
                and ep.internal_product_id is null;
        `);
    }

    /**
     * Store new external manufacturers into the manufacturers table
     * and associate them with internal manufacturers
     */
    async syncManufacturers(): Promise<void> {
        await knex.transaction(async (trx) => {
            // First store the raw manufacturers into the manufacturers table
            // But we only store the ones that don't have an associated internal manufacturer
            await trx.raw(`
                INSERT INTO manufacturers (name)
                SELECT em.name
                FROM external_manufacturers em
                WHERE em.manufacturer_id IS NULL
                ON CONFLICT (name) DO NOTHING;
            `);

            // Now basically sync back the external manufacturers that we just inserted
            // so they are tracked as well
            await trx.raw(`
                UPDATE external_manufacturers em
                SET manufacturer_id = m.id
                FROM manufacturers m
                WHERE
                    em.name = m.name
                    and em.manufacturer_id IS NULL;
            `);
        });
    }


    /**
     * Store new external products into the products table
     * and associate them with internal products
     */
    async syncProducts(): Promise<void> {
        await knex.transaction(async (trx) => {
            // Store the raw products into the inner products table
            // Only store the ones that don't have an associated internal product
            await trx.raw(`
                INSERT INTO internal_products (name, category_id, manufacturer_id, metadata)
                SELECT ep.name, ep.category_id, em.manufacturer_id, ep.metadata
                FROM external_products ep
                    INNER JOIN external_manufacturers em 
                        ON ep.external_manufacturer_id = em.id and ep.website_id = em.website_id
                WHERE ep.internal_product_id IS NULL
                ON CONFLICT DO NOTHING;
            `);

            // Now basically sync back the external products that we just inserted
            // so they are tracked as well
            await trx.raw(`
                UPDATE external_products ep
                SET internal_product_id = ip.id
                FROM internal_products ip
                WHERE
                    ep.name = ip.name
                    and ep.category_id = ip.category_id
                    and ep.internal_product_id is null;
            `);
        });
    }
}