import { LeakyBucketLimiter } from "./algorithms/leakyBucket.js";

const limiter = new LeakyBucketLimiter({
  capacity: 5,
  leakRate: 1,
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