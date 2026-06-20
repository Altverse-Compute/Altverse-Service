import * as grpc from "@grpc/grpc-js";
import { Env } from "../../service/env.ts";
import { logger } from "../../logger.ts";
import { GameService } from "./services/game.ts";
import Certificate from "../../service/cert.ts";
import loadCertificate from "../../service/cert.ts";
import type { FastifyInstance } from "fastify";
import fn from "fastify-plugin";
import { serversOnline } from "./middleware.ts";

const rpcPlugin = (fastify: FastifyInstance) => {
  let server = new grpc.Server();

  new GameService(server);

  let credentials: grpc.ServerCredentials;
  if (Env.devMode) credentials = grpc.ServerCredentials.createInsecure();
  else {
    const certs = loadCertificate();

    credentials = grpc.ServerCredentials.createSsl(
      certs.caCert,
      [
        {
          cert_chain: certs.serviceCert,
          private_key: certs.serviceKey,
        },
      ],
      true,
    );
  }

  server.bindAsync("0.0.0.0:" + Env.gPort, credentials, (err, port) => {
    if (err) {
      console.error(err);
      logger.error("Server bind failed: " + err.message);
      return;
    }
    logger.info(`RPC server listening on port ${port}`);
  });

  fastify.decorate("rpc", {
    getOnlineServers: () => Object.keys(serversOnline).length,
  });
};

export default fn(rpcPlugin);
