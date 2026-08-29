import { FastifyReply, FastifyRequest } from "fastify";
import { RedisTokenBucket } from "../algorithms/tokenBucket.js";

const bucket = new RedisTokenBucket({
  capacity: 5,
  refillRate: 1,
});

export async function rateLimiter(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const key = `rate-limit:${request.ip}`;

  const result = await bucket.tryConsume(key);

  reply.header("X-RateLimit-Limit", 5);
  reply.header(
    "X-RateLimit-Remaining",
    Math.floor(result.remaining)
  );

  if (!result.allowed) {
    reply.header("Retry-After", 1);

    return reply.status(429).send({
      error: "Too Many Requests",
      message: "Rate limit exceeded",
    });
  }
}