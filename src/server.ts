import {
  createRateLimiter,
} from "./algorithms/factory.js";

async function start() {
  const limiter = createRateLimiter(
    "token-bucket"
  );

  for (let i = 1; i <= 7; i++) {
    const result = await limiter.tryConsume(
      "factory-test"
    );

    console.log(`Request ${i}:`, result);
  }

  process.exit(0);
}

start();