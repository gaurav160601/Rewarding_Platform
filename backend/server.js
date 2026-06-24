require("dotenv").config();

const logger = require("./src/utils/logger");
const app = require("./src/app");

const config =
  require("./src/config/app.config");

const {connectMySQL} = require("./src/database/mysql");

const connectMongo = require("./src/database/mongo");

require(
  "./src/workers/reward.worker"
);

require(
  "./src/workers/email.worker"
);

const { startKafka, stopKafka } = require("./src/kafka.bootstrap");

const redisClient =
require("./src/config/redis.config");

const startServer = async () => {
  logger.info({ step: "APP_STARTING" }, "Application starting");

  try {

    await connectMySQL();
    logger.info({ step: "MYSQL_CONNECTED" }, "TiDB connected successfully");

    try {
      await connectMongo();
    } catch {
      logger.warn({ step: "MONGODB_CONNECTED" }, "MongoDB unavailable — reward features disabled");
    }

    await startKafka();

    const server = app.listen(config.port, () => {
      logger.info(
        { step: "SERVER_STARTED", port: config.port },
        `Server running on port ${config.port}`
      );
    });

    const gracefulShutdown = async (signal) => {
      logger.info({ signal }, "Shutdown signal received — shutting down gracefully");
      await stopKafka();
      server.close(() => {
        logger.info("HTTP server closed");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

  } catch (error) {

    logger.fatal(
      { error: error.message, stack: error.stack },
      "Startup Failed"
    );

    process.exit(1);
  }
};

process.on("unhandledRejection", (reason) => {
  logger.fatal(
    { type: "UNHANDLED_REJECTION", error: reason?.message, stack: reason?.stack },
    "Unhandled Promise Rejection"
  );
});

process.on("uncaughtException", (err) => {
  logger.fatal(
    { type: "UNCAUGHT_EXCEPTION", error: err.message, stack: err.stack },
    "Uncaught Exception"
  );
  process.exit(1);
});

startServer();
