import "dotenv/config";
import fastify from "fastify";
import { urls } from "#lib/urls";
import { PrismaClient } from "@prisma/client";
import { Logger, removeTrailingSlash, reqLogger } from "#lib/utils";

export const logger = new Logger();
const PORT = Number(process.env.PORT) || 3000;
const server = fastify({
    ignoreTrailingSlash: false,
    trustProxy: true,
    ignoreDuplicateSlashes: true,
});
server.db = new PrismaClient();

(async () => {
    await server.register(urls);
    await server.db.$connect();

    server
        .addHook("preHandler", removeTrailingSlash)
        .addHook("onResponse", async (_, reply) => reply.getResponseTime())
        .addHook("onResponse", reqLogger);

    server.listen({ port: PORT, host: "0.0.0.0" }, (err, address) => {
        logger.info(`application listening at ${address}`);
    });
})();
