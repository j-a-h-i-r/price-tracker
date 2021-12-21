import Knex from 'knex';

export const knex = Knex({
    client: "postgres",
    connection: process.env.DB_URL,
    pool: {
        min: 2,
        max: 50,
    },
    debug: true,
})
