import type { FastifyInstance } from "fastify";
import { authRoute } from "./auth.ts";
import { logoutRoute } from "./logout.ts";

export const session = (app: FastifyInstance) => {
  for (const route of [authRoute, logoutRoute]) app.route(route);
};
