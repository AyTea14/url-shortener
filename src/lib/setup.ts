import "dotenv/config";
import fastify from "fastify";
import auth from "@fastify/auth";
import view from "@fastify/view";
import st from "@fastify/static";
import socketIO from "fastify-socket.io";
import ratelimit from "@fastify/rate-limit";
import { urls, users } from "#lib/routes";
import { PrismaClient } from "@prisma/client";
import { generateSnowflake, Logger, removeTrailingSlash, reqLogger } from "#lib/utils";
import { config, rateLimitConfig, stConfig, viewConfig } from "#config";
import { home } from "#lib/routes";

export const logger = new Logger();
const PORT = config.port || 3000;
const server = fastify({
    ignoreTrailingSlash: false,
    ignoreDuplicateSlashes: true,
    trustProxy: true,
    genReqId: (req) => generateSnowflake(),
});
server.db = new PrismaClient();

export default await server.db.$connect().then(async () => {
    logger.info("successfully connected to database");
    await server.register(st, stConfig);
    await server.register(view, viewConfig);
    await server.register(socketIO);
    await server.register(ratelimit, rateLimitConfig);
    await server.register(auth);
    await server.register(users, { prefix: "/users" });
    await server.register(home);
    await server.register(urls);

    setInterval(async () => {
        let [urls, _visits] = await server.db.$transaction([
            server.db.shortened.count({ where: { blocked: false } }),
            server.db.shortened.findMany({ where: { blocked: false }, select: { visits: true } }),
        ]);
        let visits = _visits.reduce((prev, curr) => prev + curr.visits.length, 0);

        server.io.emit("data", { urls, visits });
    }, 1000);
    server
        .addHook("onRequest", async (req, reply) => {
            req.user = null;
            req.admin = false;
            req.db = server.db;
        })
        .addHook("preHandler", removeTrailingSlash)
        .addHook("onResponse", async (_, reply) => reply.getResponseTime())
        .addHook("onResponse", reqLogger);

    server.listen({ port: PORT, host: "0.0.0.0" }, (err, address) => {
        logger.info(`application listening at ${address}`);
    });
});
