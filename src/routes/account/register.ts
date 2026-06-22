import * as http from "@proto/http_pb";
import { hash, randomBytes } from "crypto";
import type { RouteOptions } from "fastify";
import { Env } from "src/service/env";
import { headers } from "src/util/routes";
import type { RegisterProps } from "../types";
import { argon2hash } from "src/util/hash";
import { create, toBinary } from "@bufbuild/protobuf";

export const registerRoute: RouteOptions = {
  url: "/register",
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
        username: { type: "string", maxLength: 16 },
        password: { type: "string", minLength: 4 },
        token: { type: "string", minLength: 32 },
      },
      required: ["username", "password", "token"],
    },
  },
  handler: async (req, res) => {
    headers(res);
    const body = req.body as RegisterProps;
    const database = res.server.db;

    const find = await database.account.findFirst({
      where: {
        name: body.username,
      },
    });
    if (find !== null) {
      res.status(http.ResponseStatus.AccountExists).send();
      return;
    }
    if (body.token !== Env.registerToken) {
      res.status(http.ResponseStatus.InvalidBody).send();
      return;
    }

    const password = await argon2hash(body.password);

    const token = randomBytes(16).toString("hex") as string;

    await database.account.create({
      data: {
        name: body.username,
        password,
        profile: {
          create: {
            accessories: [],
            highest: {},
            effect: "",
            accessory: "",
          },
        },
        session: {
          create: {
            token,
            expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
          },
        },
      },
    });

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
  },
};
