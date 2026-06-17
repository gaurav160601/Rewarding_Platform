const productRepository = require("../repositories/product.repository");

const validateProduct = require("../validators/product.validator");

class ProductService {

  async create(data) {

    const productId =
      await productRepository.createProduct(
        data
      );

    return {
      productId
    };
  }

  async getById(id) {

    console.log("Service getById id:", id);

    const product =
      await productRepository.getProductById(
        id
      );

    if (!product) {
      throw new Error(
        "Product not found"
      );
    }

    return product;
  }

  async getAll(page = 1) {

    const currentPage =
      Number.isInteger(page) && page > 0
        ? page
        : 1;

    const limit = 10;

    const offset =
      (currentPage - 1) * limit;

    return productRepository.getProducts(
      limit,
      offset
    );
  }

  async search(keyword) {

    return productRepository.search(
      keyword
    );
  }

  async update(id, data) {

  const errors =
    validateProduct(data);

  if (errors.length) {
    throw new Error(
      errors.join(", ")
    );
  }

  const updated =
    await productRepository.update(
      id,
      data
    );

  if (!updated) {
    throw new Error(
      "Product not found"
    );
  }

  return {
    message:
      "Product updated successfully"
  };
}


async delete(id) {

  const deleted =
    await productRepository.delete(
      id
    );

  if (!deleted) {
    throw new Error(
      "Product not found"
    );
  }

  return {
    message:
      "Product deleted successfully"
  };
}


}

module.exports =
new ProductService();
