import { create, toBinary } from "@bufbuild/protobuf";
import * as http from "@proto/http_pb";
import type { RouteOptions } from "fastify";
import { authenticateUser } from "src/routes/helper";
import { headers } from "src/util/routes";

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

    const database = res.server.db;

    const servers = await database.server.findMany({});

    res.send(
      toBinary(
        http.AdminModeServersResponseSchema,
        create(http.AdminModeServersResponseSchema, {
          online: Object.keys(res.server.rpc.getOnlineServers()).length,
          count: servers.length,
          servers: servers.map((v) => ({
            id: v.id,
            name: v.name,
            domain: v.domain,
            icon: v.icon,
            lastSeen: Date.now().toString(),
          })),
        }),
      ),
    );
  },
};
