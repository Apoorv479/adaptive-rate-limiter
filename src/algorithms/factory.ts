import {
  RateLimiter,
} from "./ratelimiter.js";

import {
  RedisTokenBucket,
} from "./tokenBucket.js";

import {
  FixedWindowLimiter,
} from "./fixedWindow.js";

import {
  SlidingWindowLimiter,
} from "./slidingWindow.js";

import {
  LeakyBucketLimiter,
} from "./leakyBucket.js";

export type Algorithm =
  | "token-bucket"
  | "fixed-window"
  | "sliding-window"
  | "leaky-bucket";

export function createRateLimiter(
  algorithm: Algorithm
): RateLimiter {
  switch (algorithm) {
    case "token-bucket":
      return new RedisTokenBucket({
        capacity: 5,
        refillRate: 1,
      });

    case "fixed-window":
      return new FixedWindowLimiter({
        limit: 5,
        windowSeconds: 60,
      });

    case "sliding-window":
      return new SlidingWindowLimiter({
        limit: 5,
        windowSeconds: 60,
      });

    case "leaky-bucket":
      return new LeakyBucketLimiter({
        capacity: 5,
        leakRate: 1,
      });

    default:
      throw new Error(
        `Unsupported algorithm: ${algorithm}`
      );
  }
}