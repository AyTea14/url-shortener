import { randomBytes } from "crypto";
import { FastifyInstance } from "fastify";
import { Snowflake } from "@sapphire/snowflake";
import { encode, hashSecret } from "#lib/utils";

const snowflake = new Snowflake(1118707200000);

export async function create(fastify: FastifyInstance) {
    fastify.get("/create", async (req, reply) => {
        const admin = await req.db.users.findFirst({ where: { admin: true } });
        if (!admin) {
            const salt = encode(randomBytes(16));
            const password = encode(hashSecret("admin", salt));
            const username = "admin";
            const id = snowflake.generate();
            await req.db.users.create({ data: { name: username, password, salt, admin: true, id: id.toString() } });
        }
    });
}
