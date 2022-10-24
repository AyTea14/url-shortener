import { ExtendedError } from "#lib/exceptions";
import { HttpCode } from "#lib/types";
import { randomBytes as random } from "crypto";
import { adminAuth, encode, hashSecret, tokenAuth } from "#lib/utils";
import { FastifyInstance } from "fastify";
import { Snowflake } from "@sapphire/snowflake";
import { logger } from "#root/index";

const snowflake = new Snowflake(1118707200000);

export async function users(fastify: FastifyInstance) {
    fastify.route<{ Params: { name: string }; Body: { pass: string; admin: string } }>({
        url: "/:name",
        method: "POST",
        preHandler: fastify.auth([tokenAuth, adminAuth], { run: "all" }),
        handler: async function (req, reply) {
            const { name } = req.params;
            const { pass, admin } = req.body;
            if (!pass) throw new ExtendedError("Password missing", HttpCode["Bad Request"]);
            if (!admin) throw new ExtendedError("Specify whether this user is an admin", HttpCode["Bad Request"]);
            const isAdmin = ["true", true, "y", "yes", "1", 1].includes(admin);
            return req.db.users.findFirst({ where: { name } }).then(async (user) => {
                if (user) throw new ExtendedError("User already exists", HttpCode["Conflict"]);
                const salt = encode(random(16));
                const password = hashSecret(pass, salt);
                await req.db.users.create({
                    data: { id: snowflake.generate().toString(), admin: isAdmin, salt, password, name },
                });
                logger.debug(`[${name}]`);
                return reply.type("application/json").send({ success: true });
            });
        },
    });
}
