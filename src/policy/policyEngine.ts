import {
  UserPlan,
  RateLimitPolicy,
  planPolicies,
  endpointPolicies,
} from "./policies.js";

export class PolicyEngine {
  getPolicy(
    plan: UserPlan,
    endpoint: string
  ): RateLimitPolicy {
    const endpointPolicy = endpointPolicies[endpoint];

    if (endpointPolicy) {
      return endpointPolicy;
    }

    return planPolicies[plan];
  }
}