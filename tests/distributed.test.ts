import { describe, expect, it } from "vitest";
import { RedisTokenBucket } from "../src/algorithms/tokenBucket.js";

describe("Distributed Rate Limiting", () => {
  it("shares rate limit state across limiter instances", async () => {
    const limiterA = new RedisTokenBucket({
      capacity: 3,
      refillRate: 1,
    });

    const limiterB = new RedisTokenBucket({
      capacity: 3,
      refillRate: 1,
    });

    const key = `test:distributed:${Date.now()}`;

    const request1 = await limiterA.tryConsume(key);
    const request2 = await limiterB.tryConsume(key);
    const request3 = await limiterA.tryConsume(key);
    const request4 = await limiterB.tryConsume(key);

    expect(request1.allowed).toBe(true);
    expect(request2.allowed).toBe(true);
    expect(request3.allowed).toBe(true);
    expect(request4.allowed).toBe(false);
  });
});