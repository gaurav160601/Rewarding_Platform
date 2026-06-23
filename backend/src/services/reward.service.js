const rewardRepository =
require("../repositories/reward.repository");

const RewardTransaction =
require("../models/rewardTransaction.model");

class RewardService {

  calculatePoints(
    amount
  ) {

    return Math.floor(
      Number(amount) / 10
    );
  }

  async earnPoints(
    userId,
    orderId,
    orderAmount
  ) {

    const points =
      this.calculatePoints(
        orderAmount
      );

    if (points <= 0) {
      return null;
    }

    const existing =
      await RewardTransaction.findOne({
        orderId,
        type: "EARN"
      });

    if (existing) {
      return existing;
    }

    await rewardRepository.updateUserPoints(
      userId,
      points
    );

    await rewardRepository.createTransaction({
      userId,
      orderId,
      points,
      type: "EARN",
      description:
        `Earned ${points} points from Order #${orderId}`
    });

    return {
      points
    };
  }

  async redeemPoints(
    userId,
    points
  ) {

    const user =
      await rewardRepository
        .getUserRewardBalance(
          userId
        );

    if (
      user.reward_points <
      points
    ) {

      throw new Error(
        "Insufficient reward points"
      );
    }

    await rewardRepository
      .deductUserPoints(
        userId,
        points
      );

    await rewardRepository
      .createTransaction({
        userId,
        points,
        type: "REDEEM",
        description:
          `Redeemed ${points} points`
      });

    const updated =
      await rewardRepository
        .getUserRewardBalance(
          userId
        );

    return updated;
  }

  async getBalance(
    userId
  ) {

    return rewardRepository.getUserPoints(
      userId
    );
  }

  async getHistory(
    userId
  ) {

    return rewardRepository.getRewardHistory(
      userId
    );
  }

}

module.exports =
new RewardService();