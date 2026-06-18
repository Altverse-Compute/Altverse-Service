import * as grpc from "@grpc/grpc-js"
import {Env} from "../service/env.ts";
import {logger} from "../logger.ts";
import {GameService} from "./services/game.ts";
import Certificate from "../service/cert.ts";
import loadCertificate from "../service/cert.ts";

export class RPCServer {
    app: grpc.Server;
    constructor() {
        this.app = new grpc.Server();

        new GameService(this.app)


        let credentials: grpc.ServerCredentials;
        if (Env.devMode)
            credentials = grpc.ServerCredentials.createInsecure();
        else {
            const certs = loadCertificate();

            credentials = grpc.ServerCredentials.createSsl(certs.caCert, [{
                cert_chain: certs.serviceCert,
                private_key: certs.serviceKey
            }], true);
        }

        this.app.bindAsync("0.0.0.0:" + Env.gPort, credentials, (err, port) => {
            if (err) {
                console.error(err)
                logger.error("Server bind failed: " + err.message);
                return;
            }
            logger.info(`RPC server listening on port ${port}`);
        })
    }
}