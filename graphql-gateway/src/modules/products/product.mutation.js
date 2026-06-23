const gql =
  require("graphql-tag");

const ProductMutation = gql`
  extend type Mutation {
    createProduct(
      name: String!
      price: Float!
      stock: Int!
      description: String
      sku: String
    ): Product

    updateProduct(
      id: Int!
      name: String
      price: Float
      stock: Int
      description: String
      sku: String
    ): Product

    deleteProduct(id: Int!): MutationResult
  }
`;

module.exports = ProductMutation;
