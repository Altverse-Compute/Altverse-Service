import * as http from "@proto/http_pb";
import { randomBytes } from "crypto";
import type { RouteOptions } from "fastify";
import { Env } from "src/service/env";
import { headers } from "src/util/routes";
import type { LoginProps } from "../types";
import { argon2verify } from "src/util/hash";
import { create, toBinary } from "@bufbuild/protobuf";

export const loginRoute: RouteOptions = {
  url: "/login",
  method: "POST",
  bodyLimit: 2048,
  config: {
    rateLimit: {
      max: 10,
      timeWindow: "5s",
    },
  },
  schema: {
    body: {
      type: "object",
      properties: {
        username: { type: "string", minLength: 1, maxLength: 16 },
        password: { type: "string", minLength: 4, maxLength: 32 },
      },
      required: ["username", "password"],
    },
  },
  handler: async (req, res) => {
    headers(res);
    const body = req.body as LoginProps;

    const database = res.server.db;

    const account = await database.account.findFirst({
      where: {
        name: body.username,
      },
    });
    if (account === null) {
      res.status(http.ResponseStatus.AccountNotExists).send();
      return;
    }

    if (await argon2verify(account.password, body.password)) {
      const session = await database.session.findFirst({
        where: {
          accountId: account.id,
        },
      });

      const token = randomBytes(16).toString("hex") as string;

      if (session) {
        await database.session.update({
          data: {
            token,
            expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
          },
          where: { accountId: account.id },
        });
      } else {
        await database.session.create({
          data: {
            token,
            expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
            accountId: account.id,
          },
        });
      }

      res.setCookie("token", token, {
        path: "/",
        httpOnly: true,
        secure: !Env.devMode,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60,
        signed: true,
      });
      res.status(http.ResponseStatus.Ok).send(
        toBinary(
          http.LoginAndRegisterResponseSchema,
          create(http.LoginAndRegisterResponseSchema, {
            token,
          }),
        ),
      );
    } else {
      res.status(http.ResponseStatus.WrongPassword).send();
    }
  },
};
