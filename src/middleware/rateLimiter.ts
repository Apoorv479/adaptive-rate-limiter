import {
  FastifyReply,
  FastifyRequest,
} from "fastify";

import {
  createRateLimiter,
  Algorithm,
} from "../algorithms/factory.js";

import { config } from "../config.js";

import {
  apiKeys,
  UserPlan,
} from "../policy/policies.js";

import { PolicyEngine } from "../policy/policyEngine.js";

const policyEngine = new PolicyEngine();

export async function rateLimiter(
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Read API key
  const apiKey =
    request.headers["x-api-key"];

  // API key is required
  if (
    !apiKey ||
    typeof apiKey !== "string"
  ) {
    return reply.status(401).send({
      error: "Unauthorized",
      message:
        "X-API-Key header is required",
    });
  }

  // Identify user's plan
  const plan =
    apiKeys[apiKey] as UserPlan | undefined;

  // Invalid API key
  if (!plan) {
    return reply.status(401).send({
      error: "Unauthorized",
      message: "Invalid API key",
    });
  }

  // Get latest policy from Redis
  const policy =
    await policyEngine.getPolicy(plan);

  // Get selected rate limiting algorithm
  const algorithm =
    config.rateLimitAlgorithm as Algorithm;

  // Create limiter with dynamic policy
  const limiter =
    createRateLimiter(
      algorithm,
      policy
    );

  // Unique rate-limit key
  const key =
    `${plan}:${apiKey}:${request.url}`;

  // Consume one request
  const result =
    await limiter.tryConsume(key);

  // Rate limit headers
  reply.header(
    "X-RateLimit-Limit",
    policy.capacity
  );

  reply.header(
    "X-RateLimit-Remaining",
    Math.floor(result.remaining)
  );

  reply.header(
    "X-RateLimit-Reset",
    result.resetAfter
  );

  // Rate limit exceeded
  if (!result.allowed) {
    reply.header(
      "Retry-After",
      result.resetAfter
    );

    return reply.status(429).send({
      error: "Too Many Requests",
      message: "Rate limit exceeded",
    });
  }
}