const gql =
  require("graphql-tag");

const ProductQuery = gql`
  extend type Query {
    products: [Product]
    product(id: Int!): Product
  }
`;

module.exports = ProductQuery;
