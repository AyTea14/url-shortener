import { ExtendedError } from "#lib/exceptions";
import { HttpCode } from "#lib/types";
import { isBlockedHostname, isHealthy, shorten, tokenAuth, isExisted, encode, decode } from "#lib/utils";
import { FastifyInstance } from "fastify";
import { readFileSync } from "fs";
import { resolve } from "path";

const version = Reflect.get(JSON.parse(readFileSync(resolve(process.cwd(), "package.json")).toString()), "version");

export async function home(fastify: FastifyInstance) {
    fastify
        .route({
            method: "GET",
            url: "/health",
            handler: async (req, reply) => {
                let code: number;
                const health = await isHealthy(fastify);
                if (health.status === "ok") code = HttpCode["OK"];
                else code = HttpCode["Internal Server Error"];

                reply.code(code).send(health);
            },
        })
        .route({
            method: "GET",
            url: "/favicon.ico",
            handler: (req, reply) => reply.code(HttpCode["No Content"]),
        })
        .route({
            method: "GET",
            url: "/stats",
            handler: async function (req, reply) {
                let [urls, _visits] = await fastify.db.$transaction([
                    fastify.db.shortened.count({ where: { blocked: false } }),
                    fastify.db.shortened.findMany({ where: { blocked: false }, select: { visits: true } }),
                ]);
                let visits = _visits.reduce((prev, curr) => prev + curr.visits.length, 0);

                return reply.type("application/json").send({ urls, visits, version });
            },
        })
        .route<{ Body: { url: string } }>({
            method: "GET",
            url: "/",
            handler: async (req, reply) => {
                let [urls, _visits] = await fastify.db.$transaction([
                    fastify.db.shortened.count({ where: { blocked: false } }),
                    fastify.db.shortened.findMany({ where: { blocked: false }, select: { visits: true } }),
                ]);
                let visits = _visits.reduce((prev, curr) => prev + curr.visits.length, 0);

                return reply.view("index.ejs", { urls, visits });
            },
        });
}

export async function api(fastify: FastifyInstance) {
    fastify
        .route<{ Body: { url: string } }>({
            method: "POST",
            url: "/shorten",
            config: { rateLimit: { max: 200, timeWindow: "1h" } },
            preHandler: fastify.auth([tokenAuth]),
            handler: async function (req, reply) {
                const baseUrl = `${process.env.BASE_URL ? process.env.BASE_URL : `${req.protocol}://${req.hostname}`}`;
                const inputUrl = req.body?.url;
                if (!inputUrl) throw new ExtendedError("Please enter a url", HttpCode["Bad Request"]);
                isBlockedHostname(inputUrl, req.hostname);

                const existedId = await isExisted(fastify, inputUrl);
                if (existedId)
                    return reply
                        .type("application/json")
                        .code(HttpCode["OK"])
                        .send({ short: existedId, url: new URL(existedId, baseUrl).toString() });

                const id = await shorten(fastify, req.user!.id, inputUrl);
                const url = new URL(id, baseUrl);
                await fastify.db.shortened.findMany().then((data) => {
                    fastify.io.emit("created", { urls: data.length });
                });

                reply.type("application/json").code(HttpCode["Created"]).send({ short: id, url: url.toString() });
            },
        })
        .route<{ Params: { short: string } }>({
            method: "GET",
            url: "/stats/:short",
            handler: async function (req, reply) {
                const code = encode(req.params.short);
                const data = await fastify.db.shortened.findUnique({
                    where: { code },
                    select: { url: true, visits: true, createdAt: true },
                });
                if (!data) throw new ExtendedError("Shortened URL not found in database", HttpCode["Not Found"]);

                return reply.type("application/json").send({ url: data.url, visits: data.visits.map((date) => date.getTime()) });
            },
        });
}

export async function urls(fastify: FastifyInstance) {
    fastify
        .route<{ Body: { url: string } }>({
            method: "POST",
            url: "/shorten",
            config: { rateLimit: { max: 200, timeWindow: "1h" } },
            preHandler: fastify.auth([tokenAuth]),
            handler: async function (req, reply) {
                const baseUrl = `${process.env.BASE_URL ? process.env.BASE_URL : `${req.protocol}://${req.hostname}`}`;
                const inputUrl = req.body?.url;
                if (!inputUrl) throw new ExtendedError("Please enter a url", HttpCode["Bad Request"]);
                isBlockedHostname(inputUrl, req.hostname);

                const existedId = await isExisted(fastify, inputUrl);
                if (existedId)
                    return reply
                        .type("application/json")
                        .code(HttpCode["OK"])
                        .send({ short: existedId, url: new URL(existedId, baseUrl).toString() });

                const id = await shorten(fastify, req.user!.id, inputUrl);
                const url = new URL(id, baseUrl);
                await fastify.db.shortened.findMany().then((data) => {
                    fastify.io.emit("created", { urls: data.length });
                });

                reply.type("application/json").code(HttpCode["Created"]).send({ short: id, url: url.toString() });
            },
        })
        .route<{ Params: { short: string } }>({
            method: "GET",
            url: "/:short",
            handler: async function (req, reply) {
                const now = new Date();
                const code = encode(req.params.short);
                const data = await fastify.db.shortened.findUnique({
                    where: { code },
                    select: { url: true, visits: true },
                });
                if (!data) return reply.view("error.ejs", { error: `Shortened URL not found in database` });
                // if (!data) throw new ExtendedError("Shortened URL not found in database", HttpCode["Not Found"]);

                await fastify.db.shortened
                    .update({
                        where: { code },
                        data: { visits: { push: now } },
                    })
                    .then((data) => fastify.io.emit(req.params.short, { visits: data!.visits.length }));
                await fastify.db.shortened
                    .findMany()
                    .then((data) => fastify.io.emit("visited", { visits: data.reduce((all, url) => all + url.visits.length, 0) }));

                return reply.redirect(HttpCode["Permanent Redirect"], data.url);
            },
        })
        .route<{ Params: { short: string } }>({
            method: "GET",
            url: "/:short-",
            handler: async function (req, reply) {
                const code = encode(req.params.short);
                const data = await fastify.db.shortened.findUnique({
                    where: { code },
                    select: { url: true, visits: true, createdAt: true },
                });
                if (!data) return reply.view("error.ejs", { error: `Shortened URL not found in database` });
                // if (!data) throw new ExtendedError("Shortened URL not found in database", HttpCode["Not Found"]);

                return reply.view("stats.ejs", {
                    url: data.url,
                    visits: data.visits.length,
                    createdAt: data.createdAt.getTime(),
                    short: `${req.protocol}://${req.hostname}/${decode(code)}`,
                });
                // return reply.type("application/json").send({ url: data.url, visits: data.visits.map((date) => date.getTime()) });
            },
        });
}
