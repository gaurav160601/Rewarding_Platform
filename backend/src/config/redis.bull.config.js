const Redis = require("ioredis");

function createBullConnection() {
  return new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT || 6379),
    password: process.env.REDIS_PASSWORD || undefined,
    tls: process.env.REDIS_TLS === "true" ? {} : undefined,
    maxRetriesPerRequest: null,
    retryStrategy(times) {
      return Math.min(times * 200, 5000);
    }
  });
}

module.exports = { createBullConnection };
