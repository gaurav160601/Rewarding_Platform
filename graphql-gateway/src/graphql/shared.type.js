const gql =
  require("graphql-tag");

const SharedType = gql`
  type MutationResult {
    success: Boolean
    message: String
  }
`;

module.exports = SharedType;
