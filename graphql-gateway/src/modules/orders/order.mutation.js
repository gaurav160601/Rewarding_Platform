const gql =
  require("graphql-tag");

const OrderMutation = gql`
  extend type Mutation {
    cancelOrder(orderId: Int!): MutationResult
  }
`;

module.exports = OrderMutation;
