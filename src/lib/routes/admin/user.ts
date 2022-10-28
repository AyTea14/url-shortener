import { FastifyInstance } from "fastify";
import { randomBytes as random } from "crypto";
import { encode, hashSecret, passAuth } from "#lib/utils";
import { ExtendedError } from "#lib/exceptions";
import { HttpCode } from "#lib/types";

export async function me(fastify: FastifyInstance) {
    fastify
        .route<{ Querystring: { new?: string } }>({
            url: "/@me/token",
            method: "GET",
            preHandler: fastify.auth([passAuth]),
            config: { rateLimit: { max: 1, timeWindow: "10s" } },
            handler: async function (req, reply) {
                const { id } = req.user!;
                const salt = encode(random(8));
                const secret = encode(random(24));
                const token = `${encode(id)}.${salt}.${secret}`;
                const hash = hashSecret(secret, salt);
                await fastify.db.users.update({ where: { id }, data: { token: hash } });
                reply.type("application/json").send({ success: true, token });
            },
        })
        .route<{ Body: { new: string } }>({
            url: "/@me/password",
            method: "POST",
            preHandler: fastify.auth([passAuth]),
            handler: async function (req, reply) {
                const pass = req.body?.new;
                if (!pass) throw new ExtendedError("No new password provided", HttpCode["Bad Request"]);
                const salt = encode(random(16));
                const hash = hashSecret(pass, salt);
                await fastify.db.users.update({ where: { id: req.user!.id }, data: { salt, password: hash } });
                reply.type("application/json").send({ success: true });
            },
        });
}
