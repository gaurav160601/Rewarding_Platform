const express =
require("express");

const router =
express.Router();

const orderController =
require("../controllers/order.controller");

const authMiddleware =
require("../middleware/auth.middleware");

const authorize =
require("../middleware/role.middleware");

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
  "/:id/process",
  authMiddleware,
  authorize("ADMIN"),
  orderController.processOrder
);

router.put(
  "/:id/ship",
  authMiddleware,
  authorize("ADMIN"),
  orderController.shipOrder
);

router.put(
  "/:id/deliver",
  authMiddleware,
  authorize("ADMIN"),
  orderController.deliverOrder
);

router.put(
  "/:id/cancel",
  authMiddleware,
  orderController.cancelOrder
);

module.exports = router;
