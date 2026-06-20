import Fastify from "fastify";
import { Env } from "./service/env.ts";
import helmet from "@fastify/helmet";

import { account } from "./routes/account";
import { session } from "./routes/session";
import { profile } from "./routes/profile.ts";

import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import { servers } from "./routes/servers.ts";
import rpcPlugin from "./plugins/rpc";
import { admin } from "./routes/admin/index.ts";

const fastify = Fastify({
  logger: true,
});

await fastify.register(rpcPlugin);

await fastify.register(helmet);
await fastify.register(cors, {
  origin: Env.frontendUrl,
  credentials: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  preflightContinue: false,
  hideOptionsRoute: true,
  hook: "preValidation",
});
await fastify.register(cookie, {
  secret: Env.cookieSecret,
});

for (const route of [account, session, profile, servers, admin])
  await fastify.register(route);

try {
  await fastify.listen({ port: Env.port });
} catch (err) {
  fastify.log.error(err);
}
