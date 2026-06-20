import type { FastifyInstance } from "fastify";
import {
  editServerRoute,
  generateServerTokenRoute,
  serversRoute,
} from "./servers";

export const admin = (app: FastifyInstance) => {
  for (const route of [serversRoute, generateServerTokenRoute, editServerRoute])
    app.route(route);
};
