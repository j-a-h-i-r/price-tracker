import { FastifyInstance, FastifyRequest } from "fastify";
import * as gpuService from "../startech/service";

type GpuQuery = { name?: string, url?: string, slug?: string, website?: string };

export default async function routes(fastify: FastifyInstance, options: any) {
    fastify.get("/", async (req: FastifyRequest<{ Querystring: GpuQuery }>, res) => {
        const query = req.query;
        return gpuService.getGpus(query);
    })

    fastify.get("/:id", async (req: FastifyRequest<{ Params: { id: number } }>, res) => {
        const gpuId = req.params.id;
        const gpu = await gpuService.getGpu(gpuId);
        if (!gpu) {
            return res.status(500).send({ message: `GPU id (${gpuId}) is not valid` });
        }
        return gpu;
    })

    fastify.get("/:id/prices", async (req: FastifyRequest<{ Params: { id: number } }>, res) => {
        const gpuId = req.params.id;
        const prices = await gpuService.getGpuPrices(gpuId);
        return prices;
    })
}
