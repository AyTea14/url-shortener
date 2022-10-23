import { ExtendedError } from "#lib/exceptions";
import { HttpCode } from "#lib/types";
import { FastifyReply, FastifyRequest } from "fastify";

export async function auth(req: FastifyRequest, reply: FastifyReply) {
    const authorization = req.headers.authorization;
    if (!authorization) throw new ExtendedError("You must provide an API key to access this route", HttpCode["Unauthorized"]);
    if (authorization !== process.env.API_KEY) throw new ExtendedError("The provided API key is incorrect", HttpCode["Unauthorized"]);
}
// function camelPad(str: string) {
//     return str
//         .replace(/([A-Z]+)([A-Z][a-z])/g, " $1 $2")
//         .replace(/([a-z\d])([A-Z])/g, "$1 $2")
//         .replace(/([a-zA-Z])(\d)/g, "$1 $2")
//         .replace(/^./, function (str) {
//             return str.toUpperCase();
//         })
//         .trim();
// }
