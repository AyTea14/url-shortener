import { rateLimitError } from "#lib/utils";
import { RateLimitPluginOptions } from "@fastify/rate-limit";
import { PointOfViewOptions } from "@fastify/view";
import { FastifyStaticOptions } from "@fastify/static";
import { resolve } from "path";
import ejs from "ejs";

export const snowflakeEpoch = 1118707200000;

export const config = {
    port: Number(process.env.PORT),
    shortLength: Number(process.env.SHORT_LENGTH) || 10,
    apiKey: process.env.API_KEY,
    admin: {
        username: process.env.ADMIN_USERNAME,
        pass: process.env.ADMIN_PASS,
    },
};

export const rateLimitConfig: RateLimitPluginOptions = {
    global: true,
    max: 20,
    ban: 10,
    timeWindow: "25s",
    errorResponseBuilder: (req, context) => rateLimitError(context),
};

export const viewConfig: PointOfViewOptions = {
    engine: { ejs },
    root: resolve(process.cwd(), "src", "view"),
};

export const stConfig: FastifyStaticOptions = {
    root: resolve(process.cwd(), "src", "view"),
    serve: true,
};
