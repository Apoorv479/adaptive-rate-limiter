import redis from "../redis/client.js";

export interface TokenBucketConfig {
  capacity: number;
  refillRate: number;
}

export class RedisTokenBucket {
  private script: string;

  constructor(private config: TokenBucketConfig, script: string) {
    this.script = script;
  }

  async tryConsume(
    key: string,
    tokens = 1
  ): Promise<{
    allowed: boolean;
    remaining: number;
  }> {
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
      remaining: result[1],
    };
  }
}