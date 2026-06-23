const gql =
  require("graphql-tag");

const RewardType = gql`
  type RewardBalance {
    reward_points: Int
  }

  type RewardTransaction {
    id: ID
    userId: Int
    orderId: Int
    points: Int
    type: String
    description: String
    createdAt: String
  }

  type RewardHistory {
    transactions: [RewardTransaction]
  }
`;

module.exports = RewardType;
