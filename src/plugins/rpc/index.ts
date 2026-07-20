import { createValidateInterceptor } from "@connectrpc/validate";
import type { FastifyInstance } from "fastify";
import { rpcRoutes } from "./router";
import { fastifyConnectPlugin } from "@connectrpc/connect-fastify";
import fp from "fastify-plugin";

export const rpc = fp(async (app: FastifyInstance) => {
  await app.register(fastifyConnectPlugin, {
    interceptors: [createValidateInterceptor()],
    routes: rpcRoutes(app),
    grpc: false,
  });
});
