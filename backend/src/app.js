const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const routes = require("./routes");
const errorMiddleware = require("./middleware/error.middleware");
const requestLogger = require("./middlewares/requestLogger");
const errorLogger = require("./middlewares/errorLogger");
const app = express();

// Security
const allowedOrigins = (
  process.env.CORS_ORIGINS ||
  "http://localhost:5173,http://localhost:3000"
).split(",");

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(helmet());

// Performance
app.use(compression());

// Request Tracking (generates requestId for every request)
app.use(requestLogger);

// Stripe Webhook — raw body before any parser
app.use("/api/payments/webhook", (req, res, next) => {
  express.raw({ type: "application/json" })(req, res, (err) => {
    if (err) return next(err);
    req.rawBody = req.body;
    next();
  });
});

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);

// Error Logging (logs error before sending response)
app.use(errorLogger);

// Error Response
app.use(errorMiddleware);

module.exports = app;