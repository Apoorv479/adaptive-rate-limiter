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

const algorithm =
  config.rateLimitAlgorithm as Algorithm;

const policyEngineLimiter =
  createRateLimiter(algorithm);

export async function rateLimiter(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const apiKey =
    request.headers["x-api-key"];

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

  const plan =
    apiKeys[apiKey] as UserPlan | undefined;

  if (!plan) {
    return reply.status(401).send({
      error: "Unauthorized",
      message: "Invalid API key",
    });
  }

  const key =
    `${plan}:${apiKey}:${request.url}`;

  const result =
    await policyEngineLimiter.tryConsume(key);

  reply.header(
    "X-RateLimit-Remaining",
    Math.floor(result.remaining)
  );

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