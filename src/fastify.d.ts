import { FastifyInstance as FI } from "fastify";
import { PrismaClient } from "@prisma";

declare module "fastify" {
  interface RPC {
    getOnlineServers: () => Record<string, ServerOnline>;
    syncDomains: () => Promise<void>;
  }

  export interface FastifyInstance extends FI {
    rpc: RPC;
    db: PrismaClient;
  }
}
