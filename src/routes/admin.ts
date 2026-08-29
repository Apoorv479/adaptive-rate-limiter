import { FastifyInstance } from "fastify";
import {
  apiKeys,
  planPolicies,
  UserPlan,
} from "../policy/policies.js";
import { PolicyStore } from "../policy/policyStore.js";

const policyStore = new PolicyStore();

export async function adminRoutes(
  app: FastifyInstance
) {
  // Get all policies
  app.get("/admin/policies", async () => {
    const policies =
      await policyStore.getAllPolicies();

    return {
      success: true,
      policies,
    };
  });

  // Get specific policy
  app.get<{
    Params: {
      plan: UserPlan;
    };
  }>("/admin/policies/:plan", async (
    request,
    reply
  ) => {
    const { plan } = request.params;

    if (!planPolicies[plan]) {
      return reply.status(404).send({
        error: "Not Found",
        message:
          `Policy not found for plan: ${plan}`,
      });
    }

    const policy =
      await policyStore.getPolicy(plan);

    return {
      success: true,
      plan,
      policy,
    };
  });

  // Update policy
  app.put<{
    Params: {
      plan: UserPlan;
    };
    Body: {
      capacity: number;
      refillRate: number;
    };
  }>("/admin/policies/:plan", async (
    request,
    reply
  ) => {
    const { plan } = request.params;
    const { capacity, refillRate } =
      request.body;

    if (!planPolicies[plan]) {
      return reply.status(404).send({
        error: "Not Found",
        message:
          `Policy not found for plan: ${plan}`,
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

    const policy = {
      capacity,
      refillRate,
    };

    await policyStore.setPolicy(
      plan,
      policy
    );

    return {
      success: true,
      message:
        `Policy updated for ${plan}`,
      plan,
      policy,
    };
  });

  // Get configured API keys
  app.get(
    "/admin/api-keys",
    async () => {
      return {
        success: true,
        apiKeys,
      };
    }
  );
}