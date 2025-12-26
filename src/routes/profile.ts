import type {FastifyInstance} from "fastify";
import Ajv from "ajv";
import type {AuthResponse, ProfileProps} from "./types.ts";
import {database} from "../service/database.ts";

const ajv = new Ajv()
const validateProfile = ajv.compile({
    type: "object",
    properties: {
        username: {
            type: "string"
        }
    }
})

export const profile = (app: FastifyInstance) => {
    app.get('/profile/:username', async (req, res) => {
        const valid = validateProfile(req.params)

        if (!valid) {
            res.status(400).send({ status: "invalid_body" })
            return;
        }

        const body = req.params as ProfileProps

        const account = await database.account.findFirst({
            where: {
                name: body.username
            }
        })

        if (account === null) {
            res.status(404).send({ status: "not_found" })
            return;
        }

        const profile = await database.profile.findFirst({
            where: {
                accountId: account.id
            }
        })

        if (profile === null) {
            res.status(404).send({ status: "not_found" })
            return;
        }

        const prof: AuthResponse = {
            username: account.name,
            highest: profile.highest as Object,
            accessories: profile.accessories,
            vp: profile.vp,
            role: account.role
        }

        res.code(200).send({
            status: "success",
            profile: prof
        })

    })
}