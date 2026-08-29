import { SlidingWindowLimiter } from "./algorithms/slidingWindow.js";

const limiter = new SlidingWindowLimiter({
  limit: 5,
  windowSeconds: 60,
});

async function start() {
  for (let i = 1; i <= 8; i++) {
    const result = await limiter.tryConsume(
      "test-client"
    );

    console.log(`Request ${i}:`, result);
  }

  process.exit(0);
}

start();