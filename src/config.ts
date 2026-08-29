import "dotenv/config";

export const config = {
  port: Number(process.env.PORT) || 3000,

  rateLimitAlgorithm:
    process.env.RATE_LIMIT_ALGORITHM ||
    "token-bucket",
};