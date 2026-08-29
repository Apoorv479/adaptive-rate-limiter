import redis from "../redis/client.js";

export interface LeakyBucketConfig {
  capacity: number;
  leakRate: number;
}

export interface LeakyBucketResult {
  allowed: boolean;
  remaining: number;
}

export class LeakyBucketLimiter {
  constructor(private config: LeakyBucketConfig) {}

  async tryConsume(
    key: string
  ): Promise<LeakyBucketResult> {
    const redisKey = `leaky-bucket:${key}`;

    const currentTime = Date.now();

    const data = await redis.hmget(
      redisKey,
      "water",
      "last_leak"
    );

    let water = Number(data[0]) || 0;
    let lastLeak = Number(data[1]) || currentTime;

    // Calculate how much water leaked since last request
    const elapsedSeconds =
      (currentTime - lastLeak) / 1000;

    const leaked =
      elapsedSeconds * this.config.leakRate;

    water = Math.max(0, water - leaked);

    lastLeak = currentTime;

    // Bucket is full
    if (water + 1 > this.config.capacity) {
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
      };
    }

    // Add request to bucket
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
          this.config.capacity - water
        )
      ),
    };
  }
}