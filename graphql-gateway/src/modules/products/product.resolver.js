const productService =
  require("../../services/product.service");

const productResolver = {
  Query: {
    products:
      async (
        _,
        __,
        { token }
      ) => {
        return productService.getAll(
          token
        );
      },

    product:
      async (
        _,
        { id },
        { token }
      ) => {
        return productService.getById(
          id,
          token
        );
      },
  },

  Mutation: {
    createProduct:
      async (
        _,
        input,
        { token }
      ) => {
        return productService.create(
          input,
          token
        );
      },

    updateProduct:
      async (
        _,
        { id, ...input },
        { token }
      ) => {
        await productService.update(
          id,
          input,
          token
        );

        return productService
          .getById(id, token);
      },

    deleteProduct:
      async (
        _,
        { id },
        { token }
      ) => {
        const result =
          await productService.delete(
            id,
            token
          );

        return {
          success:
            result.success ||
            true,
        };
      },
  },
};

module.exports = productResolver;
