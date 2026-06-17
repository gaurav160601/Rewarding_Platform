const router = require("express").Router();
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.get("/profile", authMiddleware, authController.profile);
router.post("/register", authController.register);
router.post("/login", authController.login);

module.exports = router;