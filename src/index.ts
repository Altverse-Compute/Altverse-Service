import Fastify from 'fastify'
import {Env} from "./service/env.ts";
import helmet from "@fastify/helmet"

import {account} from "./routes/account.ts"
import {session} from "./routes/session.ts"
import {profile} from "./routes/profile.ts"

import cookie from "@fastify/cookie";
import cors from '@fastify/cors';
import {RPCServer} from "./rpc";

const fastify = Fastify({
    logger: true
})

await fastify.register(helmet)
await fastify.register(cors, {
    origin: Env.frontendUrl,
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    preflightContinue: false,
    hideOptionsRoute: true,
    hook: "preValidation"
})
await fastify.register(cookie, {
    secret: Env.cookieSecret
})
await fastify.register(account)
await fastify.register(session)
await fastify.register(profile)

try {
    await fastify.listen({ port: Env.port })
} catch (err) {
    fastify.log.error(err)
}

const rpc = new RPCServer()