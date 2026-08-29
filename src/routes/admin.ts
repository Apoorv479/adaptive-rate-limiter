import { FastifyInstance } from "fastify";
import {
  apiKeys,
  planPolicies,
  UserPlan,
} from "../policy/policies.js";

export async function adminRoutes(
  app: FastifyInstance
) {
  // Get all policies
  app.get("/admin/policies", async () => {
    return {
      success: true,
      policies: planPolicies,
    };
  });

  // Get specific policy
  app.get<{
    Params: {
      plan: UserPlan;
    };
  }>("/admin/policies/:plan", async (request, reply) => {
    const { plan } = request.params;

    if (!planPolicies[plan]) {
      return reply.status(404).send({
        error: "Not Found",
        message: `Policy not found for plan: ${plan}`,
      });
    }

    return {
      success: true,
      plan,
      policy: planPolicies[plan],
    };
  });

  // Update a policy
  app.put<{
    Params: {
      plan: UserPlan;
    };
    Body: {
      capacity: number;
      refillRate: number;
    };
  }>("/admin/policies/:plan", async (request, reply) => {
    const { plan } = request.params;
    const { capacity, refillRate } = request.body;

    if (!planPolicies[plan]) {
      return reply.status(404).send({
        error: "Not Found",
        message: `Policy not found for plan: ${plan}`,
      });
    }

    if (
      typeof capacity !== "number" ||
      typeof refillRate !== "number" ||
      capacity <= 0 ||
      refillRate <= 0
    ) {
      return reply.status(400).send({
        error: "Bad Request",
        message:
          "capacity and refillRate must be positive numbers",
      });
    }

    planPolicies[plan] = {
      capacity,
      refillRate,
    };

    return {
      success: true,
      message: `Policy updated for ${plan}`,
      plan,
      policy: planPolicies[plan],
    };
  });

  // Get configured API keys
  app.get("/admin/api-keys", async () => {
    return {
      success: true,
      apiKeys,
    };
  });
}