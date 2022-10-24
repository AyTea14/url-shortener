import { FastifyInstance } from "fastify";
import { randomBytes as random } from "crypto";
import { encode, hashSecret, passAuth } from "#lib/utils";
import { logger } from "#root/index";

export async function token(fastify: FastifyInstance) {
    fastify.route({
        url: "/@me/token",
        method: "GET",
        preHandler: fastify.auth([passAuth]),
        handler: async function (req, reply) {
            const salt = encode(random(8));
            const secret = encode(random(24));
            const { id } = req.user;
            const token = `${encode(id)}.${salt}.${secret}`;
            const hash = hashSecret(secret, salt);
            await fastify.db.users.update({ where: { id }, data: { token: hash } });
            logger.debug(`[${req.user.name}] token`);
            reply.type("application/json").send({ token });
        },
    });
}
