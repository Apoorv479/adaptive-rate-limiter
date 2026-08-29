import redis from "../redis/client.js";
import {
  RateLimiter,
  RateLimitResult,
} from "./ratelimiter.js";

export interface SlidingWindowConfig {
  limit: number;
  windowSeconds: number;
}

export class SlidingWindowLimiter implements RateLimiter {
  constructor(private config: SlidingWindowConfig) {}

  async tryConsume(
    key: string
  ): Promise<RateLimitResult> {
    const now = Date.now();

    const windowStart =
      now -
      this.config.windowSeconds * 1000;

    const redisKey =
      `sliding-window:${key}`;

    // Remove requests outside the window.
    await redis.zremrangebyscore(
      redisKey,
      0,
      windowStart
    );

    // Count requests inside the window.
    const currentCount =
      await redis.zcard(redisKey);

    // Reject when limit is reached.
    if (
      currentCount >= this.config.limit
    ) {
      return {
        allowed: false,
        remaining: 0,
        resetAfter:
          this.config.windowSeconds,
      };
    }

    // Unique request identifier.
    const requestId =
      `${now}-${Math.random()}`;

    // Add request to sorted set.
    await redis.zadd(
      redisKey,
      now,
      requestId
    );

    // Automatically expire the key.
    await redis.expire(
      redisKey,
      this.config.windowSeconds
    );

    const remaining = Math.max(
      0,
      this.config.limit -
        currentCount -
        1
    );

    return {
      allowed: true,
      remaining,
      resetAfter:
        this.config.windowSeconds,
    };
  }
}