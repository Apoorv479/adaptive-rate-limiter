import Fastify from "fastify";
import { apiRoutes } from "./routes/api.js";
import { config } from "./config.js";

const app = Fastify({
  logger: true,
});

app.register(apiRoutes);

app.get("/health", async () => {
  return {
    status: "ok",
  };
});

const start = async () => {
  try {
    await app.listen({
      port: config.port,
      host: "0.0.0.0",
    });

    console.log(
      `Server running on http://localhost:${config.port}`
    );

    console.log(
      `Rate limit algorithm: ${config.rateLimitAlgorithm}`
    );
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();