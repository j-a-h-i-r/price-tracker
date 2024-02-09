import { FastifyInstance, FastifyRequest } from "fastify";
import { postToFacebook } from "../startech/events"

export default async function routes(fastify: FastifyInstance, options: any) {
    fastify.get("/triggerfbpost", async (req: FastifyRequest, res) => {
        postToFacebook();
        return true;
    })
}
