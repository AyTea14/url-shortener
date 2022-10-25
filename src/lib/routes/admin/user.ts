import { FastifyInstance } from "fastify";
import { randomBytes as random, randomBytes } from "crypto";
import { encode, hashSecret, passAuth } from "#lib/utils";
import { logger } from "#root/index";
import { ExtendedError } from "#lib/exceptions";
import { HttpCode } from "#lib/types";

export async function me(fastify: FastifyInstance) {
    fastify
        .route({
            url: "/@me/token",
            method: "GET",
            preHandler: fastify.auth([passAuth]),
            config: { rateLimit: { max: 1, timeWindow: "10s" } },
            handler: async function (req, reply) {
                console.log(req.user);
                const salt = encode(random(8));
                const secret = encode(random(24));
                const { id } = req.user!;
                const token = `${encode(id)}.${salt}.${secret}`;
                const hash = hashSecret(secret, salt);
                await fastify.db.users.update({ where: { id }, data: { token: hash } });
                logger.debug(`[${req.user!.name}] token`);
                reply.type("application/json").send({ token });
            },
        })
        .route<{ Body: { new: string } }>({
            url: "/@me/password",
            method: "POST",
            preHandler: fastify.auth([passAuth]),
            handler: async function (req, reply) {
                const pass = req.body?.new;
                if (!pass) throw new ExtendedError("No new password provided", HttpCode["Bad Request"]);
                const salt = encode(randomBytes(16));
                const hash = hashSecret(pass, salt);
                await fastify.db.users.update({ where: { id: req.user!.id }, data: { salt, password: hash } });
                reply.type("application/json").send({ success: true });
            },
        });
}
