import "dotenv/config";
import fastify from "fastify";
import { urls } from "#lib/urls";
import { PrismaClient } from "@prisma/client";
import { Logger, removeTrailingSlash, reqLogger } from "#lib/utils";

export const logger = new Logger();
const server = fastify({ ignoreTrailingSlash: true, trustProxy: true });
server.db = new PrismaClient();

(async () => {
    await server.register(urls);
    await server.db.$connect();

    server
        .addHook("preHandler", removeTrailingSlash)
        .addHook("onResponse", async (_, reply) => reply.getResponseTime())
        .addHook("onResponse", reqLogger);

    server.listen({ port: 3000, host: "0.0.0.0" }, (err, address) => {
        logger.info(`application listening at ${address}`);
    });
})();
