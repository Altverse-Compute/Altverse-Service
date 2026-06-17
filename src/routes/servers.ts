import type {FastifyInstance} from "fastify";
import {serversOnline} from "../rpc/middleware.ts";
import {Env} from "../service/env.ts";

export const servers = (app: FastifyInstance) => {
    app.get('/servers', async (req, res) => {
        const servers = Object.values(serversOnline).map(v => ({
            icon: v.icon,
            name: v.name,
            domain: v.domain,
            online: v.online
        }))

        res.code(200).send({
            status: "success",
            servers
        });
    });
}