import redis from "../redis/client.js";
import {
  planPolicies,
  RateLimitPolicy,
  UserPlan,
} from "./policies.js";

const POLICY_PREFIX = "rate-policy:";

export class PolicyStore {
  async getPolicy(
    plan: UserPlan
  ): Promise<RateLimitPolicy> {
    const key = `${POLICY_PREFIX}${plan}`;

    const data = await redis.hgetall(key);

    if (data.capacity && data.refillRate) {
      return {
        capacity: Number(data.capacity),
        refillRate: Number(data.refillRate),
      };
    }

    return planPolicies[plan];
  }

  async setPolicy(
    plan: UserPlan,
    policy: RateLimitPolicy
  ): Promise<void> {
    const key = `${POLICY_PREFIX}${plan}`;

    await redis.hset(key, {
      capacity: policy.capacity,
      refillRate: policy.refillRate,
    });
  }

  async getAllPolicies(): Promise<
    Record<UserPlan, RateLimitPolicy>
  > {
    const plans: UserPlan[] = [
      "free",
      "pro",
      "enterprise",
    ];

    const policies = {} as Record<
      UserPlan,
      RateLimitPolicy
    >;

    for (const plan of plans) {
      policies[plan] =
        await this.getPolicy(plan);
    }

    return policies;
  }
}