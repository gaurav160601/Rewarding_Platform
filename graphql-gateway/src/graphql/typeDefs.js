const gql =
  require("graphql-tag");

const SharedType =
  require("./shared.type");

const ProductType =
  require("../modules/products/product.type");

const ProductQuery =
  require("../modules/products/product.query");

const ProductMutation =
  require("../modules/products/product.mutation");

const OrderType =
  require("../modules/orders/order.type");

const OrderQuery =
  require("../modules/orders/order.query");

const OrderMutation =
  require("../modules/orders/order.mutation");

const RewardType =
  require("../modules/rewards/reward.type");

const RewardQuery =
  require("../modules/rewards/reward.query");

const RewardMutation =
  require("../modules/rewards/reward.mutation");

const UserType =
  require("../modules/users/user.type");

const UserQuery =
  require("../modules/users/user.query");

const AnalyticsType =
  require("../modules/analytics/analytics.type");

const AnalyticsQuery =
  require("../modules/analytics/analytics.query");

const typeDefs = gql`
  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }

  ${SharedType}
  ${ProductType}
  ${ProductQuery}
  ${ProductMutation}
  ${OrderType}
  ${OrderQuery}
  ${OrderMutation}
  ${RewardType}
  ${RewardQuery}
  ${RewardMutation}
  ${UserType}
  ${UserQuery}
  ${AnalyticsType}
  ${AnalyticsQuery}
`;

module.exports = typeDefs;
