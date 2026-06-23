const { ApolloServer } =
  require("@apollo/server");

const { expressMiddleware } =
  require("@apollo/server/express4");

const schema =
  require("../graphql/schema");

const authContext =
  require("../context/auth.context");

function createApolloServer() {
  const server =
    new ApolloServer({
      schema,
      introspection:
        process.env
          .NODE_ENV !==
        "production",
    });

  return server;
}

function applyMiddleware(app, server) {
  return expressMiddleware(server, {
    context: authContext,
  });
}

module.exports = {
  createApolloServer,
  applyMiddleware,
};
