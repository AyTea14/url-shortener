import { PrismaClient } from "@prisma/client";

declare module "fastify" {
    interface FastifyInstance {
        db: PrismaClient;
    }
}

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            DATABASE_URL?: string;
            SHORT_LENGTH?: string;
            PORT?: string;
            API_KEY?: string;
        }
    }
}
export {};
