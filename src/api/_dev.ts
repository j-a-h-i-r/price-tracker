import { FastifyInstance, FastifyRequest } from "fastify";
import { postToFacebook } from "../startech/events"
import { getLatestGpuChanges } from "../startech/service";
import { scrapeAndSaveGpuPrices } from "../startech/cron";

export default async function routes(fastify: FastifyInstance, options: any) {
    fastify.get("/triggerfbpost", async (req: FastifyRequest, res) => {
        postToFacebook();
        return true;
    })

    fastify.get("/checkpricechange", async(req, res) => {
        console.log("sendin prices")
        // await scrapeAndSaveGpuPrices();
        return getLatestGpuChanges();
    })
}
