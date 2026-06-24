const logger = require("../utils/logger");

const errorMiddleware =
  (err, req, res, next) => {
    const statusCode = err.statusCode || 400;

    if (statusCode >= 500) {
      logger.error(
        { type: "INTERNAL_SERVER_ERROR", message: err.message, stack: err.stack, route: req.originalUrl },
        err.message
      );
    }

    return res.status(statusCode).json({
      success: false,
      message: err.message,
    });

  };

module.exports =
  errorMiddleware;