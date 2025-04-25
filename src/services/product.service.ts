import { knex } from '../core/db.js';
import { ExternalManufacturer, ExternalProduct, InternalProduct, InternalProductWebsites, InternalProductWithPrice, Manufacturer, ProductRawMetadata, ProductWithExternalIdAndManufacturer, ProductWithManufacturerId } from '../types/product.types.js';
import { Category } from '../constants.js';
import { metadataParsers } from './metadata.service.js';
import { ProductQuery } from '../api/products.js';
import logger from '../core/logger.js';

export class ProductService {
    async getInternalProducts(filter: ProductQuery = {}): Promise<InternalProduct[]> {
        // If the name is a URL, we'll first try to directly fetch the product
        // by the URL
        let internalProductId = null;
        if (/^https?:\/\//.test(filter.name)) {
            const product = await knex<ExternalProduct>('external_products')
                .select('internal_product_id')
                .where('url', filter.name)
                .first();
            if (product) {
                logger.info(`Found product by URL: ${filter.name}`);
                internalProductId = product.internal_product_id;
            }
        }

        let query = knex<InternalProduct>('internal_products_latest_price as iplp')
            .select(
                'iplp.id',
                'iplp.name',
                'iplp.category_id',
                'iplp.manufacturer_id',
                'iplp.raw_metadata',
                knex.raw('iplp.parsed_metadata || iplp.manual_metadata as parsed_metadata'),
                'iplp.created_at',
                'iplp.updated_at',
                'iplp.prices',
            );
        if (internalProductId) {
            query = query.where('iplp.id', internalProductId);
            return query;
        }


        if (filter.name) {
            query = query.where('iplp.name', 'ILIKE', `%${filter.name}%`);
        }
        if (filter.price) {
            let op, value;
            if (filter.price instanceof Number) {
                op = '=';
                value = filter.price;
            } else if (typeof filter.price === 'object') {
                if (filter.price.eq) {
                    op = '=';
                    value = filter.price.eq;
                } else if (filter.price.gt) {
                    op = '>';
                    value = filter.price.gt;
                } else if (filter.price.lt) {
                    op = '<';
                    value = filter.price.lt;
                }
            }
            if (op && value) {
                query = query.whereRaw(`iplp.prices @@ '$[*].price ${op} ${value}'`);
            }
        } 

        return query;
    }

    async getInternalProductById(id: number): Promise<InternalProduct | undefined> {
        return knex<InternalProduct>('internal_products').select('*').where('id', id).first();
    }

    async getInternalProductPrices(id: number): Promise<InternalProductWithPrice | undefined> {
        const { rows } = await knex.raw(`
            SELECT 
                ip.name,
                ip.category_id,
                ip.raw_metadata,
                ip.parsed_metadata || ip.manual_metadata as parsed_metadata,
                ip.id,
                (
                    SELECT
                    JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'website_id', ep.website_id,
                            'price', p.price,
                            'url', ep.url,
                            'website', w.name,
                            'created_at', p.created_at,
                            'is_available', p.is_available
                        )
                        ORDER BY p.created_at desc
                    )
                    FROM
                        prices p
                    INNER JOIN external_products ep 
                        ON ip.id = ep.internal_product_id
                    INNER JOIN websites w
                        ON w.id = ep.website_id
                    WHERE
                        p.external_product_id = ep.id
                    ) as prices
            FROM
                internal_products ip
            WHERE
                ip.id = ?;
        `, [id]);

        if (rows.length === 0) {
            return;
        }
        return rows[0];
    }

    async getInternalProductWebsites(id: number): Promise<InternalProductWebsites | undefined> {
        const { rows } = await knex.raw(`
            SELECT 
                ip.id,
                ip."name",
                (
                    SELECT JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'website_id', ep.website_id,
                            'website_name', w."name",
                            'product_url', ep.url
                        )
                    )
                    FROM
                        external_products ep 
                    INNER JOIN websites w on w.id = ep.website_id 
                        AND ep.internal_product_id = ip.id
                    ) as websites
                FROM internal_products ip 
                WHERE ip.id = ?;
        `, [id]);
        
        if (rows.length === 0) {
            return;
        }
        const product = rows[0];
        return product;
    }

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

