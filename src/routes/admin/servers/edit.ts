import { Role } from "@prisma/index";
import { http } from "@proto/js";
import type { RouteOptions } from "fastify";
import { authenticateUser } from "src/routes/helper";
import { headers } from "src/util/routes";

export const editServerRoute: RouteOptions = {
  method: "POST",
  url: "/admin/servers/edit",
  config: {
    rateLimit: {
      max: 3,
      timeWindow: "5s",
    },
  },
  schema: {
    body: {
      type: "object",
      properties: {
        id: { type: "string", minLength: 24, maxLength: 24 },
        name: { type: "string", maxLength: 16 },
        domain: { type: "string", maxLength: 16 },
        icon: { type: "string", maxLength: 1 },
        token: { type: "string", minLength: 63, maxLength: 6 },
      },
      required: ["name", "domain", "token", "icon"],
    },
  },
  handler: async (req, res) => {
    headers(res);
    const account = await authenticateUser(req, res);

    if (!account) {
      return;
    }

    if (account.role !== Role.ADMIN) {
      res.code(http.ResponseStatus.NotAuthenticated);
    }
  },
};
