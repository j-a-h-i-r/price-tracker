import { FastifyInstance, FastifyRequest } from "fastify";
import * as gpuService from "../startech/service";
import { sendEmailOnGpuPriceAvailablityChange } from "../startech/events"

type GpuQuery = { name?: string, url?: string, slug?: string, website?: string };

export default async function routes(fastify: FastifyInstance, options: any) {
    fastify.get("/", async (req: FastifyRequest<{ Querystring: GpuQuery }>, res) => {
        const query = req.query;
        return gpuService.getGpus(query);
    })

    fastify.get("/changes", async (req, res) => {
        const changes = await gpuService.getLatestGpuChanges();
        return changes;
    })

    fastify.get("/emails", async (req, res) => {
        const emails = await gpuService.getGpuEmailSubscribers([1, 2]);
        return emails;
    })

    fastify.post("/alert", async (req, res) => {
        return sendEmailOnGpuPriceAvailablityChange();
    })

    // Register new alerts
    fastify.post("/:gpuid/subscriptions", async (req: FastifyRequest<{ Body: { email: string }, Params: { gpuid: string } }>, res) => {
        const idParam = req.params.gpuid;
        const gpuId = Number(idParam);
        if (!gpuId) {
            return res.status(400).send({ message: `GPU id (${idParam}) is not valid` });
        }

        const email = req.body?.email;
        if (!email) {
            return res.status(400).send({ message: `email is required` });
        }

        await gpuService.savePendingEmail(email, gpuId);
        return { message: `Check your email (${email}) for a verification code` }
    })

    // Verify pending alert
    // @TODO: Add request limit/delay
    fastify.patch("/:gpuid/subscriptions", async (req: FastifyRequest<{ Body: { email: string, code: string }, Params: { gpuid: string } }>, res) => {
        const idParam = req.params.gpuid;
        const gpuId = Number(idParam);
        if (!gpuId) {
            return res.status(400).send({ message: `GPU id (${idParam}) is not valid` });
        }

        const { email, code } = req.body;
        if (!email || !code) {
            return res.status(400).send({ message: "email and code are required " });
        }

        const isVerified = await gpuService.handleEmailVerification(email, code, gpuId);
        if (!isVerified) {
            return res.status(400).send({ message: "Email could not be verified" });
        }

        return { message: "Success" }
    })

    fastify.get("/:id", async (req: FastifyRequest<{ Params: { id: string } }>, res) => {
        const idParam = req.params.id;
        const gpuId = Number(idParam);
        if (!gpuId) {
            return res.status(500).send({ message: `GPU id (${idParam}) is not valid` });
        }
        const gpu = await gpuService.getGpu(gpuId);
        if (!gpu) {
            return res.status(500).send({ message: `GPU id (${gpuId}) is not valid` });
        }
        return gpu;
    })

    fastify.get("/:id/prices", async (req: FastifyRequest<{ Params: { id: string } }>, res) => {
        const idParam = req.params.id;
        const gpuId = Number(idParam);
        if (!gpuId) {
            return res.status(500).send({ message: `GPU id (${idParam}) is not valid` });
        }
        const prices = await gpuService.getGpuPrices(gpuId);
        return prices;
    })
}
