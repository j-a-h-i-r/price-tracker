import Fastify from "fastify";
import routes from "./api"

export async function setupServer() {
    const server = Fastify({
        logger: true,
    })

    server.register(routes, { prefix: "/api" });

    try {
        await server.listen(3000);
    } catch (err) {
        console.error("Server failed to start");
        console.error(err);

        server.log.error(err);
        process.exit(1);
    }
}
