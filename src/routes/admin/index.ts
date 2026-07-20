import type { FastifyInstance } from "fastify";
import {
  addServerRoute,
  editServerRoute,
  generateServerTokenRoute,
  serversRoute,
} from "./servers";
import { remServerRoute } from "./servers/rem";

export const admin = (app: FastifyInstance) => {
  for (const route of [
    serversRoute,
    generateServerTokenRoute,
    editServerRoute,
    addServerRoute,
    remServerRoute,
  ])
    app.route(route);
};
