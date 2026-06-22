import grpc from "@grpc/grpc-js";
import { loadSync } from "@grpc/proto-loader";
import { JoinPlayer } from "../handlers/joinplayer.ts";
import path from "path";
import { Ping } from "../handlers/ping.ts";
import { Authentication } from "../middleware.ts";
import type { ProtoGrpcType } from "@proto/ts/rpc.ts";
import { AwardPlayer } from "../handlers/awardplayer.ts";
import type { FastifyBaseLogger, FastifyInstance } from "fastify";

const protoPath = path.join(__dirname, "../../../proto/proto/rpc.proto");

export class GameService {
  constructor(app: grpc.Server, fastify: FastifyInstance) {
    const pkg = loadSync(protoPath, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    const proto = grpc.loadPackageDefinition(pkg) as any as ProtoGrpcType;

    const gameService = {
      Authentication: Authentication(fastify),
      JoinPlayer: JoinPlayer(fastify),
      Ping,
      AwardPlayer: AwardPlayer(fastify),
    };

    app.addService(proto.connection.Game.service, gameService);
  }
}
