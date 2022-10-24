import { FastifyInstance } from "fastify";
import { createAdmin } from "./createAdmin.js";
import { me } from "./user.js";
import { createUser } from "./createUser.js";

export async function users(fastify: FastifyInstance) {
    me(fastify);
    createAdmin(fastify);
    createUser(fastify);
}
