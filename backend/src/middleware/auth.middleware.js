const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");

const authLog = logger.child({ module: "auth.middleware" });

const authMiddleware = (
  req,
  res,
  next
) => {
  try {

    const authHeader =
      req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization header missing",
      });
    }

    const token =
      authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token missing",
      });
    }

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    req.user = decoded;

    authLog.info(
      { event: "JWT_VALIDATED", userId: decoded.id, email: decoded.email },
      "JWT_VALIDATED"
    );

    next();

  } catch (error) {

    if (error.name === "TokenExpiredError") {
      authLog.warn({ event: "JWT_EXPIRED" }, "JWT_EXPIRED");
    }

    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });

  }
};

module.exports =
  authMiddleware;