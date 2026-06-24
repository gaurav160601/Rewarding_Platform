const paymentService =
require("../services/payment.service");

class PaymentController {

  async getPaymentHistory(
    req,
    res,
    next
  ) {

    try {

      const payments =
        await paymentService.getPaymentHistory(
          req.user.id
        );

      return res.status(200).json({
        success: true,
        data: payments
      });

    } catch (error) {

      next(error);

    }
  }

  async createSession(
    req,
    res,
    next
  ) {

    try {

      const result =
        await paymentService.createSession(
          req.body.orderId,
          req.user.id
        );

      return res.status(201).json({
        success: true,
        data: result
      });

    } catch (error) {

      next(error);

    }
  }

  async retryPayment(
    req,
    res,
    next
  ) {

    try {

      const result =
        await paymentService.retryPayment(
          req.params.orderId,
          req.user.id
        );

      return res.status(200).json({
        success: true,
        data: result
      });

    } catch (error) {

      next(error);

    }
  }

  async webhook(
    req,
    res,
    next
  ) {

    try {

      const signature =
        req.headers[
          "stripe-signature"
        ];

      await paymentService.handleWebhook(
        req.rawBody || req.body,
        signature
      );

      return res.status(200).json({
        received: true
      });

    } catch (error) {

      if (req.log) {
        req.log.error({ type: "PAYMENT_ERROR", error: error.message, route: "/api/payments/webhook" }, "Webhook error");
      }

      return res.status(400).json({
        message:
          error.message
      });
    }
  }

}

module.exports =
new PaymentController();
