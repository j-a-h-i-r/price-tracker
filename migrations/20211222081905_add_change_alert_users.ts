import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema
    .createTable("subscribed_emails", (table) => {
        table.comment("Stores the emails and an authorization code for making changes to subscription");

        table.increments("id");
        table.text("email");
        table.text("auth_code");
        table.timestamp("created_at").defaultTo(knex.fn.now());
    })
    .createTable("subscribed_gpus", (table) => {
        table.comment("Stores the gpu-email combo that was subscribed to");

        table.increments("id");
        table.integer("emailid");
        table.integer("gpuid");
        table.timestamp("created_at").defaultTo(knex.fn.now());
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema
    .dropTable("subscribed_emails")
    .dropTable("subscribed_gpus");
}

