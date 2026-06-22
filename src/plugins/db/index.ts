import { PrismaClient } from "@prisma/index";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

export const prismaPlugin = fp((app: FastifyInstance) => {
  const database = new PrismaClient({});

  app.decorate("db", database);
});
