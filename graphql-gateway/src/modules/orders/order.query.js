const gql =
  require("graphql-tag");

const OrderQuery = gql`
  extend type Query {
    orders: [Order]
    order(id: Int!): Order
  }
`;

module.exports = OrderQuery;
