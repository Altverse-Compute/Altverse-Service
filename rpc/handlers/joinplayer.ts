import type { JoinPlayerRequest, JoinPlayerResponse } from "../types.ts";
import { Role } from "@proto/ts/connection/Role.ts";
import grpc from "@grpc/grpc-js";
import { validateToken } from "./schema.ts";
import {
  AccountAuthenticationFailed,
  AuthenticationJoinPlayerFailed,
} from "../errors.ts";
import { authMiddleware, wrapLog } from "../middleware.ts";
import { logger } from "../../../logger.ts";
import type { FastifyInstance } from "fastify";

export const JoinPlayer =
  (app: FastifyInstance) =>
  async (
    call: grpc.ServerUnaryCall<JoinPlayerRequest, JoinPlayerResponse>,
    callback: grpc.sendUnaryData<JoinPlayerResponse>,
  ) => {
    if (!authMiddleware(call.metadata.getMap())) {
      return callback(AuthenticationJoinPlayerFailed);
    }

    logger.warn("RPC " + JSON.stringify(call.request));
    if (!validateToken(call.request)) {
      return callback(AccountAuthenticationFailed);
    }
    //@ts-ignore
    const token = call.request.token as string;

    const session = await app.db.session.findFirst({
      where: {
        token,
      },
    });

    if (!session) {
      return callback(AccountAuthenticationFailed);
    }

    const account = await app.db.account.findFirst({
      where: {
        id: session.accountId,
      },
    });

    wrapLog(call, "joinPlayer", {
      accountId: session.accountId,
      username: account!.name,
    });

    if (!account) {
      return callback(AccountAuthenticationFailed);
    }

    return callback(null, {
      name: account.name,
      role: Role.USER,
      id: session.accountId,
    } as any);
  };
