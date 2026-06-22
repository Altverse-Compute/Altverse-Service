import type { FastifyInstance } from "fastify";
import type { ProfileProps } from "./types.ts";
import { dbToProtoRole, headers } from "src/util/routes.ts";
import * as http from "@proto/http_pb.ts";
import { create, toBinary } from "@bufbuild/protobuf";

export const profile = (app: FastifyInstance) => {
  app.route({
    url: "/profile/:username",
    method: "GET",
    schema: {
      params: {
        type: "object",
        required: ["username"],
        properties: {
          username: { type: "string", maxLength: 16 },
        },
      },
    },
    config: {
      rateLimit: {
        max: 10,
        timeWindow: "5s",
      },
    },
    bodyLimit: 2048,
    handler: async (req, res) => {
      headers(res);
      const body = req.params as ProfileProps;
      const database = res.server.db;

      const account = await database.account.findFirst({
        where: {
          name: body.username,
        },
      });

      if (account === null) {
        res.status(http.ResponseStatus.NotFound).send();
        return;
      }

      const profile = await database.profile.findFirst({
        where: {
          accountId: account.id,
        },
      });

      if (profile === null) {
        res.status(http.ResponseStatus.NotFound).send();
        return;
      }

      const binary = toBinary(
        http.ProfileResponseSchema,
        create(http.ProfileResponseSchema, {
          profile: {
            username: account.name,
            highest: profile.highest as Record<string, string>,
            accessories: profile.accessories,
            vp: profile.vp,
            role: dbToProtoRole(account.role),
          },
        }),
      );
      res.code(http.ResponseStatus.Ok).send(binary);
    },
  });
};
