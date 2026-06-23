const rewardService =
  require("../../services/reward.service");

const rewardResolver = {
  Query: {
    rewardBalance:
      async (
        _,
        __,
        { token }
      ) => {
        return rewardService.getBalance(
          token
        );
      },

    rewardHistory:
      async (
        _,
        __,
        { token }
      ) => {
        return rewardService.getHistory(
          token
        );
      },
  },

  Mutation: {
    redeemPoints:
      async (
        _,
        { points },
        { token }
      ) => {
        const result =
          await rewardService.redeem(
            points,
            token
          );

        return {
          success: true,
          balance:
            result.reward_points,
        };
      },
  },
};

module.exports = rewardResolver;
