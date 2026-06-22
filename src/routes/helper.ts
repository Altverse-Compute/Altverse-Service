import type { Account } from "@prisma/index";
import * as http from "@proto/http_pb";
import type { FastifyRequest, FastifyReply } from "fastify";

export const authenticateUser = async (
  req: FastifyRequest,
  res: FastifyReply,
): Promise<Account | undefined> => {
  if (req.cookies !== undefined && req.cookies.token !== undefined) {
    const unsignedToken = req.unsignCookie(req.cookies?.token);

    const token = unsignedToken.value!;
    const database = res.server.db;

    const session = await database.session.findFirst({
      where: {
        token,
      },
    });
    if (session === null) {
      res.code(http.ResponseStatus.NotAuthenticated);
      res.send({});
      return;
    }

    if (session.expiresAt <= Date.now()) {
      await database.session.delete({
        where: {
          id: session.id,
        },
      });
      res.code(http.ResponseStatus.NotAuthenticated);
      res.send({});
      return;
    }

    const account = await database.account.findFirst({
      where: {
        id: session.accountId,
      },
    });

    if (account === undefined && account === null) {
      res.code(http.ResponseStatus.AccountNotExists);
      res.send({});
      return;
    }
    if (account !== undefined && account !== null) return account;
  } else {
    res.code(http.ResponseStatus.InvalidBody);
    res.send({});
  }
};
