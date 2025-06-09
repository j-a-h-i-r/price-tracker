import { knex } from '../core/db.ts';
import { type User } from '../types/user.types.ts';

export async function storeUser(email: string): Promise<User> {
    const existingUser = await knex('users').where('email', email).first();
    if (existingUser) {
        return existingUser;
    }
    const [user] = await knex('users').insert({ email }).returning('*');
    return user;
}

export async function getUserByEmail(email: string): Promise<User | null> {
    const user = await knex('users').where('email', email).first();
    return user;
}

export async function listUsers(): Promise<User[]> {
    const users = await knex('users').select('*');
    return users;
}
