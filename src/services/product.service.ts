import type { ExternalProductQuery } from '../api/externals.ts';
import { type ProductQuery } from '../api/products.ts';
import { type Category } from '../constants.ts';
import { knex } from '../core/db.ts';
import logger from '../core/logger.ts';
import type { MetadataKey, NumericRangeFilter } from '../types/metadata.types.ts';
import type {
    ExternalManufacturer, ExternalProduct, ExternalProductAPI, ExternalProductPrice,
    InternalProduct, InternalProductLastestPriceWithLowstAvailablePrice,
    InternalProductWebsites, InternalProductWithPrice, Manufacturer, PossibleProductMatch,
    ExternalProductRawMetadata, ProductWithExternalId, ProductWithExternalIdAndManufacturer,
    ProductWithManufacturerId, TrackedProductBelowPrice, ProductVariant, ExternalProductMetadata
} from '../types/product.types.ts';
import { MetadataDefinitions, metadataParsers } from './metadata.service.ts';
import { getUserByEmail } from './user.service.ts';
import { VariantAttributes } from './variant.service.ts';

export class ProductService {
    convertNumericFilterToSqlConditions(filter: NumericRangeFilter): ['=' | '>=' | '<=', number][] {
        const conditions: ['=' | '>=' | '<=', number][] = [];
        if (filter) {
            if (typeof filter === 'number') {
                conditions.push(['=', filter]);
            } else if (typeof filter === 'object') {
                if (filter.eq) {
                    conditions.push(['=', filter.eq]);
                } else {
                    if (filter.gt) {
                        conditions.push(['>=', filter.gt]);
                    }
                    
                    if (filter.lt) {
                        conditions.push(['<=', filter.lt]);
                    }
                } 
            }
        }
        return conditions;
    }

    async getInternalProducts(filter: ProductQuery = {}): Promise<InternalProductLastestPriceWithLowstAvailablePrice[]> {
        // If the name is a URL, we'll first try to directly fetch the product
        // by the URL
        let internalProductId = null;
        if (filter.name && /^https?:\/\//.test(filter.name)) {
            const product = await knex<ExternalProduct>('external_products')
                .select('internal_product_id')
                .where('url', filter.name)
                .first();
            if (product) {
                logger.info(`Found product by URL: ${filter.name}`);
                internalProductId = product.internal_product_id;
            }
        }

        let query = knex<InternalProductLastestPriceWithLowstAvailablePrice>
            ('internal_products as ip')
            .innerJoin(
                'external_products_latest_price as eplp',
                'ip.id',
                'eplp.internal_product_id'
            )
            .groupBy('ip.id')
            .select(
                'ip.id',
                'ip.name',
                'ip.category_id',
                'ip.manufacturer_id',
                'ip.created_at',
                'ip.updated_at',
                knex.raw('min(eplp.price) filter (where eplp.is_available = True) as lowest_available_price'),
                knex.raw(`
                    json_agg(
                        jsonb_build_object(
                            'website_id', eplp.website_id,
                            'price', eplp.price,
                            'is_available', eplp.is_available,
                            'created_at', eplp.created_at
                        )
                    )::jsonb as prices`
                )
            );

        if (internalProductId) {
            query = query.where('ip.id', internalProductId);
            return query;
        }

        if (filter.name) {
            // TODO: Use full-text search or some fuzzy matching
            query = query.where('ip.name', 'ILIKE', `%${filter.name}%`);
        }
        if (filter.price) {
            const priceConditions = this.convertNumericFilterToSqlConditions(filter.price);
            priceConditions.forEach(([op, value]) => {
                query = query.andWhere('eplp.price', op, value);
            });
        }

        if (filter.limit) {
            query = query.limit(filter.limit);
        }

        return query;
    }

    async getInternalProductById(id: number): Promise<InternalProduct | undefined> {
        return knex<InternalProduct>('internal_products').select('*').where('id', id).first();
    }

    async updateInternalProduct(id: number, product: Partial<InternalProduct>): Promise<void> {
        await knex<InternalProduct>('internal_products')
            .update(product)
            .where('id', id);
    }

