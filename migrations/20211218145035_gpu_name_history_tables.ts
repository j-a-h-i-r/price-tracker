import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema
    .createTable("gpus", (table) => {
        table.increments("id");
        table.text("name");
        table.text("url");
        table.text("slug");
        table.text("website");
        table.unique(["slug", "website"], "gpu_url_slug");
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
