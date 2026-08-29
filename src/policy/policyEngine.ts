import {
  planPolicies,
  UserPlan,
  RateLimitPolicy,
} from "./policies.js";
import { PolicyStore } from "./policyStore.js";

export class PolicyEngine {
  private policyStore: PolicyStore;

  constructor() {
    this.policyStore = new PolicyStore();
  }

  async getPolicy(
    plan: UserPlan
  ): Promise<RateLimitPolicy> {
    const policy =
      await this.policyStore.getPolicy(plan);

    return (
      policy ||
      planPolicies[plan]
    );
  }
}