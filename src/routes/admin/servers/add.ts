import { Role } from "@prisma/index";
import * as http from "@proto/http_pb";
import type { RouteOptions } from "fastify";
import { authenticateUser } from "src/routes/helper";
import { argon2hash } from "src/util/hash";
import { headers } from "src/util/routes";

export const addServerRoute: RouteOptions = {
  method: "POST",
  url: "/admin/servers/add",
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
        name: { type: "string", maxLength: 32 },
        domain: { type: "string", maxLength: 64 },
        icon: { type: "string", maxLength: 10 },
        token: { type: "string", minLength: 62, maxLength: 65 },
      },
      required: ["name", "domain", "icon", "token"],
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

    const verifiedBody = req.body as http.AdminModeAddServerRequest;

    await res.server.db.server.create({
      data: {
        name: verifiedBody.name,
        icon: verifiedBody.icon,
        token: await argon2hash(verifiedBody.token!),
        domain: verifiedBody.domain,
      },
    });

    await res.server.rpc.syncDomains();

    res.code(http.ResponseStatus.Ok);
  },
};
