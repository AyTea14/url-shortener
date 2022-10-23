import { FastifyInstance } from "fastify";

export async function isExisted(fastify: FastifyInstance, url: string) {
    const data = await fastify.db.shortened.findFirst({ where: { url }, select: { code: true } });
    if (!data) return null;

    return Buffer.from(data.code, "base64url").toString("ascii");
}
