const gql =
  require("graphql-tag");

const UserType = gql`
  type User {
    id: Int
    name: String
    email: String
    role: String
    reward_points: Int
    created_at: String
    updated_at: String
  }
`;

module.exports = UserType;
