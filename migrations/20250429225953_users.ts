import type { Knex } from 'knex';


export async function up(knex: Knex): Promise<void> {
    return knex.schema
    .createTable('users', (table) => {
        table.comment('Stores users');
        table.increments('id').primary();
        table.text('email').notNullable().unique();
        table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    })
    .createTable('tracked_products', (table) => {
        table.comment('Stores the products that are tracked by users');
        table.increments('id').primary();
        table.integer('user_id').notNullable();
        table.integer('internal_product_id').notNullable();
        table.float('target_price').notNullable().comment('If lowest price is lower than this, notify the user');
        table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
        table.unique(['user_id', 'internal_product_id']);
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema
    .dropTableIfExists('tracked_products')
    .dropTableIfExists('users');
}

