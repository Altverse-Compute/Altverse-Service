import { Env } from "../../service/env.ts";
import { randomBytes } from "crypto";
import type { AuthenticationRequest, AuthenticationResponse } from "./types.ts";
import grpc, { type MetadataValue } from "@grpc/grpc-js";
import {
  AuthenticationAlreadyLoggedFailed,
  AuthenticationFailed,
} from "./errors.ts";
import { logger } from "../../logger.ts";
import { argon2verify } from "src/util/hash.ts";
import type { connection } from "@proto/js/index.js";
import type { FastifyInstance } from "fastify";

export let serversOnline: Record<
  string,
  {
    id: string;
    icon: string;
    name: string;
    domain: string;
    lastTimeSeen: number;
    online: number;
    session: string;
  }
> = {};

export const removeServer = (id: string) => {
  delete serversOnline[id];
};

export const syncDomains = async (app: FastifyInstance) => {
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
};

export const Authentication =
  (app: FastifyInstance) =>
  async (
    call: grpc.ServerUnaryCall<AuthenticationRequest, AuthenticationResponse>,
    callback: grpc.sendUnaryData<AuthenticationResponse>,
  ) => {
    const request = call.request as any as connection.AuthenticationRequest;

    if (request && request.token.length === 64 && request.id.length === 24) {
      try {
        const server = await app.db.server.findFirst({
          where: {
            id: request.id!,
          },
        });

        if (server) {
          const isTokenValid = await argon2verify(server.token, request.token);

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

            wrapLog(call, "authentication", {
              message:
                "Authentication server request was successfully registered",
              token: request.token,
              session,
            });

            const response = {
              session,
            } as any;

            callback(null, response);
            return;
          }
        }
      } catch (e) {
        return callback(AuthenticationFailed);
      }
      return callback(AuthenticationAlreadyLoggedFailed);
    }

    return callback(AuthenticationFailed);
  };

export const authMiddleware = (metadata: { [key: string]: MetadataValue }) => {
  const tokens = metadata["token"];
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

export function wrapLog<Request, Response>(
  call: grpc.ServerUnaryCall<Request, Response>,
  route: string,
  object: Object,
) {
  logger.info({
    additional: object,
    method: "RPC",
    remoteAddress: call.getHost(),
    path: "/" + route,
  });
}
