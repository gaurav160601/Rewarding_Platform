const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const routes = require("./routes");
const errorMiddleware =require("./middleware/error.middleware");
const app = express();

// Security
app.use(cors());
app.use(helmet());

// Performance
app.use(compression());

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan("dev"));


app.use("/api", routes);
app.use(errorMiddleware);
module.exports = app;