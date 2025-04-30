import { knex } from '../core/db.js';

export async function storeUser(email: string) {
    const existingUser = await knex('users').where('email', email).first();
    if (existingUser) {
        return existingUser;
    }
    const [user] = await knex('users').insert({ email }).returning('*');
    return user;
}

export async function getUserByEmail(email: string) {
    const user = await knex('users').where('email', email).first();
    return user;
}

