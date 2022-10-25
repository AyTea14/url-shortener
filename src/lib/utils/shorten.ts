import { Prisma } from "@prisma/client";
import { FastifyInstance } from "fastify";
import { randomString } from "#lib/utils";
import { config } from "#config";

const MAX_SHORT_ID_GENERATION_ATTEMPTS = 10;

export async function shorten(fastify: FastifyInstance, userId: string, url: string) {
    let id: string;

    id = randomString(config.shortLength);
    const encodedId = Buffer.from(id, "ascii").toString("base64url");

    try {
        await fastify.db.shortened.create({ data: { code: encodedId, url, userId } });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        } else {
            throw new Error(error as string);
        }
    }

    return id;
}
