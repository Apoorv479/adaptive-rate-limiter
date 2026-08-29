import { FastifyInstance } from "fastify";
import { rateLimiter } from "../middleware/rateLimiter.js";

export async function apiRoutes(app: FastifyInstance) {
  app.get(
    "/api/test",
    {
      preHandler: rateLimiter,
    },
    async () => {
      return {
        success: true,
        message: "Request allowed",
      };
    }
  );
}