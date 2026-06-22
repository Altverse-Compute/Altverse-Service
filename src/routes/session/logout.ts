import * as http from "@proto/http_pb";
import type { RouteOptions } from "fastify";
import { headers } from "src/util/routes";

export const logoutRoute: RouteOptions = {
  url: "/logout",
  method: "POST",
  config: {
    rateLimit: {
      max: 10,
      timeWindow: "5s",
    },
  },
  handler: async (req, res) => {
    headers(res);
    headers(res);
    if (req.cookies !== undefined && req.cookies.token !== undefined) {
      headers(res);
      const unsignedToken = req.unsignCookie(req.cookies?.token);

      if (unsignedToken.valid) {
        const token = unsignedToken.value;

        const session = await res.server.db.session.findFirst({
          where: {
            token,
          },
        });

        if (session === null) {
          res.code(http.ResponseStatus.NotAuthenticated).send();
          return;
        }
      }

      res.clearCookie("token");

      res.code(http.ResponseStatus.Ok).send();
    } else {
      res.status(401);
      res.code(http.ResponseStatus.InvalidBody).send();
    }
  },
};
