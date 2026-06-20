import { http } from "@proto/js";
import type { RouteOptions } from "fastify";
import { serversOnline } from "src/plugins/rpc/middleware";
import { authenticateUser } from "src/routes/helper";
import { database } from "src/service/database";
import { finishAndSend, headers } from "src/util/routes";

export * from "./add";
export * from "./edit";
export * from "./token";

export const serversRoute: RouteOptions = {
  method: "GET",
  url: "/admin/servers",
  config: {
    rateLimit: {
      max: 3,
      timeWindow: "5s",
    },
  },
  handler: async (req, res) => {
    headers(res);
    const account = await authenticateUser(req, res);

    if (!account) {
      return;
    }

    if (account.role !== "ADMIN") {
      res.code(http.ResponseStatus.NotAuthenticated);
      res.send({});
    }

    const servers = await database.server.findMany({});

    console.log(Object.keys(serversOnline).length);

    finishAndSend(
      http.AdminModeServersResponse.encode({
        online: Object.keys(serversOnline).length,
        count: servers.length,
        servers: servers.map((v) => ({
          id: v.id,
          name: v.name,
          domain: v.domain,
          icon: v.icon,
          lastSeen: Date.now().toString(),
        })),
      }),
      res,
    );
  },
};
