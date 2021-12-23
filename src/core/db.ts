import Knex from 'knex';
import config from "./config";

export const knex = Knex({
    client: "postgres",
    connection: config.databaseUrl,
    pool: {
        min: 2,
        max: 50,
    },
    debug: !config.isProduction,
})
