import { ExtendedError } from "#lib/exceptions";
import { HttpCode } from "#lib/types";
import { shortened, Prisma } from "@prisma/client";
import { FastifyInstance } from "fastify";
import { randomString } from "#lib/utils";
import { randomInt } from "crypto";

const MAX_SHORT_ID_GENERATION_ATTEMPTS = 10;

export async function shorten(fastify: FastifyInstance, url: string) {
    let attempts = 0;
    let created: shortened | undefined;
    let id: string;

    do {
        if (attempts++ > MAX_SHORT_ID_GENERATION_ATTEMPTS) {
            throw new ExtendedError(
                `Couldn't generate a unique shortened ID in ${attempts} attempts`,
                HttpCode["Service Unavailable"]
            );
        }

        id = randomString(8);
        const encodedId = Buffer.from(id, "ascii").toString("base64url");

        try {
            created = await fastify.db.shortened.create({ data: { code: encodedId, url } });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            } else {
                throw new Error(error as string);
            }
        }
    } while (!created);

    return id;
}
