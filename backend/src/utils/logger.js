const pino = require("pino");

const isProduction = process.env.NODE_ENV === "production";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  ...(isProduction
    ? {
        formatters: {
          level(label) {
            return { level: label };
          },
        },
        timestamp: pino.stdTimeFunctions.isoTime,
        messageKey: "message",
      }
    : {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:yyyy-mm-dd HH:MM:ss.l",
            ignore: "pid,hostname,service",
          },
        },
      }),
  base: {
    service: "rewarding-platform",
  },
  redact: {
    paths: ["req.headers.authorization", "data.token", "data.password"],
    censor: "[REDACTED]",
  },
});

function createChild(moduleName) {
  return logger.child({ module: moduleName });
}

module.exports = logger;
module.exports.createChild = createChild;
