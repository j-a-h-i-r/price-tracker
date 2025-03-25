import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema
    .createTable('websites', (table) => {
        table.comment('Stores the websites that are being tracked');
        table.integer('id').primary(); // The id is manually set
        table.text('name').notNullable().unique();
        table.text('url').notNullable().unique();
        table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    })
    .createTable('manufacturers', (table) => {
        // Creating a manufacturers table to store the manufacturers of the products. 
        // Different websites may have slightly different names for the same manufacturer.
        // This table will help in normalizing the manufacturer names.
        table.comment('Stores the manufacturers of the products');
        table.increments('id').primary();
        table.text('name').notNullable().unique();
        table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    })
    .createTable('external_manufacturers', (table) => {
        // Since the manufacturer strings are coming from the external websites,
        // we need a separate place to store those. Otherwise they'll keep
        // getting merged into the manufacturers table.
        table.comment('Stores the manufacturers of the products from the external websites');
        table.increments('id').primary();
        table.text('name').notNullable();
        table.integer('website_id').notNullable();
        table.integer('manufacturer_id').nullable();
        table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
        table.unique(['name', 'website_id']);
    })
    .createTable('categories', (table) => {
        table.comment('Stores the internal categories of the products');
        table.integer('id').primary();      // The id is manually set
        table.text('name').unique();
        table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    })
    .createTable('internal_products', (table) => {
        table.comment('Stores the internal products that are being tracked');
        table.increments('id').primary();
        table.integer('category_id');
        table.text('name').notNullable();
        // nullable because manufacturere id will be determined after post processing
        table.integer('manufacturer_id').nullable();
        table.jsonb('metadata').defaultTo('{}');
        table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    })
    .createTable('external_products', (table) => {
        table.comment('Stores the products that are being tracked');
        table.increments('id').primary();
        table.integer('internal_product_id').nullable();
        table.integer('category_id').notNullable();
        table.integer('website_id').notNullable();
        table.integer('external_manufacturer_id').nullable();
        table.text('name').notNullable();
        table.text('url').notNullable().unique();
        table.jsonb('metadata').defaultTo('{}');
        table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    })
    .createTable('prices', (table) => {
        table.comment('Stores the prices of the products');
        table.increments('id').primary();
        table.integer('external_product_id').notNullable();
        table.boolean('is_available').notNullable();
        table.double('price').nullable(); // price can be null if the product is not available
        table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    })
    .createTable('subscribed_emails', (table) => {
        table.comment('Stores the emails and an authorization code for making changes to subscription');
        table.increments('id').primary();
        table.text('email').notNullable().unique();
        table.text('auth_code').notNullable();
        table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    })
    .createTable('subscribed_products', (table) => {
        table.comment('Stores the products that are being tracked by the subscribed emails');
        table.increments('id').primary();
        table.integer('email_id').notNullable();
        table.integer('product_id').notNullable();
        table.unique(['email_id', 'product_id']);
        table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    })
    .createTable('pending_emails', (table) => {
        table.comment('Store pending alert requests before verification');
        table.increments('id').primary();
        table.text('email').notNullable().unique();
        table.text('verification_code').notNullable();
        table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema
    .dropTable('websites')
    .dropTable('manufacturers')
    .dropTable('external_manufacturers')
    .dropTable('categories')
    .dropTable('internal_products')
    .dropTable('external_products')
    .dropTable('prices')
    .dropTable('subscribed_emails')
    .dropTable('subscribed_products')
    .dropTable('pending_emails');
}
