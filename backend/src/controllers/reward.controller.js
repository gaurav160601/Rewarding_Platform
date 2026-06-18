const rewardService =
require("../services/reward.service");

class RewardController {

  async getBalance(
    req,
    res,
    next
  ) {

    try {

      const result =
        await rewardService.getBalance(
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

  async redeemPoints(
    req,
    res,
    next
  ) {

    try {

      const result =
        await rewardService
          .redeemPoints(
            req.user.id,
            req.body.points
          );

      return res.status(200).json({
        success: true,
        data: result
      });

    } catch (error) {

      next(error);

    }
  }

  async getHistory(
    req,
    res,
    next
  ) {

    try {

      const result =
        await rewardService.getHistory(
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

}

module.exports =
new RewardController();