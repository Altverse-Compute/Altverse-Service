import grpc from "@grpc/grpc-js"
import type {PingRequest, PongResponse} from "../types.ts";
import {authMiddleware, serversOnline} from "../middleware.ts";
import {validatePing} from "./schema.ts";
import {AuthenticationFailed} from "../errors.ts";


export const Ping = (call: grpc.ServerUnaryCall<PingRequest, PongResponse>, callback: grpc.sendUnaryData<PongResponse>) => {
    const metadata = call.metadata
    const request = call.request

    const server = authMiddleware(metadata.getMap())

    if (server && validatePing(request)) {
            serversOnline[server.id].online = (request as any).online as any as number

            const response: PongResponse = {
                success: true
            } as any

            callback(null, response)
            return
    }

    return callback(AuthenticationFailed)
}