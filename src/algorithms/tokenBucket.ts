export interface TokenBucketConfig {
  capacity: number;
  refillRate: number;
}

export class TokenBucket {
  private tokens: number;
  private lastRefillTime: number;

  constructor(private config: TokenBucketConfig) {
    this.tokens = config.capacity;
    this.lastRefillTime = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const elapsedSeconds = (now - this.lastRefillTime) / 1000;

    const newTokens = elapsedSeconds * this.config.refillRate;

    this.tokens = Math.min(
      this.config.capacity,
      this.tokens + newTokens
    );

    this.lastRefillTime = now;
  }

  public tryConsume(tokens = 1): boolean {
    this.refill();

    if (this.tokens < tokens) {
      return false;
    }

    this.tokens -= tokens;
    return true;
  }

  public getAvailableTokens(): number {
    this.refill();
    return this.tokens;
  }
}