import type { FastifyInstance } from "fastify";
import { serversOnline } from "../plugins/rpc/middleware.ts";
import { Env } from "../service/env.ts";
import { http } from "@proto/js/index.js";
import { finishAndSend, headers } from "src/util/routes.ts";

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
      const servers = Object.values(serversOnline).map((v) => ({
        icon: v.icon,
        name: v.name,
        domain: v.domain,
        online: v.online,
      }));

      res.code(http.ResponseStatus.Ok);
      finishAndSend(
        http.ServersResponse.encode({
          status: http.ResponseStatus.Ok,
          servers,
        }),
        res,
      );
    },
  });
};
