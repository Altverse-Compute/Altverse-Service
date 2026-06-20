import { Role } from "@prisma/index";
import { http } from "@proto/js";
import { randomBytes } from "crypto";
import type { RouteOptions } from "fastify";
import { authenticateUser } from "src/routes/helper";
import { finishAndSend, headers } from "src/util/routes";

export const generateServerTokenRoute: RouteOptions = {
  method: "GET",
  url: "/admin/servers/token",
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

    if (account.role !== Role.ADMIN) {
      res.code(http.ResponseStatus.NotAuthenticated);
    }

    res.code(http.ResponseStatus.Ok);
    finishAndSend(
      http.AdminModeServerTokenResponse.encode({
        token: randomBytes(32).toString("hex"),
      }),
      res,
    );
  },
};
