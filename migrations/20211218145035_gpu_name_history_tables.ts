import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema
    .createTable("gpus", (table) => {
        table.increments("id");
        table.string("name");
        table.string("url");
        table.string("slug").index("gpu_url_slug");
        table.string("website");
    })
    .createTable("gpu_prices", (table) => {
        table.increments("id");
        table.integer("gpuid");
        table.boolean("is_available");
        table.double("price");
        table.timestamp("updated_at");
    })
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema
    .dropTable("gpus")
    .dropTable("gpu_prices");
}
