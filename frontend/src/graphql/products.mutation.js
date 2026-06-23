const CREATE_PRODUCT = `
  mutation CreateProduct(
    $name: String!
    $price: Float!
    $stock: Int!
    $description: String
    $sku: String
  ) {
    createProduct(
      name: $name
      price: $price
      stock: $stock
      description: $description
      sku: $sku
    ) {
      id
      name
    }
  }
`;

const UPDATE_PRODUCT = `
  mutation UpdateProduct(
    $id: Int!
    $name: String
    $price: Float
    $stock: Int
    $description: String
    $sku: String
  ) {
    updateProduct(
      id: $id
      name: $name
      price: $price
      stock: $stock
      description: $description
      sku: $sku
    ) {
      id
      name
      price
      stock
    }
  }
`;

const DELETE_PRODUCT = `
  mutation DeleteProduct($id: Int!) {
    deleteProduct(id: $id) {
      success
    }
  }
`;

export {
  CREATE_PRODUCT,
  UPDATE_PRODUCT,
  DELETE_PRODUCT,
};
