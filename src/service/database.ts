import {PrismaClient} from "../../generated/prisma/client";
import {Env} from "./env.ts";


const database = new PrismaClient({})
database.$connect()

export {database}