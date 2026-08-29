import { FixedWindowLimiter } from "./algorithms/fixedWindow.js";

const limiter = new FixedWindowLimiter({
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