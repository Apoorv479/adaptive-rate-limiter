import Fastify from "fastify";
import { apiRoutes } from "./routes/api.js";

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
      port: 3000,
      host: "0.0.0.0",
    });

    console.log("Server running on http://localhost:3000");
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();