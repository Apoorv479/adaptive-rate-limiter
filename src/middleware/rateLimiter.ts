import { FastifyReply, FastifyRequest } from "fastify";
import { RedisTokenBucket } from "../algorithms/tokenBucket.js";
import { PolicyEngine } from "../policy/policyEngine.js";
import { UserPlan } from "../policy/policies.js";

const policyEngine = new PolicyEngine();

export async function rateLimiter(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const plan: UserPlan = "free";

  const policy = policyEngine.getPolicy(
    plan,
    request.url
  );

  const bucket = new RedisTokenBucket(policy);

  const key = `rate-limit:${plan}:${request.ip}:${request.url}`;

  const result = await bucket.tryConsume(key);

  reply.header(
    "X-RateLimit-Limit",
    policy.capacity
  );

  reply.header(
    "X-RateLimit-Remaining",
    Math.floor(result.remaining)
  );

  if (!result.allowed) {
    reply.header("Retry-After", 60);

    return reply.status(429).send({
      error: "Too Many Requests",
      message: "Rate limit exceeded",
    });
  }
}