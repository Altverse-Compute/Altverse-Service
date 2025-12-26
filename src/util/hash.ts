import type {FastifyInstance} from "fastify";
import argon2 from "argon2";

export const hash = async (value: string) => await argon2.hash(value, {
    type: argon2.argon2id,
    memoryCost: 1024 * 20,
    timeCost: 2,
    parallelism: 1,
})

export const verify = async (hash: string, value: string) => await argon2.verify(hash, value)