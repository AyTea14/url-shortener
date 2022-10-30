import { Prisma, shortened } from "@prisma/client";
import { FastifyInstance } from "fastify";
import { randomString, encode } from "#lib/utils";
import { config } from "#config";
import { ExtendedError } from "#lib/exceptions";
import { HttpCode } from "#lib/types";

const MAX_SHORT_ID_GENERATION_ATTEMPTS = 10;

export async function shorten(fastify: FastifyInstance, userId: string, url: string) {
    let created: shortened | undefined = undefined;
    let attempts = 0;
    let id: string;

    do {
        if (attempts++ > MAX_SHORT_ID_GENERATION_ATTEMPTS)
            throw new ExtendedError(
                `Couldn't generate a unique shortened ID in ${attempts} attempts`,
                HttpCode["Internal Server Error"]
            );

        id = randomString(config.shortLength);
        const encodedId = encode(id);

        try {
            created = await fastify.db.shortened.create({ data: { code: encodedId, url, userId } });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            } else throw new Error(error as string);
        }
    } while (!created);

    return id;
}