    async getRawProductMedatas(): Promise<ProductRawMetadata[]> {
        return knex<ProductRawMetadata>('external_products')
        .select(
            'internal_product_id',
            knex.raw('jsonb_agg(json_build_object(\'external_product_id\', id, \'raw_metadata\', raw_metadata)) as external_metadatas')
        )
        .groupBy('internal_product_id');
    }

    async saveExternalProducts(products: ProductWithManufacturerId[]): Promise<ProductWithExternalIdAndManufacturer[]> {
        const dbProducts = products.map((product) => ({
            name: product.name,
            url: product.url,
            website_id: product.website_id,
            raw_metadata: product.raw_metadata,
            category_id: product.category_id,
            external_manufacturer_id: product.external_manufacturer_id,
            // Don't include the internal_product_id since it will overwrite the existing one to null
        }));

        const ids = await knex('external_products')
            .insert(dbProducts)
            .onConflict(['url'])
            .merge(['name', 'url', 'raw_metadata'])
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
            raw_metadata: product.raw_metadata,
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
                INSERT INTO internal_products (name, category_id, manufacturer_id, raw_metadata)
                SELECT ep.name, ep.category_id, em.manufacturer_id, ep.raw_metadata
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

    async saveNormalizedMetadata() {
        const rawMetadatas = await this.getRawProductMedatas();
        const failedToParse: any[] = [];
        const normazlizedProducts = rawMetadatas.map((product) => {
            const { internal_product_id, external_metadatas } = product;
            const mergedRawMetadata = external_metadatas.reduce((acc, { raw_metadata }) => {
                return {
                    ...acc,
                    ...raw_metadata,
                };
            }, {});

            const parsedMetadatas = metadataParsers.reduce((acc, parser) => {
                return external_metadatas.map(({ external_product_id, raw_metadata }) => {
                    const { hasMetadata, parseSuccess, parsedMetadata } = parser.parse(raw_metadata);
                    if (!hasMetadata) {
                        // Parser is not defined for this metadata
                        return null;
                    }
                    if (parseSuccess) {
                        return parsedMetadata;
                    } else {
                        failedToParse.push({
                            internal_product_id: internal_product_id,
                            external_product_id: external_product_id,
                            metadata_key: parser.metadataKey,
                            metadata_value: parsedMetadata,
                        });
                        return null;
                    }
                })
                .filter((parsedMetadata) => parsedMetadata !== null)
                .reduce((acc, parsedMetadata) => {
                    return {
                        ...acc,
                        ...parsedMetadata,
                    };
                }, acc);
            }, {});

            return {
                internal_product_id: product.internal_product_id,
                parsed_metadata: parsedMetadatas,
                raw_metadata: mergedRawMetadata,
            };
        });

        await knex.transaction(async (trx) => {
            await trx.raw(`
                CREATE TEMPORARY TABLE temp_product_normalized_metadata (
                    internal_product_id INTEGER,
                    parsed_metadata JSONB,
                    raw_metadata JSONB
                );
            `);

            await trx('temp_product_normalized_metadata').insert(normazlizedProducts);
            await trx.raw(`
                UPDATE internal_products ip
                SET
                    parsed_metadata = COALESCE(temp.parsed_metadata, '{}'),
                    raw_metadata = COALESCE(temp.raw_metadata, '{}')
                FROM temp_product_normalized_metadata temp
                WHERE
                    ip.id = temp.internal_product_id;
            `);
            await trx.insert(failedToParse).into('pending_metadata_reviews').onConflict().ignore();
            await trx.raw(`
                DROP TABLE temp_product_normalized_metadata;
            `);
        });
    }

    async getCategories() {
        return knex('categories')
            .select('*')
            .orderBy('name');
    }
}