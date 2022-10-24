import "dotenv/config";
import fastify from "fastify";
import ratelimit from "@fastify/rate-limit";
import { urls } from "#lib/urls";
import { PrismaClient } from "@prisma/client";
import { Logger, removeTrailingSlash, reqLogger } from "#lib/utils";
import { home } from "#lib/urls";

export const logger = new Logger();
const PORT = Number(process.env.PORT) || 3000;
const server = fastify({
    ignoreTrailingSlash: false,
    ignoreDuplicateSlashes: true,
    trustProxy: true,
});
server.db = new PrismaClient();

await server.register(ratelimit);
await server.register(home);
await server.register(urls);
await server.db.$connect().then(() => logger.info("successfully connected to database"));

server
    .addHook("preHandler", removeTrailingSlash)
    .addHook("onResponse", async (_, reply) => reply.getResponseTime())
    .addHook("onResponse", reqLogger);

server.listen({ port: PORT, host: "0.0.0.0" }, (err, address) => {
    logger.info(`application listening at ${address}`);
});
