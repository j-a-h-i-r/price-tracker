import { FastifyInstance } from "fastify";
import gpuRoutes from "./gpu";

export default async function routes(fastify: FastifyInstance, options: any) {
    fastify.register(gpuRoutes);
}
