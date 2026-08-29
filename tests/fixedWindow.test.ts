import { describe, expect, it } from "vitest";
import { FixedWindowLimiter } from "../src/algorithms/fixedWindow.js";

describe("Fixed Window Limiter", () => {
  it("allows requests within the limit", async () => {
    const limiter = new FixedWindowLimiter({
      limit: 3,
      windowSeconds: 60,
    });

    const key = `test:fixed:${Date.now()}`;

    const first = await limiter.tryConsume(key);
    const second = await limiter.tryConsume(key);
    const third = await limiter.tryConsume(key);

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    expect(third.allowed).toBe(true);
  });

  it("rejects requests after limit is reached", async () => {
    const limiter = new FixedWindowLimiter({
      limit: 3,
      windowSeconds: 60,
    });

    const key = `test:fixed:reject:${Date.now()}`;

    await limiter.tryConsume(key);
    await limiter.tryConsume(key);
    await limiter.tryConsume(key);

    const fourth = await limiter.tryConsume(key);

    expect(fourth.allowed).toBe(false);
    expect(fourth.remaining).toBe(0);
  });

  it("tracks remaining requests", async () => {
    const limiter = new FixedWindowLimiter({
      limit: 5,
      windowSeconds: 60,
    });

    const key = `test:fixed:remaining:${Date.now()}`;

    const result = await limiter.tryConsume(key);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });
});