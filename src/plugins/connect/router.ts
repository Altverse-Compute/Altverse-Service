import type { ConnectRouter, HandlerContext } from "@connectrpc/connect";
import * as rpc from "@proto/rpc_pb";
import { randomBytes } from "crypto";
import type { FastifyInstance } from "fastify";
import { Code, ConnectError } from "@connectrpc/connect";
import { logger } from "src/logger";
import { Env } from "src/service/env";
import { argon2verify } from "src/util/hash";

export interface ServerOnline {
  id: string;
  icon: string;
  name: string;
  domain: string;
  lastTimeSeen: number;
  online: number;
  session: string;
}

export let serversOnline: Record<string, ServerOnline> = {};

const removeServer = (id: string) => {
  delete serversOnline[id];
};

export const rpcRoutes = (app: FastifyInstance) => {
  app.decorate("rpc", {
    getOnlineServers() {
      return serversOnline;
    },
    async syncDomains() {
      const db = app.db;

      const servers = await db.server.findMany({});

      const keys = Object.keys(serversOnline);
      const values = Object.values(serversOnline);

      for (const server of servers) {
        for (let i = 0; i < values.length; i++) {
          const value = values[i];
          console.log(value, values);
          if (server.id === value.id) {
            serversOnline[keys[i]] = {
              ...serversOnline[keys[i]],
              domain: server.domain,
            };
          }
        }
      }
    },
  });
  return (router: ConnectRouter) => {
    router.service(rpc.Game, {
      async authentication(
        request: rpc.AuthenticationRequest,
        context: HandlerContext,
      ) {
        console.log(context.url);
        if (
          request &&
          request.token.length === 64 &&
          request.id.length === 24
        ) {
          try {
            const server = await app.db.server.findFirst({
              where: {
                id: request.id!,
              },
            });

            if (server) {
              const isTokenValid = await argon2verify(
                server.token,
                request.token,
              );

              if (
                isTokenValid &&
                (!Object.keys(serversOnline).includes(server.id) || Env.devMode)
              ) {
                const session = randomBytes(32).toString("hex");

                removeServer(server.id);

                serversOnline[server.id] = {
                  id: server.id,
                  icon: server.icon,
                  name: server.name,
                  domain: server.domain,
                  lastTimeSeen: Date.now(),
                  online: 0,
                  session,
                };

                wrapLog("authentication", {
                  message:
                    "Authentication server request was successfully registered",
                  token: request.token,
                  session,
                });

                return {
                  session,
                };
              }
            }
          } catch (e) {
            throw new ConnectError("", Code.Unavailable);
          }
          throw new ConnectError("", Code.Unavailable);
        }

        throw new ConnectError("", Code.Unavailable);
      },
    });
  };
};

export function wrapLog<Request, Response>(route: string, object: Object) {
  logger.info({
    additional: object,
    method: "RPC",
    path: "/" + route,
  });
}
