import * as grpc from "@grpc/grpc-js"
import path from "path";
import {loadSync} from "@grpc/proto-loader";
import {Env} from "../service/env.ts";
import {logger} from "../logger.ts";
import type {ProtoGrpcType} from "@proto/ts/rpc.ts";
import type {RegisterRequest, RegisterResponse} from "./types.ts";

const protoPath = path.join(__dirname, "../proto/proto/rpc.proto")

export class RPCServer {
    app: grpc.Server;
    constructor() {
        this.app = new grpc.Server();
        const pkg = loadSync(protoPath, {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true
        })

        const proto = (grpc.loadPackageDefinition(pkg) as any as ProtoGrpcType).connection

        const gameService = {
            Register: (call: grpc.ServerUnaryCall<RegisterRequest, RegisterResponse>, callback: grpc.sendUnaryData<RegisterResponse>) => {
                console.log(call.metadata.internalRepr.get("token")[0])

                const response: RegisterResponse = {
                    success: true
                } as any

                callback(null, response)
            }
        }

        this.app.addService(proto.GameService.service, gameService);

        this.app.bindAsync("localhost:" + Env.gPort, grpc.ServerCredentials.createInsecure(), (err, port) => {
            if (err) {
                console.error(err)
                logger.error("Server bind failed:", err);
                return;
            }
            logger.info(`Server listening on port ${port}`);
            this.app.start();
        })
    }
}