import redis from "../redis/client.js";
import {
  RateLimiter,
  RateLimitResult,
} from "./ratelimiter.js";

export interface LeakyBucketConfig {
  capacity: number;
  leakRate: number;
}

export class LeakyBucketLimiter
  implements RateLimiter
{
  constructor(
    private config: LeakyBucketConfig
  ) {}

  async tryConsume(
    key: string
  ): Promise<RateLimitResult> {
    const redisKey =
      `leaky-bucket:${key}`;

    const now = Date.now();

    const data = await redis.hmget(
      redisKey,
      "water",
      "last_leak"
    );

    let water =
      Number(data[0]) || 0;

    let lastLeak =
      Number(data[1]) || now;

    // Calculate elapsed time.
    const elapsedSeconds =
      (now - lastLeak) / 1000;

    // Calculate leaked water.
    const leaked =
      elapsedSeconds *
      this.config.leakRate;

    // Remove leaked water.
    water = Math.max(
      0,
      water - leaked
    );

    lastLeak = now;

    // Bucket is full.
    if (
      water + 1 >
      this.config.capacity
    ) {
      await redis
        .multi()
        .hset(redisKey, {
          water,
          last_leak: lastLeak,
        })
        .expire(
          redisKey,
          Math.ceil(
            this.config.capacity /
              this.config.leakRate
          ) + 60
        )
        .exec();

      return {
        allowed: false,
        remaining: 0,
        resetAfter: Math.ceil(
          1 / this.config.leakRate
        ),
      };
    }

    // Add request.
    water += 1;

    await redis
      .multi()
      .hset(redisKey, {
        water,
        last_leak: lastLeak,
      })
      .expire(
        redisKey,
        Math.ceil(
          this.config.capacity /
            this.config.leakRate
        ) + 60
      )
      .exec();

    return {
      allowed: true,
      remaining: Math.max(
        0,
        Math.floor(
          this.config.capacity -
            water
        )
      ),
      resetAfter: Math.ceil(
        1 / this.config.leakRate
      ),
    };
  }
}