import type { Knex } from 'knex';


export async function up(knex: Knex): Promise<void> {
    return knex.schema
    .createTable('similar_internal_products', (table) => {
        table.comment('Stores the products that are similar to each other');
        table.increments('id').primary();
        table.integer('internal_product_1_id').notNullable();
        table.integer('internal_product_2_id').notNullable();
        // These fields are "not required" because from outside we only
        // have internal products. But we find similar products based on
        // external products. So adding these fields to the table to investigate
        // in future.
        table.integer('external_product_1_id').notNullable();
        table.integer('external_product_2_id').notNullable();
        // These fields are "not required" because internal products don't have
        // website ids. But since the product similarity is based on external products,
        // storing the website ids of the external products to investigate in future.
        table.integer('external_product_1_website_id').notNullable();
        table.integer('external_product_2_website_id').notNullable();
        table.float('similarity_score').notNullable();
        // This is just to track if the products are marked as different manually
        // In that case, we will not show them as similar
        table.boolean('marked_different').notNullable().defaultTo(false);
        table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
        table.unique(['internal_product_1_id', 'internal_product_2_id']);
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema
    .dropTableIfExists('similar_internal_products');
}

