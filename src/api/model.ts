import { FastifyInstance, FastifyRequest } from "fastify";
import * as gpuModelService from "../startech/models/models.service";

export default async function routes(fastify: FastifyInstance, options: any) {
    fastify.get("/", async (req, res) => {
        return gpuModelService.getGpuModels();
    })

    fastify.get("/:modelid/gpus", async (req: FastifyRequest<{ Params: { modelid: string } }>, res) => {
        const idParam = req.params.modelid;
        const modelId = Number(idParam);
        if (!modelId) {
            return res.status(400).send({ message: `Model id (${idParam}) is not valid` });
        }

        const gpus = await gpuModelService.getGpusOfModel(modelId);
        return gpus;
    })

    fastify.post("/:modelid/gpus", async (req: FastifyRequest<{ Params: { modelid: string }, Body: { gpuIds: string[] } }>, res) => {
        const idParam = req.params.modelid;
        const modelId = Number(idParam);
        if (!modelId) {
            return res.status(400).send({ message: `Model id (${idParam}) is not valid` });
        }

        const reqGpuIds = req.body.gpuIds ?? [];
        if (reqGpuIds.length === 0) {
            return res.status(400).send({ message: "At least one gpuId is required!" });
        }

        const errorValues: string[] = [];
        reqGpuIds.forEach((gpuId) => {
            if (isNaN(Number(gpuId))) {
                errorValues.push(gpuId);
            }
        })
        if (errorValues.length > 0) {
            return res.status(400).send({ message: `Only integer values are allowed. Following inputs are invalid: [${errorValues}]` });
        }

        const gpuIds = reqGpuIds.map((gpuId) => Number(gpuId));

        const response = await gpuModelService.saveGpusOfModel(modelId, gpuIds);
        return response;
    })

    fastify.get("/:modelid/gpu-prices",async (req: FastifyRequest<{ Params: { modelid: string }}>, res) => {
        const idParam = req.params.modelid;
        const modelId = Number(idParam);
        if (!modelId) {
            return res.status(400).send({ message: `Model id (${idParam}) is not valid` });
        }

        const gpuPrices = await gpuModelService.getGpuPricesUnderModel(modelId);
        if (!gpuPrices) {
            return res.status(500).send({message: `Could not generate price changes of Model (${modelId})!`});
        }

        return gpuPrices;
    })
}
