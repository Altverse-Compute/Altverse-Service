import type { FastifyInstance } from "fastify";
import {
  addServerRoute,
  editServerRoute,
  generateServerTokenRoute,
  serversRoute,
} from "./servers";

export const admin = (app: FastifyInstance) => {
  for (const route of [
    serversRoute,
    generateServerTokenRoute,
    editServerRoute,
    addServerRoute,
  ])
    app.route(route);
};
