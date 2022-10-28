import { config } from "#config";
import { ExtendedError } from "#lib/exceptions";
import { HttpCode } from "#lib/types";
import { FastifyReply, FastifyRequest } from "fastify";

export async function auth(req: FastifyRequest, reply: FastifyReply) {
    const authorization = req.headers.authorization;
    if (!authorization) throw new ExtendedError("You must provide an API key to access this route", HttpCode["Unauthorized"]);
    if (authorization !== config.apiKey) throw new ExtendedError("The provided API key is incorrect", HttpCode["Unauthorized"]);
}
