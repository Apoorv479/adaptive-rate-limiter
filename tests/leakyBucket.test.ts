import { describe, expect, it } from "vitest";
import { LeakyBucketLimiter } from "../src/algorithms/leakyBucket.js";

describe("Leaky Bucket Limiter", () => {
  it("allows requests until bucket is full", async () => {
    const limiter = new LeakyBucketLimiter({
      capacity: 3,
      leakRate: 0.01,
    });

    const key = `test:leaky:${Date.now()}`;

    const first = await limiter.tryConsume(key);
    const second = await limiter.tryConsume(key);
    const third = await limiter.tryConsume(key);

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    expect(third.allowed).toBe(true);
  });

  it("rejects requests when bucket is full", async () => {
    const limiter = new LeakyBucketLimiter({
      capacity: 3,
      leakRate: 0.01,
    });

    const key = `test:leaky:reject:${Date.now()}`;

    await limiter.tryConsume(key);
    await limiter.tryConsume(key);
    await limiter.tryConsume(key);

    const fourth = await limiter.tryConsume(key);

    expect(fourth.allowed).toBe(false);
    expect(fourth.remaining).toBe(0);
  });

  it("tracks remaining capacity", async () => {
    const limiter = new LeakyBucketLimiter({
      capacity: 5,
      leakRate: 0.01,
    });

    const key = `test:leaky:remaining:${Date.now()}`;

    const result = await limiter.tryConsume(key);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });
});