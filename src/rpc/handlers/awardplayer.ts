import type { AwardRequest, AwardResponse } from "../types.ts";
import { Role } from "@proto/ts/connection/Role.ts";
import grpc from "@grpc/grpc-js";
import { database } from "../../service/database.ts";
import { validateAward } from "./schema.ts";
import {
  AccountAuthenticationFailed,
  AuthenticationFailed,
  AwardAuthenticationFailed,
} from "../errors.ts";
import { authMiddleware } from "../middleware.ts";
import type { AwardRequest__Output } from "@proto/ts/connection/AwardRequest.ts";

export const AwardPlayer = async (
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

  const profile = await database.profile.findFirst({
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

  await database.profile.update({
    where: {
      accountId,
    },
    data,
  });

  return callback(null, {
    success: true,
  } as any);
};
