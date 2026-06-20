import type { FastifyInstance } from "fastify";
import { loginRoute } from "./login.ts";
import { registerRoute } from "./register.ts";

export const account = (app: FastifyInstance) => {
  for (const route of [loginRoute, registerRoute]) app.route(route);
};
