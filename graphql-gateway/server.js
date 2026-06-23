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

  app.use(cors());

  app.use(express.json());

  const server =
    createApolloServer();

  await server.start();

  app.use(
    "/graphql",
    cors(),
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
