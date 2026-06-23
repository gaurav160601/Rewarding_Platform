const express =
require("express");

const router =
express.Router();

const paymentController =
require("../controllers/payment.controller");

const authMiddleware =
require("../middleware/auth.middleware");

router.get(
  "/history",
  authMiddleware,
  paymentController.getPaymentHistory
);

router.post(
  "/create-session",
  authMiddleware,
  paymentController.createSession
);

router.post(
  "/retry/:orderId",
  authMiddleware,
  paymentController.retryPayment
);

router.post(
  "/webhook",
  paymentController.webhook
);

module.exports =
router;
