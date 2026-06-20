import { FastifyInstance as FI } from "fastify";

export namespace Fastify {
  interface RPC {
    getOnlineServers: () => number;
  }

  export interface FastifyInstance extends FI {
    rpc: RPC;
  }
}
