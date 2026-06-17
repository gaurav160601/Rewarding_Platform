const { pool } =
require("../database/mysql");

const orderRepository =
require("../repositories/order.repository");

const cartRepository =
require("../repositories/cart.repository");

const productRepository =
require("../repositories/product.repository");

const {
  ADMIN
} = require("../constants/roles");

class OrderService {

  async checkout(userId) {

    const connection =
      await pool.getConnection();

    try {

      await connection.beginTransaction();

      const cart =
        await cartRepository.findCartByUserId(
          userId
        );

      if (!cart) {
        throw new Error(
          "Cart not found"
        );
      }

      const cartItems =
        await cartRepository.getCartItems(
          cart.id
        );

      if (
        !cartItems ||
        cartItems.length === 0
      ) {
        throw new Error(
          "Cart is empty"
        );
      }

      let totalAmount = 0;

      for (
        const item of cartItems
      ) {

        const product =
          await productRepository.findByIdForUpdate(
            item.product_id,
            connection
          );

        if (!product) {
          throw new Error(
            `${item.name} not found`
          );
        }

        if (
          product.status !== "ACTIVE"
        ) {
          throw new Error(
            `${item.name} is not available`
          );
        }

        if (
          item.quantity > product.stock
        ) {
          throw new Error(
            `${item.name} stock unavailable`
          );
        }

        totalAmount +=
          Number(product.price) *
          item.quantity;
      }

      const orderId =
        await orderRepository.createOrder(
          userId,
          totalAmount,
          connection
        );

      for (
        const item of cartItems
      ) {

        const product =
          await productRepository.findByIdForUpdate(
            item.product_id,
            connection
          );

        const subtotal =
          Number(product.price) *
          item.quantity;

        await orderRepository.createOrderItem(
          orderId,
          {
            productId:
              item.product_id,

            name:
              product.name,

            price:
              product.price,

            quantity:
              item.quantity,

            subtotal
          },
          connection
        );

        await productRepository.updateStock(
          item.product_id,
          item.quantity,
          connection
        );
      }

      await cartRepository.clearCartInTransaction(
        cart.id,
        connection
      );

      await connection.commit();

      return {
        orderId,
        totalAmount,
        message:
          "Order placed successfully"
      };

    } catch (error) {

      await connection.rollback();

      throw error;

    } finally {

      connection.release();

    }
  }

  async getMyOrders(
    userId
  ) {

    return orderRepository.getOrdersByUserId(
      userId
    );

  }

  async getOrder(
    orderId,
    user
  ) {

    let order;

    if (user.role === ADMIN) {

      order =
        await orderRepository.getOrderById(
          orderId
        );

    } else {

      order =
        await orderRepository.getOrderByIdAndUserId(
          orderId,
          user.id
        );
    }

    if (!order) {
      throw new Error(
        "Order not found"
      );
    }

    return order;
  }

  async cancelOrder(
    orderId,
    user
  ) {

    const connection =
      await pool.getConnection();

    try {

      await connection.beginTransaction();

      let order;

      if (user.role === ADMIN) {

        order =
          await orderRepository.getOrderById(
            orderId
          );

      } else {

        order =
          await orderRepository.getOrderByIdAndUserId(
            orderId,
            user.id
          );
      }

      if (!order) {
        throw new Error(
          "Order not found"
        );
      }

      if (
        order.status !== "PENDING"
      ) {
        throw new Error(
          "Only pending orders can be cancelled"
        );
      }

      const orderItems =
        await orderRepository.getOrderItems(
          orderId
        );

      for (
        const item of orderItems
      ) {

        await productRepository.restoreStock(
          item.product_id,
          item.quantity,
          connection
        );
      }

      await orderRepository.updateOrderStatus(
        orderId,
        "CANCELLED",
        connection
      );

      await connection.commit();

      return {
        message:
          "Order cancelled successfully"
      };

    } catch (error) {

      await connection.rollback();

      throw error;

    } finally {

      connection.release();

    }
  }
}

module.exports =
new OrderService();
