import redis from "../redis/client.js";
import {
  RateLimiter,
  RateLimitResult,
} from "./ratelimiter.js";

export interface FixedWindowConfig {
  limit: number;
  windowSeconds: number;
}

export class FixedWindowLimiter implements RateLimiter {
  constructor(private config: FixedWindowConfig) {}

  async tryConsume(
    key: string
  ): Promise<RateLimitResult> {
    const now = Date.now();

    const windowId = Math.floor(
      now / 1000 / this.config.windowSeconds
    );

    const redisKey = `fixed-window:${key}:${windowId}`;

    const count = await redis.incr(redisKey);

    if (count === 1) {
      await redis.expire(
        redisKey,
        this.config.windowSeconds
      );
    }

    const allowed =
      count <= this.config.limit;

    const remaining = Math.max(
      0,
      this.config.limit - count
    );

    const elapsed =
      Math.floor(now / 1000) %
      this.config.windowSeconds;

    const resetAfter =
      this.config.windowSeconds - elapsed;

    return {
      allowed,
      remaining,
      resetAfter,
    };
  }
}