import type { FastifyInstance } from "fastify";
import * as http from "@proto/http_pb";
import { headers } from "src/util/routes.ts";
import { toBinary } from "node_modules/@bufbuild/protobuf/dist/cjs/to-binary";
import { create } from "@bufbuild/protobuf";

export const servers = (app: FastifyInstance) => {
  app.route({
    url: "/servers",
    method: "GET",
    config: {
      rateLimit: {
        max: 10,
        timeWindow: "5s",
      },
    },
    handler: async (req, res) => {
      headers(res);
      const servers = Object.values(app.rpc.getOnlineServers()).map((v) => ({
        icon: v.icon,
        name: v.name,
        domain: v.domain,
        online: v.online,
      }));

      res.code(http.ResponseStatus.Ok).send(
        toBinary(
          http.ServersResponseSchema,
          create(http.ServersResponseSchema, {
            status: http.ResponseStatus.Ok,
            servers,
          }),
        ),
      );
    },
  });
};
