import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema
    .createTable("pending_emails", (table) => {
        table.comment("Store pending alert requests before verification");

        table.increments("id");
        table.integer("gpuid");
        table.text("email").unique();
        table.text("verification_code");
        table.timestamp("created_at").defaultTo(knex.fn.now());
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema
    .dropTable("pending_emails");
}

