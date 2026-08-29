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

export interface RateLimiterPolicy {
  capacity: number;
  refillRate: number;
}

export function createRateLimiter(
  algorithm: Algorithm,
  policy?: RateLimiterPolicy
): RateLimiter {
  const effectivePolicy =
    policy || {
      capacity: 5,
      refillRate: 1,
    };

  switch (algorithm) {
    case "token-bucket":
      return new RedisTokenBucket({
        capacity: effectivePolicy.capacity,
        refillRate:
          effectivePolicy.refillRate,
      });

    case "fixed-window":
      return new FixedWindowLimiter({
        limit: effectivePolicy.capacity,
        windowSeconds: 60,
      });

    case "sliding-window":
      return new SlidingWindowLimiter({
        limit: effectivePolicy.capacity,
        windowSeconds: 60,
      });

    case "leaky-bucket":
      return new LeakyBucketLimiter({
        capacity: effectivePolicy.capacity,
        leakRate:
          effectivePolicy.refillRate,
      });

    default:
      throw new Error(
        `Unsupported algorithm: ${algorithm}`
      );
  }
}