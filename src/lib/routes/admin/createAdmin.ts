import { randomBytes as random } from "crypto";
import { FastifyInstance } from "fastify";
import { generateSnowflake, encode, hashSecret } from "#lib/utils";
import { config } from "#config";
import { ExtendedError } from "#lib/exceptions";
import { HttpCode } from "#lib/types";

export async function createAdmin(fastify: FastifyInstance) {
    fastify.route<{ Body: { name: string; password: string } }>({
        url: "/createAdmin",
        method: "POST",
        preHandler: fastify.auth([
            async function (req, reply) {
                const { name, pass } = req.query as { name: string; pass: string };
                if (!name || !pass) throw new ExtendedError("Restricted url path", HttpCode["Unauthorized"]);
                if (name !== config.admin.username && pass !== config.admin.pass)
                    throw new ExtendedError("Restricted url path", HttpCode["Unauthorized"]);
            },
        ]),
        handler: async function (req, reply) {
            const { name, password: pass } = req.body;
            const admin = await req.db.users.findFirst({ where: { admin: true } });
            if (!admin) {
                const salt = encode(random(16));
                const password = hashSecret(pass, salt);
                const username = name.toLowerCase();
                const id = generateSnowflake();
                await req.db.users.create({ data: { name: username, password, salt, admin: true, id: id } });
            }
        },
    });
}
