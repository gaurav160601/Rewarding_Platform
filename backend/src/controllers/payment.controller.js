const paymentService =
require("../services/payment.service");

class PaymentController {

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

      console.error(error);

      return res.status(400).json({
        message:
          error.message
      });
    }
  }

}

module.exports =
new PaymentController();
