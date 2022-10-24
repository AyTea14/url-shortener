import { ExtendedError } from "#lib/exceptions";
import { HttpCode } from "#lib/types";
import { logger } from "#root/index";
import { BinaryLike, pbkdf2Sync } from "crypto";
import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from "fastify";

export function passAuth(req: FastifyRequest, reply: FastifyReply, done: HookHandlerDoneFunction) {
    const auth = req.headers["authorization"];
    if (!auth) return done(new ExtendedError("You must provide an API key to access this route", HttpCode["Unauthorized"]));
    const [name, pass] = auth.split(":");
    req.db.users.findFirst({ where: { name } }).then((user) => {
        if (!user) return done(new ExtendedError("Invalid user provided", HttpCode["Bad Request"]));
        const hash = hashSecret(pass, user.salt);
        req.user = { name: user.name, id: user.id };
        req.admin = user.admin;
        if (hash === user.password) return done();
        logger.warn(`[${req.user.name}] password`);
        return done(new ExtendedError("Incorrect password provided", HttpCode["Unauthorized"]));
    });
}

export function adminAuth(req: FastifyRequest, reply: FastifyReply, done: HookHandlerDoneFunction) {
    if (req.admin) return done();
    return done(new ExtendedError("Admin privileges required", HttpCode["Unauthorized"]));
}

export function tokenAuth(req: FastifyRequest, reply: FastifyReply, done: HookHandlerDoneFunction) {
    const token = req.headers["authorization"];
    if (!token) return done(new ExtendedError("No token provided", HttpCode["Unauthorized"]));
    const _token = token.split(".");
    if (_token.length !== 3) return done(new ExtendedError("Malformed token", HttpCode["Unauthorized"]));
    const [_id, salt, secret] = _token;
    const id = decode(_id);
    return req.db.users.findUnique({ where: { id } }).then((user) => {
        if (!user) return done(new ExtendedError("Invalid token", HttpCode["Unauthorized"]));
        const hash = hashSecret(secret, salt);
        if (hash !== user.token) return done(new ExtendedError("Invalid token", HttpCode["Unauthorized"]));
        req.user = { id: user.id, name: user.name };
        req.admin = user.admin;
        if (hash === user.token) return done();
        logger.warn(`[${req.user.name}] token`);
    });
}

function hashSecret(password: BinaryLike, salt: BinaryLike) {
    return encode(pbkdf2Sync(password, salt, 16384, 128, "sha512"));
}
function encode(input: Buffer | string) {
    return Buffer.from(input).toString("base64url");
}
function decode(input: string) {
    return Buffer.from(input, "base64url").toString("utf-8");
}
