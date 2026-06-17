const express =
require("express");

const router =
express.Router();

const cartController =
require("../controllers/cart.controller");

const authMiddleware =
require("../middleware/auth.middleware");

router.post(
  "/items",
  authMiddleware,
  cartController.addItem
);

router.get(
  "/",
  authMiddleware,
  cartController.getCart
);

router.put(
  "/items/:productId",
  authMiddleware,
  cartController.updateItem
);

router.delete(
  "/items/:productId",
  authMiddleware,
  cartController.removeItem
);

router.delete(
  "/",
  authMiddleware,
  cartController.clearCart
);

module.exports =
router;