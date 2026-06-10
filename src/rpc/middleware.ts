import {validateAuth} from "./handlers/schema.ts";
import {database} from "../service/database.ts";
import {Env} from "../service/env.ts";
import {randomBytes} from "crypto";
import type {AuthenticationRequest, AuthenticationResponse} from "./types.ts";
import grpc, {type MetadataValue} from "@grpc/grpc-js";
import {AuthenticationFailed} from "./errors.ts";

export let serversOnline: Record<string, {
    id: string;
    icon: string;
    name: string;
    domain: string;
    timeout: NodeJS.Timeout;
    online: number;
    session: string;
}> = {}

export const removeServer = (id: string) => {
    delete serversOnline[id];
}

export const Authentication = async (call: grpc.ServerUnaryCall<AuthenticationRequest, AuthenticationResponse>, callback: grpc.sendUnaryData<AuthenticationResponse>) => {
    const request = call.request

    const valid = validateAuth(request)

    if (valid) {
        console.log(request)
        const token = (request as any).token;

        const server = await database.server.findFirst({
            where: {
                token
            }
        })

        if (server && !Object.keys(serversOnline).includes(server.id)) {
            const session = randomBytes(32).toString("hex")

            serversOnline[server.id] = {
                id: server.id,
                icon: server.icon,
                name: server.name,
                domain: server.domain,
                timeout: setTimeout(() => removeServer(server.id), Env.gTimeout),
                online: 0,
                session
            }

            const response = {
                session
            } as any

            callback(null, response)
            return
        }
    }

    return callback(AuthenticationFailed)
}

export const authMiddleware = (metadata: { [key: string]: MetadataValue; } ) => {
    const tokens = metadata["token"]
    if (tokens !== undefined && typeof tokens === "string" && tokens.length >= 64) {
        const filteredServers = Object.values(serversOnline).filter(v => v.session === tokens)
        if (filteredServers.length != 0) {
            const server = filteredServers[0]
            clearTimeout(server.timeout)
            serversOnline[server.id].timeout = setTimeout(() => removeServer(server.id), Env.gTimeout)
            return server
        }
    }
    return false;
}