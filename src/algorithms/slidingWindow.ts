import redis from "../redis/client.js";

export interface SlidingWindowConfig {
  limit: number;
  windowSeconds: number;
}

export interface SlidingWindowResult {
  allowed: boolean;
  remaining: number;
  resetAfter: number;
}

export class SlidingWindowLimiter {
  constructor(private config: SlidingWindowConfig) {}

  async tryConsume(key: string): Promise<SlidingWindowResult> {
    const now = Date.now();

    const windowStart =
      now - this.config.windowSeconds * 1000;

    const redisKey = `sliding-window:${key}`;

    // Remove requests outside the current sliding window
    await redis.zremrangebyscore(
      redisKey,
      0,
      windowStart
    );

    // Count requests currently inside the window
    const currentCount = await redis.zcard(redisKey);

    // Reject if the limit has been reached
    if (currentCount >= this.config.limit) {
      return {
        allowed: false,
        remaining: 0,
        resetAfter: this.config.windowSeconds,
      };
    }

    // Create a unique request ID
    const requestId = `${now}-${Math.random()}`;

    // Add current request to the sorted set
    await redis.zadd(
      redisKey,
      now,
      requestId
    );

    // Automatically remove the key after the window
    await redis.expire(
      redisKey,
      this.config.windowSeconds
    );

    const remaining = Math.max(
      0,
      this.config.limit - currentCount - 1
    );

    return {
      allowed: true,
      remaining,
      resetAfter: this.config.windowSeconds,
    };
  }
}