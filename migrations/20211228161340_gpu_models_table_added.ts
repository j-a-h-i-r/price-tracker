import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema
    .createTable("gpu_models", (table) => {
        table.increments("id").primary();
        table.text("name");
    })
    .alterTable("gpus", (table) => {
        table.integer("modelid");
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema
    .dropTable("gpu_models")
    .alterTable("gpus", (table) => {
        table.dropColumn("modelid");
    })
}

