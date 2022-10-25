import { ExtendedError } from "#lib/exceptions";
import { HttpCode } from "#lib/types";
import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from "fastify";
import { decode, hashSecret } from "./functions.js";

export async function passAuth(req: FastifyRequest, reply: FastifyReply) {
    const auth = req.headers["authorization"];
    if (!auth) throw new ExtendedError("You must provide an API key to access this route", HttpCode["Unauthorized"]);
    const [name, pass] = auth.split(":");
    const user = await req.db.users.findFirst({ where: { name } });
    if (!user) throw new ExtendedError("Invalid user provided", HttpCode["Bad Request"]);
    const hash = hashSecret(pass, user.salt);
    req.user = { name: user.name, id: user.id };
    req.admin = user.admin;
    if (hash !== user.password) throw new ExtendedError("Incorrect password provided", HttpCode["Unauthorized"]);
}
// export async function passAuthWithId(req: FastifyRequest, reply: FastifyReply) {
//     const auth = req.headers["authorization"];
//     if (!auth) throw new ExtendedError("You must provide an API key to access this route", HttpCode["Unauthorized"]);
//     const [name, pass] = auth.split(":");
//     const user = await req.db.users.findFirst({ where: { name } });
//     if (!user) throw new ExtendedError("Invalid user provided", HttpCode["Bad Request"]);
//     const hash = hashSecret(pass, user.salt);
//     req.user = { name: user.name, id: user.id };
//     req.admin = user.admin;
//     if (hash !== user.password)
//         throw new ExtendedError("Incorrect password provided", HttpCode["Unauthorized"]);
// }

export async function adminAuth(req: FastifyRequest, reply: FastifyReply) {
    if (!req.admin) throw new ExtendedError("Admin privileges required", HttpCode["Unauthorized"]);
}

export async function tokenAuth(req: FastifyRequest, reply: FastifyReply) {
    const token = req.headers["authorization"];
    if (!token) throw new ExtendedError("No token provided", HttpCode["Unauthorized"]);
    const _token = token.split(".");
    if (_token.length !== 3) throw new ExtendedError("Malformed token", HttpCode["Unauthorized"]);
    const [_id, salt, secret] = _token;
    const id = decode(_id);
    const user = await req.db.users.findUnique({ where: { id } });

    if (!user) throw new ExtendedError("Invalid token", HttpCode["Unauthorized"]);
    const hash = hashSecret(secret, salt);
    if (hash !== user.token) throw new ExtendedError("Invalid token", HttpCode["Unauthorized"]);
    req.user = { id: user.id, name: user.name };
    req.admin = user.admin;
}

// function hashSecret(password: BinaryLike, salt: BinaryLike) {
//     return encode(pbkdf2Sync(password, salt, 16384, 128, "sha512"));
// }
// function encode(input: Buffer | string) {
//     return Buffer.from(input).toString("base64url");
// }
// function decode(input: string) {
//     return Buffer.from(input, "base64url").toString("utf-8");
// }
