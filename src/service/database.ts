import {PrismaClient} from "../../generated/prisma/client";


const database = new PrismaClient({})

export {database}