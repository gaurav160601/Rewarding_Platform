const router = require("express").Router();

const authRoutes = require("./auth.routes");
const healthRoutes = require("./health.routes");

const productRoutes = require("./product.routes");

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/products", productRoutes);


module.exports = router;