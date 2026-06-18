const express =
require("express");

const router =
express.Router();

const rewardController =
require("../controllers/reward.controller");

const authMiddleware =
require("../middleware/auth.middleware");

router.post(
  "/redeem",
  authMiddleware,
  rewardController.redeemPoints
);

router.get(
  "/balance",
  authMiddleware,
  rewardController.getBalance
);

router.get(
  "/history",
  authMiddleware,
  rewardController.getHistory
);

module.exports = router;