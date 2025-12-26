import type {FastifyInstance} from "fastify";
import Ajv from "ajv";
import {database} from "../service/database.ts";
import type {LoginProps, RegisterProps} from "./types.ts";
import {randomBytes} from "crypto";
import {hash, verify} from "../util/hash.ts";
import {Env} from "../service/env.ts";

const ajv = new Ajv()
const accountRegisterValidate = ajv.compile({
    type: "object",
    properties: {
        username: { type: "string", maxLength: 16 },
        password: { type: "string", minLength: 4,},
        token: {type: "string", minLength: 32  }
    }
})
const accountLoginValidate = ajv.compile({
    type: "object",
    properties: {
        username: { type: "string", maxLength: 16 },
        password: { type: "string", minLength: 4,},
    }
})


export const account = (app: FastifyInstance) => {
    app.post('/register', async (req, res) => {
        const valid = accountRegisterValidate(req.body);

        if (valid) {
            const body = req.body as RegisterProps;

            const find = await database.account.findFirst({
                where: {
                    name: body.username,
                }
            });
            if (find !== null) {
                res.send({status: "account_exists"});
                return;
            }
            if (body.token !== Env.registerToken) {
                res.send({status: "invalid_register_token"});
                return;
            }

            const password = await hash(body.password)

            const token = randomBytes(16).toString("hex") as string;

            await database.account.create({
                data: {
                    name: body.username,
                    password,
                    profile: {
                        create: {
                            accessories: [],
                            highest: {}
                        }
                    },
                    session: {
                        create: {
                            token,
                            expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
                        }
                    }
                }
            })

            res.setCookie("token", token, {path: '/',
                httpOnly: true,
                secure: Env.mode !== 'dev',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60,
                signed: true});
            res.send({status: "success", token});
        } else {
            res.status(401);
            res.send({status: "failed"});
        }
    })

    app.post('/login', async (req, res) => {
        const valid = accountLoginValidate(req.body);

        if (valid) {
            const body = req.body as LoginProps;

            const account = await database.account.findFirst({
                where: {
                    name: body.username,
                }
            });
            if (account === null) {
                res.send({status: "account_not_exists"});
                return;
            }

            if (await verify(account.password, body.password)) {

                const session = await database.session.findFirst({
                    where: {
                        accountId: account.id
                    }
                })

                const token = randomBytes(16).toString("hex") as string;


                if (session) {
                    await database.session.update({
                        data: {
                            token,
                            expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
                        },
                        where: {accountId: account.id}
                    })
                } else {
                    await database.session.create({
                        data: {
                            token,
                            expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
                            accountId: account.id
                        }
                    })
                }


                res.setCookie("token", token, {path: '/',
                    httpOnly: true,
                    secure: Env.mode !== 'dev',
                    sameSite: 'strict',
                    maxAge: 7 * 24 * 60 * 60,
                    signed: true});
                res.send({status: "success", token});
            } else {
                res.send({status: "wrong_password"})
            }
        } else {
            res.status(401);
            res.send({status: "failed"});
        }
    })
}