require("dotenv").config();

const express =
  require("express");

const cors = require("cors");

const {
  createApolloServer,
  applyMiddleware,
} = require("./src/config/apollo.config");

async function startServer() {

  const app = express();

  const allowedOrigins = (
    process.env.CORS_ORIGINS ||
    "http://localhost:5173,http://localhost:3000"
  ).split(",");

  app.use(cors({
    origin: allowedOrigins,
    credentials: true,
  }));

  app.use(express.json());

  const server =
    createApolloServer();

  await server.start();

  app.use(
    "/graphql",
    cors({
      origin: allowedOrigins,
      credentials: true,
    }),
    express.json(),
    applyMiddleware(
      app,
      server
    )
  );

  const PORT =
    process.env.PORT || 4000;

  app.listen(PORT, () => {
    console.log(
      `GraphQL Gateway running on http://localhost:${PORT}/graphql`
    );
  });
}

startServer();
