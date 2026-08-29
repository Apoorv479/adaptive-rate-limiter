import fs from "node:fs";
import redis from "../redis/client.js";
import {
  RateLimiter,
  RateLimitResult,
} from "./ratelimiter.js";

export interface TokenBucketConfig {
  capacity: number;
  refillRate: number;
}

export class RedisTokenBucket implements RateLimiter {
  private script: string;

  constructor(private config: TokenBucketConfig) {
    this.script = fs.readFileSync(
      "src/redis/scripts/tokenBucket.lua",
      "utf-8"
    );
  }

  async tryConsume(
    key: string,
    tokens = 1
  ): Promise<RateLimitResult> {
    const now = Date.now();

    const result = (await redis.eval(
      this.script,
      1,
      key,
      this.config.capacity,
      this.config.refillRate,
      tokens,
      now
    )) as [number, number];

    return {
      allowed: result[0] === 1,
      remaining: Math.floor(result[1]),
      resetAfter: Math.ceil(
        1 / this.config.refillRate
      ),
    };
  }
}