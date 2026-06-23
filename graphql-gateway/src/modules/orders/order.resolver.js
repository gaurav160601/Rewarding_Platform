const orderService =
  require("../../services/order.service");

const orderResolver = {
  Query: {
    orders:
      async (
        _,
        __,
        { token }
      ) => {

        console.log(
          "[orders resolver] token present:",
          !!token,
          "length:",
          token?.length
        );

        return orderService.getAll(
          token
        );
      },

    order:
      async (
        _,
        { id },
        { token }
      ) => {
        return orderService.getById(
          id,
          token
        );
      },
  },

  Mutation: {
    cancelOrder:
      async (
        _,
        { orderId },
        { token }
      ) => {
        const result =
          await orderService.cancel(
            orderId,
            token
          );

        return {
          success:
            result.success,
          message:
            result.message ||
            "Order cancelled",
        };
      },
  },
};

module.exports = orderResolver;
