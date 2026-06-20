import type { RouteOptions } from "fastify";

export const addServerRoute: RouteOptions = {
  method: "POST",
  url: "/admin/servers/add",
  config: {
    rateLimit: {
      max: 3,
      timeWindow: "5s",
    },
  },
  schema: {
    body: {
      type: "object",
      properties: {
        name: { type: "string", maxLength: 16 },
        domain: { type: "string", maxLength: 16 },
        icon: { type: "string", maxLength: 1 },
        token: { type: "string", minLength: 63, maxLength: 6 },
      },
      required: ["name", "domain", "token", "icon"],
    },
  },
  handler: async (req, res) => {
    res.code(200);
    res.send({ status: "success" });
  },
};
