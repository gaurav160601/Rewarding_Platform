const gql =
  require("graphql-tag");

const RewardQuery = gql`
  extend type Query {
    rewardBalance: RewardBalance
    rewardHistory: [RewardTransaction]
  }
`;

module.exports = RewardQuery;
