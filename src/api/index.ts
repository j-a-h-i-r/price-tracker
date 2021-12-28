import { FastifyInstance } from "fastify";
import fastifyHelmet from "fastify-helmet";
import gpuRoutes from "./gpu";

export default async function routes(fastify: FastifyInstance, options: any) {
    fastify.register(fastifyHelmet);
    fastify.register(gpuRoutes, { prefix: "/gpus" });
}
