import { PrismaClient } from "@prisma/client";

declare module "fastify" {
    interface FastifyInstance {
        db: PrismaClient;
    }
    interface FastifyRequest {
        db: PrismaClient;
        user: {
            id: string;
            name: string;
        } | null;
        admin: boolean;
    }
}

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            DATABASE_URL?: string;
            BASE_URL?: string;
            SHORT_LENGTH?: string;
            PORT?: string;
            API_KEY?: string;
            ADMIN_USERNAME?: string;
            ADMIN_PASS?: string;
        }
    }
}
export {};
