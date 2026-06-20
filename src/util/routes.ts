import type { Role } from "@prisma/index";
import { http } from "@proto/js";
import type { FastifyReply } from "fastify";
import { Writer } from "protobufjs";

const map: Record<string, http.AccountRole> = {
  USER: http.AccountRole.USER,
  MOD: http.AccountRole.MOD,
  DEV: http.AccountRole.DEV,
  ADMIN: http.AccountRole.ADMIN,
};

export const dbToProtoRole = (role: Role): http.AccountRole => {
  return map[role];
};

export const finishAndSend = (writer: Writer, reply: FastifyReply) => {
  const finished = new Uint8Array(writer.finish().buffer);
  reply.send(finished);
};

export const headers = (reply: FastifyReply) => {
  reply.header("content-type", "application/x-protobuf");
};
