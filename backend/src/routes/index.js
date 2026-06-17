const router = require("express").Router();

const authRoutes = require("./auth.routes");
const healthRoutes = require("./health.routes");

const productRoutes = require("./product.routes");

const cartRoutes =require("./cart.routes");

const orderRoutes = require("./order.routes");

const paymentRoutes =
require("./payment.routes");

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);
router.use(
  "/payments",
  paymentRoutes
);


module.exports = router;