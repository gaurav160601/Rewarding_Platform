const crypto = require("crypto");
const logger = require("../utils/logger");

function requestLogger(req, res, next) {
  const requestId = crypto.randomUUID().slice(0, 8);
  req.requestId = requestId;

  req.log = logger.child({
    module: "http",
    requestId,
  });

  const method = req.method;
  const url = req.originalUrl || req.url;

  if (url === "/api/health" && method === "GET") {
    return next();
  }

  const start = Date.now();

  req.log.info(
    {
      method,
      url,
      userId: req.user?.id,
      ip: req.ip,
      userAgent: req.get("user-agent"),
    },
    "REQUEST START"
  );

  res.on("finish", () => {
    const responseTime = Date.now() - start;
    req.log.info(
      {
        method,
        url,
        statusCode: res.statusCode,
        responseTime,
      },
      "REQUEST END"
    );
  });

  next();
}

module.exports = requestLogger;
