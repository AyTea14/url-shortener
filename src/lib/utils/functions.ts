import { bgBlue, bgCyan, bgGreen, bgMagenta, bgRed, bgWhite, bgYellow, black, whiteBright } from "colorette";
import { BinaryLike, pbkdf2Sync, randomInt } from "crypto";
import { FastifyInstance, FastifyReply, FastifyRequest, HookHandlerDoneFunction } from "fastify";
import { logger } from "../../index.js";
import prettyMs from "pretty-ms";
import { Snowflake } from "@sapphire/snowflake";

const snowflake = new Snowflake(1118707200000);

export function createSnowflake() {
    return `${snowflake.generate()}`;
}

export function encode(buffer: Buffer | string) {
    return Buffer.from(buffer).toString("base64url");
}
export function decode(input: string) {
    return Buffer.from(input, "base64url").toString("utf-8");
}
export function hashSecret(password: BinaryLike, salt: BinaryLike) {
    return encode(pbkdf2Sync(password, salt, 16384, 128, "sha512"));
}

export function randomString(length: number = 8) {
    const randomChars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += randomChars.charAt(randomInt(randomChars.length));
    }
    return result;
}

export function isURL(input: string) {
    let url;

    try {
        url = new URL(input);
    } catch (_) {
        return false;
    }

    return /https?/.test(url.protocol);
}

export async function isHealthy(fastify: FastifyInstance) {
    let isHealthy: boolean;
    let prismaError: unknown;

    try {
        await fastify.db.shortened.findMany({ select: { code: true } });
        isHealthy = true;
    } catch (error) {
        isHealthy = false;
        prismaError = error;
    }

    return {
        status: isHealthy ? "ok" : "down",
        info: {
            database: {
                status: !prismaError ? "up" : "down",
            },
        },
        error: prismaError ? (prismaError instanceof Error ? prismaError.message : prismaError) : null,
    };
}

export function removeTrailingSlash(req: FastifyRequest, reply: FastifyReply, done: HookHandlerDoneFunction) {
    const url = new URL(`${req.url}`, `${req.protocol}://${req.hostname}`);
    if (url.pathname.slice(-1) === "/" && url.pathname.length > 1) {
        let path = url.pathname.slice(0, -1) + url.search;
        reply.redirect(301, path);
    } else done();
}

const coloredMethod = (method: string): string => {
    let methods = ` ${method.padEnd(7)} `;

    if (method === "GET") return bgBlue(whiteBright(`${methods}`));
    else if (method === "POST") return bgCyan(whiteBright(`${methods}`));
    else if (method === "PUT") return bgYellow(black(`${methods}`));
    else if (method === "DELETE") return bgRed(whiteBright(`${methods}`));
    else if (method === "PATCH") return bgGreen(whiteBright(`${methods}`));
    else if (method === "HEAD") return bgMagenta(whiteBright(`${methods}`));
    else if (method === "OPTIONS") return bgWhite(black(`${methods}`));
    else return methods;
};
const coloredStatusCode = (statusCode: number | string): string => {
    let statusCodes = ` ${String(statusCode).padStart(3)} `;
    if (statusCode >= 200 && statusCode < 300) return bgGreen(whiteBright(`${statusCodes}`));
    else if (statusCode >= 300 && statusCode < 400) return bgWhite(black(`${statusCodes}`));
    else if (statusCode >= 400 && statusCode < 500) return bgYellow(black(`${statusCodes}`));
    else return bgRed(whiteBright(`${statusCodes}`));
};

export const reqLogger = async (req: FastifyRequest, reply: FastifyReply) => {
    let latency = prettyMs(reply.getResponseTime(), { secondsDecimalDigits: 7, millisecondsDecimalDigits: 4 }).padStart(13);
    let clientIp = String(req.ip).padStart(15);
    let statusCode = coloredStatusCode(reply.statusCode);
    let method = coloredMethod(req.method);
    logger.info(`${statusCode} | ${latency} | ${clientIp} | ${method} "${req.url}"`);
    return;
};
