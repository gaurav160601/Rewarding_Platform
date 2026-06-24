const Redis = require("ioredis");
const logger = require("../utils/logger");

const bullLog = logger.child({ module: "bullmq.redis" });

function createBullConnection() {
  const client = new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT || 6379),
    password: process.env.REDIS_PASSWORD || undefined,
    tls: process.env.REDIS_TLS === "true" ? {} : undefined,
    maxRetriesPerRequest: null,
    retryStrategy(times) {
      return Math.min(times * 200, 5000);
    }
  });

  client.on("error", (err) => {
    bullLog.error({ event: "REDIS_CONNECTION_ERROR", error: err.message }, "REDIS_CONNECTION_ERROR");
  });

  client.on("connect", () => {
    bullLog.info({ event: "BULLMQ_CONNECTED" }, "BULLMQ_CONNECTED");
  });

  return client;
}

module.exports = { createBullConnection };
