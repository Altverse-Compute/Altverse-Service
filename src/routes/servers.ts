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
        if (Env.mode == "dev") servers.push({
            icon: "X",
            name: "Dev Server",
            domain: "http://localhost:7002",
            online: 1
        })

        console.log(servers)

        res.code(200).send({
            status: "success",
            servers
        });
    });
}