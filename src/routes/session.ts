import type {FastifyInstance} from "fastify";
import type {AuthResponse} from "./types.ts";
import {database} from "../service/database.ts";

export const session = (app: FastifyInstance) => {
    app.get('/auth', async (req, res) => {
        if (req.cookies !== undefined && req.cookies.token !== undefined) {
            const unsignedToken = req.unsignCookie(req.cookies?.token)
            if (!unsignedToken.valid) {
                res.code(401).send({status: "Unauthorized"});
                return;
            }

            const token = unsignedToken.value

            const session = await database.session.findFirst({
                where: {
                    token
                }
            });
            if (session === null) {
                res.code(401).send({status: "unauthorized"});
                return;
            }

            if (session.expiresAt <= Date.now()) {
                await database.session.delete({
                    where: {
                        id: session.id
                    }
                })
                res.code(401).send({status: "unauthorized"});
                return;
            }


            const account = await database.account.findFirst({
                where: {
                    id: session.accountId
                }
            })

            const profile = await database.profile.findFirst({
                where: {
                    accountId: session.accountId
                }
            })
            if (profile != null && account != null) {
                const prof: AuthResponse = {
                    username: account.name,
                    highest: profile.highest as Object,
                    accessories: profile.accessories,
                    vp: profile.vp,
                    role: account.role
                }
                res.send({status: "success", profile: prof});
            } else {
                res.status(401);
                res.send({status: "failed"});
            }
        } else {
            res.status(401);
            res.send({status: "failed"});
        }
    })

    app.get('/logout', async (req, res) => {
            if (req.cookies !== undefined && req.cookies.token !== undefined) {
                const unsignedToken = req.unsignCookie(req.cookies?.token)

                if (unsignedToken.valid) {
                    const token = unsignedToken.value

                    const session = await database.session.findFirst({
                        where: {
                            token
                        }
                    });

                    if (session === null) {
                        res.code(401).send({status: "unauthorized"});
                        return;
                    }
                }

                res.clearCookie("token")
                res.code(200).send({status: "success"})

            } else {
                res.status(401);
                res.send({status: "failed"});
            }
    })
}