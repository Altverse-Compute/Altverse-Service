import { Role } from "@prisma/index";
import * as http from "@proto/http_pb";
import type { RouteOptions } from "fastify";
import { authenticateUser } from "src/routes/helper";
import { headers } from "src/util/routes";

export const remServerRoute: RouteOptions = {
  method: "POST",
  url: "/admin/servers/rem",
  config: {
    rateLimit: {
      max: 1,
      timeWindow: "5s",
    },
  },
  schema: {
    body: {
      type: "object",
      properties: {
        id: { type: "string", minLength: 24, maxLength: 24 },
      },
      required: ["id"],
    },
  },
  handler: async (req, res) => {
    headers(res);
    const account = await authenticateUser(req, res);

    if (!account) {
      return;
    }

    if (account.role !== Role.ADMIN) {
      res.code(http.ResponseStatus.NotAuthenticated).send({});
      return;
    }

    const body = req.body as http.AdminModeRemServerRequest;

    await res.server.db.server.delete({
      where: {
        id: body.id,
      },
    });

    await res.server.rpc.syncDomains();

    res.code(http.ResponseStatus.Ok);
  },
};
