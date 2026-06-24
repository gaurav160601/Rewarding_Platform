const logger = require("../utils/logger");

function errorLogger(err, req, res, next) {
  const log = req.log || logger.child({ module: "error" });

  const errorData = {
    message: err.message,
    stack: err.stack,
    route: req.originalUrl || req.url,
    method: req.method,
    requestId: req.requestId,
    userId: req.user?.id,
  };

  if (err.name === "ValidationError") {
    log.error({ ...errorData, type: "VALIDATION_ERROR" }, err.message);
  } else if (err.code === "ER_DUP_ENTRY" || (err.code && err.code.startsWith("ER_"))) {
    log.error({ ...errorData, type: "DATABASE_ERROR" }, err.message);
  } else if (err.type === "StripeError" || (err.raw && err.raw.type && err.raw.type.startsWith("stripe"))) {
    log.error({ ...errorData, type: "PAYMENT_ERROR" }, err.message);
  } else if (err.message && (err.message.includes("Kafka") || err.message.includes("kafka"))) {
    log.error({ ...errorData, type: "KAFKA_ERROR" }, err.message);
  } else if (err.message && err.message.includes("Redis")) {
    log.error({ ...errorData, type: "REDIS_ERROR" }, err.message);
  } else {
    log.error({ ...errorData, type: "INTERNAL_SERVER_ERROR" }, err.message);
  }

  next(err);
}

module.exports = errorLogger;
