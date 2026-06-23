const gql =
  require("graphql-tag");

const UserQuery = gql`
  extend type Query {
    profile: User
  }
`;

module.exports = UserQuery;
