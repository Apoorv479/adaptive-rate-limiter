export type UserPlan = "free" | "pro" | "enterprise";

export interface RateLimitPolicy {
  capacity: number;
  refillRate: number;
}

export const planPolicies: Record<UserPlan, RateLimitPolicy> = {
  free: {
    capacity: 5,
    refillRate: 5 / 60,
  },

  pro: {
    capacity: 20,
    refillRate: 20 / 60,
  },

  enterprise: {
    capacity: 100,
    refillRate: 100 / 60,
  },
};

export const endpointPolicies: Record<string, RateLimitPolicy> = {
  "/api/expensive": {
    capacity: 3,
    refillRate: 3 / 60,
  },
};