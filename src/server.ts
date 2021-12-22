import Fastify from "fastify";
import routes from "./api";
import logger from "./core/logger";

export async function setupServer() {
    const server = Fastify({
        logger: true,
    })

    server.register(routes, { prefix: "/api" });

    try {
        await server.listen(3000);
    } catch (err) {
        logger.error("Server failed to start");
        logger.error(err);

        server.log.error(err);
        process.exit(1);
    }
}
