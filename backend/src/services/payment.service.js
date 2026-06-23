const stripe =
require("../config/stripe.config");

const paymentRepository =
require("../repositories/payment.repository");

const orderRepository =
require("../repositories/order.repository");

const productRepository =
require("../repositories/product.repository");

const rewardQueue =
require("../queues/reward.queue");

const emailQueue =
require("../queues/email.queue");

const userRepository =
require("../repositories/user.repository");

const MIN_PAYMENT_AMOUNT = 50;

const PAYMENT_STATUS =
require("../constants/paymentStatus");

const ORDER_STATUS =
require("../constants/orderStatus");

class PaymentService {

  async getPaymentHistory(userId) {

    const payments =
      await paymentRepository.findByUserId(
        userId
      );

    return payments;
  }

  async createSession(
    orderId,
    userId
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

    const finalAmount =
      Number(order.total_amount) -
      Number(
        order.discount_amount || 0
      );

    const paymentAmount =
      finalAmount > 0
        ? finalAmount
        : 0;

    if (paymentAmount > 0 && paymentAmount < MIN_PAYMENT_AMOUNT) {
      throw new Error(
        `Minimum payable amount after rewards redemption must be ₹${MIN_PAYMENT_AMOUNT}.`
      );
    }

    if (paymentAmount <= 0) {

      await orderRepository.updateOrderStatus(
        order.id,
        ORDER_STATUS.PAID,
        null,
        "paid_at"
      );

      await rewardQueue.add(
        "earnReward",
        {
          userId,
          orderId: order.id,
          amount: 0
        },
        {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 2000
          }
        }
      );

      return {
        paymentId: null,
        sessionId: null,
        checkoutUrl: null,
        message:
          "Order paid with points. No payment needed."
      };
    }

    const paymentId =
      await paymentRepository.createPayment(
        order.id,
        userId,
        paymentAmount,
        "STRIPE"
      );

    const session =
      await stripe.checkout.sessions.create({

        payment_method_types: [
          "card"
        ],

        mode: "payment",

        line_items: [
          {
            price_data: {
              currency: "inr",

              product_data: {
                name:
                  `Order #${order.id}`
              },

              unit_amount:
                Math.round(
                  Number(paymentAmount) * 100
                )
            },

            quantity: 1
          }
        ],

        success_url:
          `${process.env.CLIENT_URL || "http://localhost:5173"}/payment-success`,

        cancel_url:
          `${process.env.CLIENT_URL || "http://localhost:5173"}/payment-cancel`,

        metadata: {
          orderId:
            String(order.id),

          paymentId:
            String(paymentId)
        }
      });

    await paymentRepository.updateProviderDetails(
      paymentId,
      session.id
    );

    return {
      paymentId,
      sessionId:
        session.id,

      checkoutUrl:
        session.url
    };
  }

  async retryPayment(
    orderId,
    userId
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
      Number(order.user_id) !==
      Number(userId)
    ) {
      throw new Error(
        "Order does not belong to this user"
      );
    }

    if (
      order.status !==
      "PAYMENT_PENDING"
    ) {
      throw new Error(
        "Only PAYMENT_PENDING orders can be retried"
      );
    }

    if (
      order.payment_expires_at &&
      new Date() >
        new Date(
          order.payment_expires_at
        )
    ) {

      await orderRepository.updateOrderStatus(
        orderId,
        ORDER_STATUS.PAYMENT_EXPIRED
      );

      throw new Error(
        "Payment session expired. Please place a new order."
      );
    }

    const orderItems =
      await orderRepository.getOrderItems(
        orderId
      );

    for (
      const item of orderItems
    ) {

      const product =
        await productRepository.getProductById(
          item.product_id
        );

      if (
        !product ||
        !product.is_active ||
        item.quantity >
          product.stock
      ) {

        await orderRepository.updateOrderStatus(
          orderId,
          ORDER_STATUS.PAYMENT_EXPIRED
        );

        throw new Error(
          "One or more items are no longer available."
        );
      }
    }

    return this.createSession(
      orderId,
      userId
    );
  }

  async handleWebhook(
    payload,
    signature
  ) {

    const event =
      stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );

    switch (event.type) {

      case
        "checkout.session.completed":

        await this.handleCheckoutCompleted(
          event.data.object
        );

        break;

      default:

        console.log(
          `Unhandled event: ${event.type}`
        );
    }

    return {
      received: true
    };
  }

  async handleCheckoutCompleted(
    session
  ) {

    const payment =
      await paymentRepository.findBySessionId(
        session.id
      );

    if (!payment) {
      return;
    }

    if (
      payment.status ===
      PAYMENT_STATUS.SUCCESS
    ) {
      return;
    }

    const order =
      await orderRepository.getOrderById(
        payment.order_id
      );

    if (
      order &&
      order.status ===
        ORDER_STATUS.PAID
    ) {
      return;
    }

    await paymentRepository.updateStatus(
      payment.id,
      PAYMENT_STATUS.SUCCESS
    );

    await orderRepository.updateOrderStatus(
      payment.order_id,
      ORDER_STATUS.PAID,
      null,
      "paid_at"
    );

    const earnedPoints =
      Math.floor(
        Number(payment.amount) / 10
      );

    const payer =
      await userRepository.findById(
        payment.user_id
      );

    await emailQueue.add(
      "PAYMENT_SUCCESS",
      {
        email: payer.email,
        orderId: payment.order_id,
        amount: payment.amount,
        earnedPoints
      },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000
        }
      }
    );

    await rewardQueue.add(
      "earnReward",
      {
        userId:
          payment.user_id,

        orderId:
          payment.order_id,

        amount:
          Number(
            payment.amount
          )
      },

      {
        attempts: 3,

        backoff: {
          type: "exponential",
          delay: 2000
        }
      }
    );

    console.log(
      "Reward Job Queued"
    );
  }

}

module.exports =
new PaymentService();
