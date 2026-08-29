import fs from "node:fs";
import { RedisTokenBucket } from "./algorithms/tokenBucket.js";

const script = fs.readFileSync(
  "src/redis/scripts/tokenBucket.lua",
  "utf-8"
);

const limiter = new RedisTokenBucket(
  {
    capacity: 5,
    refillRate: 1,
  },
  script
);

async function start() {
  for (let i = 1; i <= 8; i++) {
    const result = await limiter.tryConsume("test:user:123");

    console.log(`Request ${i}:`, result);
  }

  process.exit(0);
}

start();