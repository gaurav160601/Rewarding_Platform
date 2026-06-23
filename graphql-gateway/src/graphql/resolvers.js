const { GraphQLJSON } =
  require("graphql-type-json");

const productResolver =
  require("../modules/products/product.resolver");

const orderResolver =
  require("../modules/orders/order.resolver");

const rewardResolver =
  require("../modules/rewards/reward.resolver");

const userResolver =
  require("../modules/users/user.resolver");

const analyticsResolver =
  require("../modules/analytics/analytics.resolver");

const resolvers = {
  JSON: GraphQLJSON,
};

const modules = [
  productResolver,
  orderResolver,
  rewardResolver,
  userResolver,
  analyticsResolver,
];

for (const mod of modules) {
  for (const key of Object.keys(mod)) {
    if (!resolvers[key]) {
      resolvers[key] = {};
    }
    Object.assign(
      resolvers[key],
      mod[key]
    );
  }
}

module.exports = resolvers;
