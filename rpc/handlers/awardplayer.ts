import type { AwardRequest, AwardResponse } from "../types.ts";
import grpc from "@grpc/grpc-js";
import { validateAward } from "./schema.ts";
import { AuthenticationFailed, AwardAuthenticationFailed } from "../errors.ts";
import { authMiddleware, wrapLog } from "../middleware.ts";
import type { AwardRequest__Output } from "@proto/ts/connection/AwardRequest.ts";
import { logger } from "../../../logger.ts";
import type { FastifyInstance } from "fastify";

export const AwardPlayer =
  (app: FastifyInstance) =>
  async (
    call: grpc.ServerUnaryCall<AwardRequest, AwardResponse>,
    callback: grpc.sendUnaryData<AwardResponse>,
  ) => {
    if (!authMiddleware(call.metadata.getMap())) {
      return callback(AuthenticationFailed);
    }

    if (!validateAward(call.request)) {
      return callback(AwardAuthenticationFailed);
    }
    const request = call.request as AwardRequest__Output;
    //@ts-ignore
    const accountId = request.id;

    const profile = await app.db.profile.findFirst({
      where: {
        accountId,
      },
    });

    if (!profile) {
      return callback(AwardAuthenticationFailed);
    }

    const data: Record<string, unknown> = {};

    if (request.accessory) {
      data["accessories"] = [...profile.accessories, request.accessory];
    }
    if (request.vp) {
      data["vp"] = profile.vp + request.vp;
    }

    logger.info(
      "RPC player awarded. accountId " + accountId + " VP " + data["vp"],
    );
    wrapLog(call, "awardPlayer", {
      accountId,
      vp: request.vp,
      accessory: request.accessory,
    });

    await app.db.profile.update({
      where: {
        accountId,
      },
      data,
    });

    return callback(null, {
      success: true,
    } as any);
  };
