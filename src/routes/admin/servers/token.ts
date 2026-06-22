import { create, toBinary } from "@bufbuild/protobuf";
import { Role } from "@prisma/index";
import * as http from "@proto/http_pb";
import { randomBytes } from "crypto";
import type { RouteOptions } from "fastify";
import { authenticateUser } from "src/routes/helper";
import { headers } from "src/util/routes";

export const generateServerTokenRoute: RouteOptions = {
  method: "GET",
  url: "/admin/servers/token",
  config: {
    rateLimit: {
      max: 1,
      timeWindow: "10s",
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

    res.code(http.ResponseStatus.Ok).send(
      toBinary(
        http.AdminModeServerTokenResponseSchema,
        create(http.AdminModeServerTokenResponseSchema, {
          token: randomBytes(32).toString("hex"),
        }),
      ),
    );
  },
};
