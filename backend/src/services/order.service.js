const { pool } =
require("../database/mysql");

const redisClient =
require("../config/redis.config");

const orderRepository =
require("../repositories/order.repository");

const paymentRepository =
require("../repositories/payment.repository");

const cartRepository =
require("../repositories/cart.repository");

const productRepository =
require("../repositories/product.repository");

const rewardRepository =
require("../repositories/reward.repository");

const RewardTransaction =
require("../models/rewardTransaction.model");

const rewardService =
require("../services/reward.service");

const userRepository =
require("../repositories/user.repository");

const emailQueue =
require("../queues/email.queue");

const { sendMessage } = require("../producers/order.producer");
const TOPICS = require("../topics/kafka.topics");

const ORDER_STATUS =
require("../constants/orderStatus");

const {
  ADMIN
} = require("../constants/roles");

async function clearProductCache() {
  try {
    const keys = await redisClient.keys("products:*");
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (err) {
    console.error("Cache clear error:", err.message);
  }
}

class OrderService {

  async checkout(
    userId,
    redeemPoints = 0
  ) {

    const existingOrders =
      await orderRepository.getOrdersByUserId(
        userId
      );

    const activeOrder =
      existingOrders.find(
        (o) =>
          o.status ===
            "PAYMENT_PENDING" &&
          o.payment_expires_at &&
          new Date() <
            new Date(
              o.payment_expires_at
            )
      );

    if (activeOrder) {
      return {
        orderId:
          activeOrder.id,
        totalAmount:
          Number(
            activeOrder.total_amount
          ),
        discountAmount:
          Number(
            activeOrder.discount_amount || 0
          ),
        finalAmount:
          Number(
            activeOrder.total_amount
          ) -
          Number(
            activeOrder.discount_amount || 0
          ),
        message:
          "Existing pending order found"
      };
    }

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
          !product.is_active
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

      const discountAmount =
        Math.min(
          redeemPoints,
          totalAmount
        );

      const finalAmount =
        totalAmount - discountAmount;

      if (finalAmount > 0 && finalAmount < 50) {
        throw new Error(
          "Minimum payable amount after rewards redemption must be ₹50."
        );
      }

      if (redeemPoints > 0) {

        const user =
          await rewardRepository
            .getUserRewardBalance(
              userId
            );

        if (
          user.reward_points <
          redeemPoints
        ) {
          throw new Error(
            "Insufficient reward points"
          );
        }
      }

      const paymentExpiresAt =
        new Date(
          Date.now() +
          5 * 60 * 1000
        );

      const orderId =
        await orderRepository.createOrder(
          userId,
          totalAmount,
          connection,
          redeemPoints,
          discountAmount,
          paymentExpiresAt
        );

      if (redeemPoints > 0) {

        await rewardRepository
          .deductUserPoints(
            userId,
            redeemPoints
          );

        await rewardRepository
          .createTransaction({
            userId,
            points:
              -Math.floor(redeemPoints),
            type: "REDEEM",
            description:
              `Redeemed ${redeemPoints} points for Order #${orderId}`
          });
      }

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

      await clearProductCache();

      const orderUser =
        await userRepository.findById(
          userId
        );

      await emailQueue.add(
        "ORDER_CREATED",
        {
          email: orderUser.email,
          orderId,
          totalAmount,
          redeemedPoints: redeemPoints,
          finalAmount:
            finalAmount > 0
              ? finalAmount
              : 0
        },
        {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 5000
          }
        }
      );

      sendMessage(TOPICS.ORDER_CREATED, {
        email: orderUser.email,
        orderId,
        userId,
        totalAmount,
        redeemedPoints: redeemPoints || 0,
        finalAmount: finalAmount > 0 ? finalAmount : 0
      });

      return {
        orderId,
        totalAmount,
        discountAmount,
        finalAmount:
          finalAmount > 0
            ? finalAmount
            : 0,
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

  async expireIfStale(
    order
  ) {

    if (
      order.status ===
        "PAYMENT_PENDING" &&
      order.payment_expires_at &&
      new Date() >
        new Date(
          order.payment_expires_at
        )
    ) {

      const items =
        await orderRepository.getOrderItems(
          order.id
        );

      for (
        const item of items
      ) {

        await productRepository.restoreStock(
          item.product_id,
          item.quantity
        );
      }

      if (order.points_redeemed > 0) {

        await rewardRepository.updateUserPoints(
          order.user_id,
          order.points_redeemed
        );

        await rewardRepository.createTransaction({
          userId: order.user_id,
          points: order.points_redeemed,
          type: "REFUND_REDEEMED",
          description: `Refunded ${order.points_redeemed} redeemed points for expired Order #${order.id}`
        });
      }

      await orderRepository.updateOrderStatus(
        order.id,
        ORDER_STATUS.PAYMENT_EXPIRED
      );

      order.status =
        ORDER_STATUS.PAYMENT_EXPIRED;

      await clearProductCache();
    }

    return order;
  }

  async getMyOrders(
    userId,
    userRole
  ) {

    if (
      userRole === ADMIN
    ) {
      return orderRepository
        .getAllOrders();
    }

    const orders =
      await orderRepository.getOrdersByUserId(
        userId
      );

    for (
      const order of orders
    ) {
      await this.expireIfStale(
        order
      );
    }

    return orders;
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

    await this.expireIfStale(
      order
    );

    const items =
      await orderRepository.getOrderItems(
        orderId
      );

    order.items = items;

    return order;
  }

  async processOrder(
    orderId
  ) {

    const order =
      await orderRepository.getOrderById(
        orderId
      );

    if (!order) {
      throw new Error(
        "Order not found"
      );
    }

    if (
      order.status !==
      ORDER_STATUS.PAID
    ) {

      throw new Error(
        "Only paid orders can be processed"
      );
    }

    await orderRepository.updateOrderStatus(
      orderId,
      ORDER_STATUS.PROCESSING,
      null,
      "processed_at"
    );

    return orderRepository.getOrderById(
      orderId
    );
  }

  async shipOrder(
    orderId
  ) {

    const order =
      await orderRepository.getOrderById(
        orderId
      );

    if (!order) {
      throw new Error(
        "Order not found"
      );
    }

    if (
      order.status !==
      ORDER_STATUS.PROCESSING
    ) {

      throw new Error(
        "Only processing orders can be shipped"
      );
    }

    await orderRepository.updateOrderStatus(
      orderId,
      ORDER_STATUS.SHIPPED,
      null,
      "shipped_at"
    );

    const user =
      await userRepository.findById(
        order.user_id
      );

    await emailQueue.add(
      "ORDER_SHIPPED",
      {
        email: user.email,
        orderId
      },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000
        }
      }
    );

    sendMessage(TOPICS.ORDER_SHIPPED, {
      email: user.email,
      orderId
    });

    return orderRepository.getOrderById(
      orderId
    );
  }

  async deliverOrder(
    orderId
  ) {

    const order =
      await orderRepository.getOrderById(
        orderId
      );

    if (!order) {
      throw new Error(
        "Order not found"
      );
    }

    if (
      order.status !==
      ORDER_STATUS.SHIPPED
    ) {

      throw new Error(
        "Only shipped orders can be delivered"
      );
    }

    await orderRepository.updateOrderStatus(
      orderId,
      ORDER_STATUS.DELIVERED,
      null,
      "delivered_at"
    );

    const user =
      await userRepository.findById(
        order.user_id
      );

    await emailQueue.add(
      "ORDER_DELIVERED",
      {
        email: user.email,
        orderId
      },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000
        }
      }
    );

    sendMessage(TOPICS.ORDER_DELIVERED, {
      email: user.email,
      orderId
    });

    return orderRepository.getOrderById(
      orderId
    );
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

      const cancelable = [
        ORDER_STATUS.PAYMENT_PENDING,
        ORDER_STATUS.PAID,
        ORDER_STATUS.PROCESSING
      ];

      if (!cancelable.includes(order.status)) {
        throw new Error(
          "Order can no longer be cancelled."
        );
      }

      const previousStatus = order.status;

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
        ORDER_STATUS.CANCELLED,
        connection,
        "cancelled_at"
      );

      await connection.commit();

      await clearProductCache();

      const finalAmount =
        Number(order.total_amount) -
        Number(order.discount_amount || 0);

      if (order.points_redeemed > 0) {

        const existingRefund =
          await RewardTransaction.findOne({
            orderId: order.id,
            type: "REFUND_REDEEMED"
          });

        if (!existingRefund) {

          await rewardRepository.updateUserPoints(
            order.user_id,
            order.points_redeemed
          );

          await rewardRepository.createTransaction({
            userId: order.user_id,
            orderId: order.id,
            points: order.points_redeemed,
            type: "REFUND_REDEEMED",
            description: `Refunded ${order.points_redeemed} redeemed points for cancelled Order #${order.id}`
          });
        }
      }

      if (
        finalAmount > 0 &&
        previousStatus !== "PAYMENT_PENDING"
      ) {

        const existingReversal =
          await RewardTransaction.findOne({
            orderId: order.id,
            type: "REVERSE_EARN"
          });

        if (!existingReversal) {

          const earnTxn =
            await RewardTransaction.findOne({
              orderId: order.id,
              type: "EARN"
            });

          if (earnTxn) {

            await rewardRepository.updateUserPoints(
              order.user_id,
              -earnTxn.points
            );

            await rewardRepository.createTransaction({
              userId: order.user_id,
              orderId: order.id,
              points: -earnTxn.points,
              type: "REVERSE_EARN",
              description: `Reversed ${earnTxn.points} earned points for cancelled Order #${order.id}`
            });
          }
        }

        const refundTxnId =
          `REF_${order.id}_${Date.now()}`;

        await paymentRepository.createRefund(
          order.id,
          order.user_id,
          finalAmount,
          refundTxnId
        );
      }

      const orderUser =
        await userRepository.findById(
          order.user_id
        );

      const reversedPoints =
        previousStatus !== "PAYMENT_PENDING"
          ? Math.floor(finalAmount / 10)
          : 0;

      await emailQueue.add(
        "ORDER_CANCELLED",
        {
          email: orderUser.email,
          orderId,
          refundAmount:
            finalAmount > 0 &&
            previousStatus !== "PAYMENT_PENDING"
              ? finalAmount
              : null,
          refundStatus:
            finalAmount > 0 &&
            previousStatus !== "PAYMENT_PENDING"
              ? "COMPLETED"
              : null,
          returnedPoints:
            order.points_redeemed > 0
              ? order.points_redeemed
              : null,
          reversedPoints:
            reversedPoints > 0
              ? reversedPoints
              : null
        },
        {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 5000
          }
        }
      );

      const refundTxn = finalAmount > 0 &&
        previousStatus !== "PAYMENT_PENDING"
        ? refundTxnId || `REF_${order.id}_${Date.now()}`
        : null;

      if (refundTxn) {

        await emailQueue.add(
          "REFUND_PROCESSED",
          {
            email: orderUser.email,
            orderId,
            refundAmount: finalAmount,
            refundTransactionId: refundTxn
          },
          {
            attempts: 3,
            backoff: {
              type: "exponential",
              delay: 5000
            }
          }
        );
      }

      sendMessage(TOPICS.ORDER_CANCELLED, {
        email: orderUser.email,
        orderId,
        refundAmount:
          finalAmount > 0 &&
          previousStatus !== "PAYMENT_PENDING"
            ? finalAmount
            : null,
        returnedPoints:
          order.points_redeemed > 0
            ? order.points_redeemed
            : null,
        reversedPoints:
          reversedPoints > 0
            ? reversedPoints
            : null
      });

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
