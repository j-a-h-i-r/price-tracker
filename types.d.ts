// eslint-disable-next-line @typescript-eslint/no-unused-vars
import fastify from 'fastify';

declare module 'fastify' {
    export interface FastifyRequest {
        user?: { email: string };
    }
}
