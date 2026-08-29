import { describe, expect, it } from "vitest";
import { RedisTokenBucket } from "../src/algorithms/tokenBucket.js";
import redis from "../src/redis/client.js";

describe("Redis Token Bucket", () => {
  const limiter = new RedisTokenBucket({
    capacity: 3,
    refillRate: 1,
  });

  it("allows requests until bucket is empty", async () => {
    const key = `test:token:${Date.now()}`;

    const first = await limiter.tryConsume(key);
    const second = await limiter.tryConsume(key);
    const third = await limiter.tryConsume(key);
    const fourth = await limiter.tryConsume(key);

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    expect(third.allowed).toBe(true);
    expect(fourth.allowed).toBe(false);
  });

  it("tracks remaining tokens", async () => {
    const key = `test:token:remaining:${Date.now()}`;

    const result = await limiter.tryConsume(key);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it("uses redis-backed state", async () => {
    const key = `test:token:redis:${Date.now()}`;

    await limiter.tryConsume(key);

    const exists = await redis.exists(key);

    expect(exists).toBe(1);
  });
});