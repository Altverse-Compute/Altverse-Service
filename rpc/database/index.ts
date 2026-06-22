import { PrismaClient } from "@prisma";
import fn from "fastify-plugin";

const database = new PrismaClient({});

const databasePlugin = fn((app) => {
  app.decorate("db", database);
});

export { databasePlugin };
