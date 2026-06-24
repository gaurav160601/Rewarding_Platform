const productRepository = require("../repositories/product.repository");

const validateProduct = require("../validators/product.validator");

const redisClient =
require("../config/redis.config");

const logger = require("../utils/logger");

const productLog = logger.child({ module: "product.service" });

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

      productLog.debug({ event: "REDIS_CACHE_DELETE", pattern: "products:*", count: keys.length }, "REDIS_CACHE_DELETE");
    }

    return {
      productId
    };
  }

  async getById(id) {

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

      productLog.debug({ event: "REDIS_CACHE_HIT", cacheKey }, "REDIS_CACHE_HIT");

      return JSON.parse(
        cachedData
      );
    }

    productLog.debug({ event: "REDIS_CACHE_MISS", cacheKey }, "REDIS_CACHE_MISS");

    const offset =
      (currentPage - 1) * limit;

    const result =
      await productRepository.getProducts(
        limit,
        offset
      );

    await redisClient.setex(
      cacheKey,
      300,
      JSON.stringify(result)
    );

    productLog.debug({ event: "REDIS_CACHE_SET", cacheKey, ttl: 300 }, "REDIS_CACHE_SET");

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

    productLog.debug({ event: "REDIS_CACHE_DELETE", pattern: "products:*", count: keys.length }, "REDIS_CACHE_DELETE");
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

    productLog.debug({ event: "REDIS_CACHE_DELETE", pattern: "products:*", count: keys.length }, "REDIS_CACHE_DELETE");
  }

  return {
    message:
      "Product deleted successfully"
  };
}


}

module.exports =
new ProductService();