import type {JoinPlayerRequest, JoinPlayerResponse} from "../types.ts";
import {Role} from "@proto/ts/connection/Role.ts";
import grpc from "@grpc/grpc-js"
import {database} from "../../service/database.ts";
import {validateToken} from "./schema.ts";
import {AccountAuthenticationFailed, AuthenticationFailed} from "../errors.ts";
import {authMiddleware} from "../middleware.ts";

export const JoinPlayer = async (call: grpc.ServerUnaryCall<JoinPlayerRequest, JoinPlayerResponse>, callback: grpc.sendUnaryData<JoinPlayerResponse>) => {

        if (!authMiddleware(call.metadata.getMap())) {
            return callback(AuthenticationFailed)
        }


        if (!validateToken(call.request)) {
            return callback(AccountAuthenticationFailed)
        }
        //@ts-ignore
        const token = call.request.token as string

        const session = await database.session.findFirst({
            where: {
                token
            }
        })

        if (!session) {
            return callback(AccountAuthenticationFailed)
        }

        const account = await database.account.findFirst({
            where: {
                id: session.accountId
            }
        })

        if (!account) {
            return callback(AccountAuthenticationFailed)
        }

        return callback(null, {
            name: account.name,
            role: Role.USER,
            id: session.accountId,
        } as any)
}