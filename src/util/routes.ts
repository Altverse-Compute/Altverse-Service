import type { Role } from "@prisma/index";
import * as http from "@proto/http_pb";
import type { FastifyReply } from "fastify";

const map: Record<string, http.AccountRole> = {
  USER: http.AccountRole.USER,
  MOD: http.AccountRole.MOD,
  DEV: http.AccountRole.DEV,
  ADMIN: http.AccountRole.ADMIN,
};

export const dbToProtoRole = (role: Role): http.AccountRole => {
  return map[role];
};

export const headers = (reply: FastifyReply) => {
  reply.header("content-type", "application/x-protobuf");
};