    async getInternalProductPrices(id: number): Promise<InternalProductWithPrice | undefined> {
        const { rows } = await knex.raw(`
            SELECT 
                ip.name,
                ip.category_id,
                ip.id,
                (
                    SELECT
                    JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'website_id', ep.website_id,
                            'price', p.price,
                            'url', ep.url,
                            'product_name', ep.name,
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

    async getExternalProductsByInternalProductId(internalProductId: number, variants: Partial<Record<MetadataKey, string>> = {}): Promise<ExternalProductAPI[]> {
        if (Object.keys(variants).length > 0) {
            // If variants are provided, we will filter the external products by the variants
            const variantConditions = Object.keys(variants).map((variant) => {
                const filterVal = `${variants[variant as MetadataKey]}`;
                return knex.raw(`(parsed_metadata ->> '${variant}')::text = ?`, [filterVal]);
            }).join(' AND ');

            return knex<ExternalProductAPI>('external_products')
                .select(
                    'id as external_product_id',
                    'website_id',
                    'name',
                    'url',
                )
                .where('internal_product_id', internalProductId)
                .andWhereRaw(variantConditions);
        }
        const { rows } = await knex.raw(`
            select 
	            id as external_product_id,
                website_id,
                "name",
                url
            from external_products ep 
            where ep.internal_product_id = ?;
        `, [internalProductId]);
        return rows;
    }

    async getExternalProductPrices(externalProductId: number, maxDays: number = 30): Promise<ExternalProductPrice[]> {
        return knex
            .from('prices')
            .select(
                'external_product_id',
                'is_available',
                'price',
                'created_at',
                'updated_at',
            )
            .where('external_product_id', externalProductId)
            .andWhere('created_at', '>=', knex.raw(`NOW() - INTERVAL '${maxDays} days'`))
            .orderBy('created_at', 'desc');
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

    async savePrices(products: ProductWithExternalId[]): Promise<void> {
        const prices = products.map((product) => ({
            external_product_id: product.external_id,
            is_available: product.isAvailable,
            price: product.price,
        }));

        await knex('prices').insert(prices);
    }

    async getExternalProducts(filters: ExternalProductQuery, { includeRawMetadata = false } = {}): Promise<ExternalProduct[]> {
        const query =  knex<ExternalProduct>('external_products as ep');
        query.innerJoin(
            'internal_products as ip',
            'ep.internal_product_id',
            'ip.id'
        );
        query.innerJoin(
            'external_products_latest_price as eplp',
            'ep.id',
            'eplp.external_product_id'
        );
        const selectedColumns = [
            'ep.id', 'ep.internal_product_id', 'ep.category_id', 'ep.website_id',
            'ep.name', 'ep.url', 'ep.created_at', 'ep.updated_at',
            knex.raw('ep.parsed_metadata || ep.manual_metadata as parsed_metadata'),
            'ip.id as product_id',
            'eplp.price as latest_price',
            'eplp.is_available as is_available',
        ];
        if (includeRawMetadata) {
            query.select(
                ...selectedColumns,
                'ep.raw_metadata',
            );
        } else {
            query.select(...selectedColumns);
        }
        if (filters.category_id) {
            query.where('ep.category_id', filters.category_id);
        }
        if (filters.name) {
            query.where('ep.name', 'ILIKE', `%${filters.name}%`);
        }
        if (filters.manufacturer_id) {
            query.where('ip.manufacturer_id', filters.manufacturer_id);
        }
        if (filters.price) {
            const priceConditions = this.convertNumericFilterToSqlConditions(filters.price);
            priceConditions.forEach(([op, value]) => {
                query.andWhere('eplp.price', op, value);
            });
        }
        if (filters.metadata) {
            Object.keys(filters.metadata).forEach((key) => {
                const prop = MetadataDefinitions[key as MetadataKey];
                const filter = filters.metadata?.[key as keyof typeof filters.metadata];
                if (filter) {
                    if (prop.type === 'range') {
                        const filters = this.convertNumericFilterToSqlConditions(filter as NumericRangeFilter);
                        filters.forEach(([op, val]) => {
                            query.whereRaw(`(ep.parsed_metadata ->> '${key}')::float ${op} ? `, [val]);
                        });
                    } else if (prop.type === 'boolean') {
                        query.whereRaw(`(ep.parsed_metadata ->> '${key}')::boolean = ?`, [filter]);
                    } else if (prop.type === 'set') {
                        query.whereRaw(`(ep.parsed_metadata ->> '${key}')::text = ?`, [filter]);
                    }
                }
            });
        }
        if (filters.limit) {
            query.limit(filters.limit);
        }
        return query;
    }

    async getExternalProductsRawMedatas(): Promise<ExternalProductRawMetadata[]> {
        return knex<ExternalProductRawMetadata>('external_products')
            .select(
                'id as external_product_id',
                'raw_metadata',
            );
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

        const externalProductIds = await knex('external_products')
            .insert(dbProducts)
            .onConflict(['url'])
            .merge(['name', 'url', 'raw_metadata'])
            .returning('id');

        return products.map((product, index) => ({
            ...product,
            external_id: externalProductIds[index].id
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
            .ignore()
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
        const rawMetadatas = await this.getExternalProductsRawMedatas();
        const failedToParse: any[] = [];
        const normazlizedProducts = rawMetadatas.map((product) => {
            const { external_product_id, raw_metadata } = product;
            
            const parsedMetadatas = metadataParsers.reduce((acc, parser) => {
                const { hasMetadata, parseSuccess, parsedMetadata } = parser.parse(raw_metadata);
                if (!hasMetadata) {
                    // Parser is not defined for this metadata
                    return acc;
                }
                if (parseSuccess) {
                    return {
                        ...acc,
                        ...parsedMetadata,
                    };
                } else {
                    failedToParse.push({
                        external_product_id: external_product_id,
                        metadata_key: parser.metadataKey,
                        metadata_value: parsedMetadata,
                    });
                    return acc;
                }
            }, {});

            return {
                external_product_id: external_product_id,
                parsed_metadata: parsedMetadatas,
                raw_metadata: raw_metadata,
            };
        });

        await knex.transaction(async (trx) => {
            await trx.raw(`
                CREATE TEMPORARY TABLE temp_product_normalized_metadata (
                    external_product_id INTEGER,
                    parsed_metadata JSONB,
                    raw_metadata JSONB
                );
            `);

            await trx('temp_product_normalized_metadata').insert(normazlizedProducts);
            await trx.raw(`
                UPDATE external_products ep
                SET
                    parsed_metadata = COALESCE(temp.parsed_metadata, '{}'),
                    raw_metadata = COALESCE(temp.raw_metadata, '{}')
                FROM temp_product_normalized_metadata temp
                WHERE
                    ep.id = temp.external_product_id;
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

    async getInternalProductCount(): Promise<number | null> {
        const count = await knex('internal_products')
            .count('* as count')
            .first();
        if (count) {
            return Number(count.count);
        }
        return null;
    }

    async trackProduct(email: string, productId: number, targetPrice: number): Promise<void> {
        const user = await getUserByEmail(email);
        if (!user) {
            throw new Error('User not found');
        }
        const userId = user.id;
        const existingProduct = await knex('tracked_products')
            .where('user_id', userId)
            .andWhere('internal_product_id', productId)
            .first();
        if (existingProduct) {
            await knex('tracked_products').update({
                target_price: targetPrice,
            })
                .where('user_id', userId)
                .andWhere('internal_product_id', productId);
            return;
        }
        await knex('tracked_products').insert({
            user_id: userId,
            internal_product_id: productId,
            target_price: targetPrice,
        });
    }

    async untrackProduct(email: string, productId: number): Promise<void> {
        const user = await getUserByEmail(email);
        if (!user) {
            throw new Error('User not found');
        }
        const userId = user.id;
        await knex('tracked_products')
            .delete()
            .where('user_id', userId)
            .andWhere('internal_product_id', productId);
    }

    async getUserTrackedProducts(email: string): Promise<InternalProduct[]> {
        const user = await getUserByEmail(email);
        if (!user) {
            throw new Error('User not found');
        }
        const trackedProducts = await knex
            .select(
                'ip.id as product_id',
                'ip.name',
                knex.raw('AVG(tp.target_price) as target_price'),
                knex.min('eplp.price').as('current_price'),
            )
            .from('tracked_products as tp')
            .join('internal_products as ip', 'tp.internal_product_id', 'ip.id')
            .join('external_products as ep', 'ip.id', 'ep.internal_product_id')
            .join('external_products_latest_price as eplp', 'ep.id', 'eplp.external_product_id')
            .where('user_id', user.id)
            .where('eplp.is_available', true)
            .groupBy('ip.id');
        return trackedProducts;
    }

    /**
     * Merge productIdsToMerge into productId. After successful operation,
     * `internalProductIdsToMerge` will no longer exist in the database.
     */
    async mergeProducts(internalProductId: number, internalProductIdsToMerge: number[]): Promise<void> {
        await knex.transaction(async (trx) => {
            // Since `internalProductIdsToMerge` will not exist, first pointing 
            // all external products associated with these internal products to the
            // `internalProductId` that we are merging into.
            await trx('external_products')
                .whereIn('internal_product_id', internalProductIdsToMerge)
                .update({
                    internal_product_id: internalProductId,
                });

            // Doing the same for the tracked products
            await trx('tracked_products')
                .whereIn('internal_product_id', internalProductIdsToMerge)
                .update({
                    internal_product_id: internalProductId,
                });

            await trx('internal_products')
                .whereIn('id', internalProductIdsToMerge)
                .delete();
        });
    }

    async unmergeProducts(internalProductId: number, externalProductId: number): Promise<void> {
        const newId = await knex.transaction(async (trx) => {
            // Create a new internal product which will hold the unmerged products
            const internalProduct = await trx('internal_products')
                .select('*').where('id', internalProductId)
                .first();
            if (!internalProduct) {
                throw new Error(`Internal product with id ${internalProductId} not found`);
            }

            const externalProduct = await trx('external_products')
                .select('*')
                .where('id', externalProductId)
                .first();
            if (!externalProduct) {
                throw new Error(`No external products found for id: ${externalProductId}`);
            }
            const { category_id, manufacturer_id } = internalProduct;
            const toInsert = {
                name: externalProduct.name,
                category_id: category_id,
                manufacturer_id: manufacturer_id,
            };

            const newIds = await trx('internal_products')
                .insert(toInsert)
                .returning('id');
            if (!newIds) {
                throw new Error('Failed to create a new internal product');
            }
            const newId = newIds[0].id;
            
            await trx('external_products')
                .update({ internal_product_id: newId })
                .where('id', externalProductId);
            return newId;
        });

        // Now need to refresh the materialized view
        await this.refreshLatestPricesMaterializedView();
        return newId;
    }

    async ignoreProducts(internalProductId: number, internalProductIdsToIgnore: number[]): Promise<void> {
        await knex('similar_internal_products')
            .update({ marked_different: true })
            .where('internal_product_1_id', internalProductId)
            .whereIn('internal_product_2_id', internalProductIdsToIgnore);
    }

    async getPossibleSimilarProducts({ minScore = 0.7 }: { minScore: number }): Promise<PossibleProductMatch[]> {
        const { rows } = await knex.raw(`
            select
            internal_product_1_id as product_id,
            ip1."name" as product_name,
            json_agg(
                json_build_object('product_id', internal_product_2_id, 'product_name', ip2.name, 'similarity_score', similarity_score)
                order by similarity_score desc
            ) as similar_products
            from similar_internal_products sip
            inner join internal_products ip1 on ip1.id = sip.internal_product_1_id
            inner join internal_products ip2 on ip2.id = sip.internal_product_2_id
            where sip.marked_different is false
                and sip.similarity_score >= ?
            group by internal_product_1_id, ip1."name" 
            order by max(similarity_score) desc;
        `, [minScore]);
        return rows;
    }

    /**
     * Store the possible similar products from different websites into the database. This function is suitable 
     * for running in a schedule (for example after a new scrapping session is done).
     * This function will store the similar products into the database and that can be 
     * later queried
     */
    async storePossibleSimilarProducts(minThreshold: number = 0.4): Promise<void> {
        await knex.raw(`
            -- Adding internal manufacturer id to external products
            with external_products_with_mfg as (
                select 
                    ep.id,
                    ep."name",
                    ep.category_id,
                    m.id as manufacturer_id,
                    ep.website_id,
                    ep.internal_product_id
                from external_products ep
                inner join external_manufacturers em on ep.external_manufacturer_id = em.id
                inner join manufacturers m on m.id = em.manufacturer_id
            ),
            -- Now basically joining external products with external products
            -- and finding if the name is similar.
            similar_products AS (
                SELECT 
                    p1.id as product_1_external_id,
                    p1.internal_product_id  as product_1_internal_id, 
                    p1.website_id as product_1_website_id,
                    p2.id as product_2_external_id,
                    p2.internal_product_id as product_2_internal_id,
                    p2.website_id as product_2_website_id,
                    strict_word_similarity(p1.name, p2.name) as name_similarity
                FROM external_products_with_mfg p1
                INNER JOIN external_products_with_mfg p2 ON 
                    p1.id < p2.id  -- Avoid self-matches and duplicate pairs
                    AND p1.category_id = p2.category_id  -- Same category
                    AND p1.manufacturer_id = p2.manufacturer_id  -- Same manufacturer
                    and p1.website_id != p2.website_id -- must be different website
                    and p1.internal_product_id != p2.internal_product_id -- must not be same product
                WHERE 
                    strict_word_similarity(p1.name, p2.name) > ?  -- Adjust threshold as needed
            ),
            similar_products_deduped AS (
            	SELECT * FROM (
            		SELECT *,
					ROW_NUMBER() over (partition by product_1_internal_id, product_2_internal_id order by name_similarity desc) as ranked 
					FROM similar_products
				) t
				where t.ranked = 1
            )
            insert into similar_internal_products (
            internal_product_1_id, internal_product_2_id, external_product_1_id, external_product_2_id, external_product_1_website_id, external_product_2_website_id, similarity_score
            )
            SELECT 
                product_1_internal_id,
                product_2_internal_id,
                product_1_external_id,
                product_2_external_id,
                product_1_website_id,
                product_2_website_id,
                name_similarity
            FROM similar_products_deduped
            ON CONFLICT (internal_product_1_id, internal_product_2_id) 
                DO UPDATE SET
                    similarity_score = EXCLUDED.similarity_score,
                    external_product_1_id = EXCLUDED.external_product_1_id, 
                    external_product_2_id = EXCLUDED.external_product_2_id, 
                    external_product_1_website_id = EXCLUDED.external_product_1_website_id, 
                    external_product_2_website_id = EXCLUDED.external_product_2_website_id,
                    marked_different = false,
                    updated_at = NOW();
        `, [minThreshold]);
    }

    /**
     * Automatically merge products that are highly similar.
     * @param minThreshold 
     */
    async autoMergeHighlySimilarProducts(minThreshold: number = 0.9): Promise<void> {
        const similarProducts = await knex.from('similar_internal_products')
            .select(
                'internal_product_1_id as product_id',
                knex.raw('json_agg(internal_product_2_id) as similar_product_ids'),
            )
            .where('similarity_score', '>=', minThreshold)
            .groupBy('internal_product_1_id');
        
        const mergeProducts = similarProducts.map(async (product) => {
            const { product_id, similar_product_ids } = product;
            return this.mergeProducts(product_id, similar_product_ids);
        });

        await Promise.all(mergeProducts);
    }

    /**
     * If an internal product is deleted then it doesn't make sense to still keep it 
     * in similar products table. 
     */
    async cleanUpSimilarProductsForNonExistingInternalProducts(): Promise<void> {
        await knex.raw(`
            delete from 
                similar_internal_products sip 
            where 
                sip.internal_product_1_id not in (
                    select id
                    from internal_products ip
                )
                OR sip.internal_product_2_id not in (
                    select id
                    from internal_products ip
                );
        `);
    }

    /**
     * Get a list of users and the products they are tracking that are below the target price
     * @returns 
     */
    async getTrackedProductsBelowTargetPrice(): Promise<TrackedProductBelowPrice[]> {
        const { rows } = await knex.raw(`
            select 
                u.email,
                json_agg(
                    json_build_object(
                        'current_price', eplp.price,
                        'target_price', tp.target_price,
                        'product_name', ip."name",
                        'product_url', ep.url
                    )
                ) as products
            from external_products_latest_price eplp
            inner join external_products ep on ep.id = eplp.external_product_id
            inner join internal_products ip on ip.id = ep.internal_product_id
            inner join tracked_products tp on tp.internal_product_id = ip.id
            inner join users u on u.id = tp.user_id
            where eplp.price <= tp.target_price and eplp.is_available is true
            group by u.id;`
        );
        return rows;
    }

    // manufacturer_name -> website_id -> ExternalManufacturer
    async getExternalManufacturerMap(): Promise<Map<string, Map<number, ExternalManufacturer>>> {
        const manufacturers = await this.getExternalManufacturers();
        const manufacturerMap = new Map<string, Map<number, ExternalManufacturer>>();

        manufacturers.forEach((manufacturer) => {
            const { name, website_id } = manufacturer;
            if (!manufacturerMap.has(name)) {
                manufacturerMap.set(name, new Map<number, ExternalManufacturer>());
            }
            manufacturerMap.get(name)!.set(website_id, manufacturer);
        });

        return manufacturerMap;
    }

    /**
     * For a given product, get the variant attributes that are available for that product.
     * @param internalProductId 
     * @returns 
     */
    async getVariantAttributesForProduct(internalProductId: number): Promise<ProductVariant[]> {
        const variantKeys = Object.keys(VariantAttributes);
        const { rows } = await knex.raw(`
            select 
                key as attribute_name,
                jsonb_agg(distinct(value) order by value) as attribute_values
            from external_products ep, jsonb_each(ep.parsed_metadata::jsonb)
            where
                ep.internal_product_id = ?
                and key = ANY(?)
            group by key;
        `, [internalProductId, variantKeys]);

        const variants = rows.map((row: any) => {
            const { attribute_name, attribute_values } = row;
            const attributeDetail = VariantAttributes[attribute_name as MetadataKey];
            const values = attribute_values.map((value: any) => {
                return {
                    value: value,
                    display_text: attributeDetail?.unit? `${value} ${attributeDetail?.unit}`: value,
                };
            });

            return {
                name: attribute_name,
                display_text: attributeDetail?.displayName || attribute_name,
                unit: attributeDetail?.unit || '',
                values: values,
            };
        });
        return variants;
    }

    async getExternalProductMetadata(externalProductId: number): Promise<ExternalProductMetadata[] | undefined> {
        const { rows } = await knex.raw(`
            select 
                parsed_metadata || manual_metadata as metadata 
            from external_products ep 
            where 
                ep.id = ?;
        `, [externalProductId]);

        if (rows.length === 0) {
            return;
        }

        const metadata = rows[0]?.metadata;
        const metadataFormatted = Object.keys(metadata).map((key) => {
            const definition = MetadataDefinitions[key as MetadataKey];
            let valueDisplayText = metadata[key];
            if (definition.type === 'range') {
                 valueDisplayText = `${metadata[key]} ${definition.unit}`;
            }
            if (definition.type === 'boolean') {
                valueDisplayText = metadata[key] ? '✅' : '❌';
            }

            return {
                name: key,
                value: metadata[key],
                unit: definition.type === 'range' ? definition.unit : '',
                name_display_text: definition?.displayName || key,
                value_display_text: valueDisplayText,
            };
        });
        return metadataFormatted;
    }

    /**
     * Refresh the latest prices materialized view.
     */
    async refreshLatestPricesMaterializedView(): Promise<void> {
        await knex.raw('REFRESH MATERIALIZED VIEW CONCURRENTLY external_products_latest_price;');
    }
}
