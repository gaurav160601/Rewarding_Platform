const gql =
  require("graphql-tag");

const RewardMutation = gql`
  extend type Mutation {
    redeemPoints(points: Int!): RedeemResult
  }

  type RedeemResult {
    success: Boolean
    balance: Int
  }
`;

module.exports = RewardMutation;
