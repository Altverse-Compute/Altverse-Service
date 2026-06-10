import * as grpc from "@grpc/grpc-js"
import path from "path";
import {Env} from "../service/env.ts";
import {logger} from "../logger.ts";
import {GameService} from "./services/game.ts";

export class RPCServer {
    app: grpc.Server;
    constructor() {
        this.app = new grpc.Server();

        new GameService(this.app)

        this.app.bindAsync("localhost:" + Env.gPort, grpc.ServerCredentials.createInsecure(), (err, port) => {
            if (err) {
                console.error(err)
                logger.error("Server bind failed: " + err.message);
                return;
            }
            logger.info(`Server listening on port ${port}`);
            this.app.start();
        })
    }
}