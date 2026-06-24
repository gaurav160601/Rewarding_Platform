const Redis =
require("ioredis");

const logger = require("../utils/logger");

const redisLog = logger.child({ module: "redis" });

const client =
new Redis({
  host:
    process.env
      .REDIS_HOST ||
    "localhost",
  port:
    Number(
      process.env
        .REDIS_PORT ||
      6379
    ),
  password:
    process.env
      .REDIS_PASSWORD ||
    undefined,
  tls:
    process.env
      .REDIS_TLS ===
    "true"
      ? {}
      : undefined,
  maxRetriesPerRequest: null,
});

client.on(
  "error",
  (err) => {
    redisLog.error(
      { event: "REDIS_CONNECTION_ERROR", error: err.message },
      "REDIS_CONNECTION_ERROR"
    );
  }
);

client.on(
  "connect",
  () => {
    redisLog.info(
      { event: "REDIS_CONNECTED" },
      "REDIS_CONNECTED"
    );
  }
);

module.exports = client;
