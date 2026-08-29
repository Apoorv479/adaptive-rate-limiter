import redis from "../redis/client.js";

export interface FixedWindowConfig {
  limit: number;
  windowSeconds: number;
}

export class FixedWindowLimiter {
  constructor(private config: FixedWindowConfig) {}

  async tryConsume(
    key: string
  ): Promise<{
    allowed: boolean;
    remaining: number;
    resetAfter: number;
  }> {
    const windowId = Math.floor(
      Date.now() / 1000 / this.config.windowSeconds
    );

    const redisKey = `fixed-window:${key}:${windowId}`;

    const count = await redis.incr(redisKey);

    if (count === 1) {
      await redis.expire(
        redisKey,
        this.config.windowSeconds
      );
    }

    const allowed = count <= this.config.limit;

    const remaining = Math.max(
      0,
      this.config.limit - count
    );

    const elapsed =
      Math.floor(Date.now() / 1000) %
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