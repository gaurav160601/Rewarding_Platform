const productRepository = require("../repositories/product.repository");

const validateProduct = require("../validators/product.validator");

const redisClient =
require("../config/redis.config");

class ProductService {

  async create(data) {

    const productId =
      await productRepository.createProduct(
        data
      );

    const keys =
      await redisClient.keys(
        "products:*"
      );

    if (keys.length > 0) {

      await redisClient.del(
        keys
      );

    }

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

    const cacheKey =
      `products:${currentPage}:${limit}`;

    const cachedData =
      await redisClient.get(
        cacheKey
      );

    if (cachedData) {

      console.log(
        "Redis Cache Hit"
      );

      return JSON.parse(
        cachedData
      );
    }

    console.log(
      "Redis Cache Miss"
    );

    const offset =
      (currentPage - 1) * limit;

    const result =
      await productRepository.getProducts(
        limit,
        offset
      );

    await redisClient.setEx(
      cacheKey,
      300,
      JSON.stringify(result)
    );

    return result;
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

  const keys =
    await redisClient.keys(
      "products:*"
    );

  if (keys.length > 0) {

    await redisClient.del(
      keys
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

  const keys =
    await redisClient.keys(
      "products:*"
    );

  if (keys.length > 0) {

    await redisClient.del(
      keys
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
