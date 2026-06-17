const stripe =
require("../config/stripe.config");

const paymentRepository =
require("../repositories/payment.repository");

const orderRepository =
require("../repositories/order.repository");

const PAYMENT_STATUS =
require("../constants/paymentStatus");

const ORDER_STATUS =
require("../constants/orderStatus");

class PaymentService {

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

    const paymentId =
      await paymentRepository.createPayment(
        order.id,
        userId,
        order.total_amount,
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
                  Number(order.total_amount) * 100
                )
            },

            quantity: 1
          }
        ],

        success_url:
          "http://localhost:5000/payment-success",

        cancel_url:
          "http://localhost:5000/payment-cancel",

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

    await paymentRepository.updateStatus(
      payment.id,
      PAYMENT_STATUS.SUCCESS
    );

    await orderRepository.updateOrderStatus(
      payment.order_id,
      ORDER_STATUS.PAID
    );
  }

}

module.exports =
new PaymentService();
