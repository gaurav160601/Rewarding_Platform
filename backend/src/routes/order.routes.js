const express =
require("express");

const router =
express.Router();

const orderController =
require("../controllers/order.controller");

const authMiddleware =
require("../middleware/auth.middleware");

router.post(
  "/checkout",
  authMiddleware,
  orderController.checkout
);

router.get(
  "/",
  authMiddleware,
  orderController.getMyOrders
);

router.get(
  "/:id",
  authMiddleware,
  orderController.getOrder
);

router.put(
  "/:id/cancel",
  authMiddleware,
  orderController.cancelOrder
);

module.exports = router;
