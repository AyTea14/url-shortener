import "dotenv/config";
import fastify from "fastify";
import ratelimit from "@fastify/rate-limit";
import auth from "@fastify/auth";
import { urls, users } from "#lib/routes";
import { PrismaClient } from "@prisma/client";
import { Logger, removeTrailingSlash, reqLogger } from "#lib/utils";
import { home } from "#lib/routes";
import { config } from "#config";

export const logger = new Logger();
const PORT = config.port || 3000;
const server = fastify({
    ignoreTrailingSlash: false,
    ignoreDuplicateSlashes: true,
    trustProxy: true,
});
server.db = new PrismaClient();

await server.register(ratelimit);
await server.register(auth, { defaultRelation: "and" });
await server.register(users, { prefix: "/users" });
await server.register(home);
await server.register(urls);
await server.db.$connect().then(() => logger.info("successfully connected to database"));

server
    .addHook("onRequest", async (req, reply) => {
        req.db = server.db;
    })
    .addHook("preHandler", removeTrailingSlash)
    .addHook("onResponse", async (_, reply) => reply.getResponseTime())
    .addHook("onResponse", reqLogger);

server.listen({ port: PORT, host: "0.0.0.0" }, (err, address) => {
    logger.info(`application listening at ${address}`);
});
