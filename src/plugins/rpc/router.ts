import type { ConnectRouter, HandlerContext } from "@connectrpc/connect";
import * as rpc from "@proto/rpc_pb";
import { randomBytes } from "crypto";
import type { FastifyInstance } from "fastify";
import { Code, ConnectError } from "@connectrpc/connect";
import { logger } from "src/logger";
import { Env } from "src/service/env";
import { argon2verify } from "src/util/hash";
import { Role } from "@proto/rpc_pb";

export interface ServerOnline {
  id: string;
  icon: string;
  name: string;
  domain: string;
  lastTimeSeen: number;
  online: number;
  session: string;
}

let serversOnline: Record<string, ServerOnline> = {};

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
          } catch (error) {
            throw new ConnectError(
              (error as any).message,
              Code.Unauthenticated,
            );
          }
          throw new ConnectError("", Code.Unauthenticated);
        }

        throw new ConnectError("", Code.Unauthenticated);
      },
      async ping(request, context) {
        const server = authenticate(context);
        if (server && request.alive) {
          serversOnline[server.id].online = request.online;
          return { success: true };
        }
        throw new ConnectError("", Code.Unauthenticated);
      },
      async joinPlayer(request, context) {
        if (!authenticate(context)) {
          throw new ConnectError("", Code.Unauthenticated);
        }
        const database = app.db;

        const session = await database.session.findFirst({
          where: {
            token: request.token,
          },
        });

        if (!session) {
          throw new ConnectError("4000", Code.Unauthenticated);
        }

        const account = await database.account.findFirst({
          where: {
            id: session.accountId,
          },
        });

        app.log.info({
          type: "joinPlayer",
          accountId: session.accountId,
          username: account!.name,
        });

        if (!account) {
          throw new ConnectError("4001", Code.Unauthenticated);
        }

        return {
          name: account.name,
          role: Role.USER,
          id: session.accountId,
        };
      },
    });
  };
};

function wrapLog<Request, Response>(route: string, object: Object) {
  logger.info({
    additional: object,
    method: "RPC",
    path: "/" + route,
  });
}

export const authenticate = (context: HandlerContext) => {
  const tokens = context.requestHeader.get("Alt-Authenticate");
  if (
    tokens !== undefined &&
    typeof tokens === "string" &&
    tokens.length >= 64
  ) {
    const filteredServers = Object.values(serversOnline).filter(
      (v) => v.session === tokens,
    );
    if (filteredServers.length != 0) {
      const server = filteredServers[0];
      if (server.lastTimeSeen <= Date.now() + Env.gTimeout) {
        serversOnline[server.id].lastTimeSeen = Date.now();
        return server;
      } else {
        removeServer(server.id);
        return false;
      }
    }
  }
  return false;
};
