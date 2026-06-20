import Ajv from "ajv";

const ajv = new Ajv()
export const validateAuth = ajv.compile({
    type: "object",
    properties: {
        token: {
            type: "string",
            minLength: 63
        }
    },
    required: ["token"],
})

export const validatePing = ajv.compile({
    type: "object",
    properties: {
        online: {
            type: "number",
        },
        alive: {
            type: "boolean"
        }
    },
    required: ["online", "alive"],
})

export const validateToken = ajv.compile({
    type: "object",
    properties: {
        token: {
            type: "string",
            minLength: 32,
        }
    },
    required: ["token"],
})

export const validateAward = ajv.compile({
    type: "object",
    properties: {
        id: {
            type: "string",
        },
        vp: {
            type: "number",

        },
        accessory: {
            type: "string",
        }
    },
    required: ["id"],
})