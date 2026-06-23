const gql =
  require("graphql-tag");

const ProductType = gql`
  type Product {
    id: Int
    name: String
    description: String
    price: Float
    stock: Int
    sku: String
    category: String
    image: String
    is_active: Boolean
    created_at: String
    updated_at: String
  }
`;

module.exports = ProductType;
