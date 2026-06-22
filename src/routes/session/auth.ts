import { create, toBinary } from "@bufbuild/protobuf";
import * as http from "@proto/http_pb";
import type { RouteOptions } from "fastify";
import { dbToProtoRole, headers } from "src/util/routes";

export const authRoute: RouteOptions = {
  url: "/auth",
  method: "GET",
  bodyLimit: 2048,
  config: {
    rateLimit: {
      max: 3,
      timeWindow: "5s",
    },
  },
  handler: async (req, res) => {
    headers(res);
    if (req.cookies !== undefined && req.cookies.token !== undefined) {
      const unsignedToken = req.unsignCookie(req.cookies?.token);
      if (!unsignedToken.valid) {
        res.code(401);
        res.send();
        return;
      }

      const token = unsignedToken.value;
      const database = req.server.db;

      const session = await database.session.findFirst({
        where: {
          token,
        },
      });
      if (session === null) {
        res.code(401);
        res.send();
        return;
      }

      if (session.expiresAt <= Date.now()) {
        await database.session.delete({
          where: {
            id: session.id,
          },
        });
        res.code(401);
        res.send();
        return;
      }

      const account = await database.account.findFirst({
        where: {
          id: session.accountId,
        },
      });

      const profile = await database.profile.findFirst({
        where: {
          accountId: session.accountId,
        },
      });
      if (profile != null && account != null) {
        res.send(
          toBinary(
            http.AuthResponseSchema,
            create(http.AuthResponseSchema, {
              profile: {
                username: account.name,
                highest: profile.highest as Record<string, string>,
                accessories: profile.accessories,
                vp: profile.vp,
                role: dbToProtoRole(account.role),
              },
            }),
          ),
        );
      } else {
        res.status(401);
        res.send();
      }
    } else {
      res.status(401);
      res.send();
    }
  },
};
