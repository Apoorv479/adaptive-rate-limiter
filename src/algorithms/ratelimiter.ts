export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAfter: number;
}

export interface RateLimiter {
  tryConsume(key: string): Promise<RateLimitResult>;
}