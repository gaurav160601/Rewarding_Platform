const { Worker } =
require("bullmq");

const rewardService =
require("../services/reward.service");

const userRepository =
require("../repositories/user.repository");

const rewardRepository =
require("../repositories/reward.repository");

const emailQueue =
require("../queues/email.queue");

const redisClient =
require("../config/redis.config");

const worker =
new Worker(

  "rewardQueue",

  async (job) => {

    const {
      userId,
      orderId,
      amount
    } = job.data;

    const result =
      await rewardService.earnPoints(
        userId,
        orderId,
        amount
      );

    if (result && result.points > 0) {

      const user =
        await userRepository.findById(
          userId
        );

      const balanceData =
        await rewardRepository.getUserPoints(
          userId
        );

      await emailQueue.add(
        "REWARD_EARNED",
        {
          email: user.email,
          points:
            result.points,
          balance:
            balanceData.reward_points
        },
        {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 5000
          }
        }
      );
    }
  },

  {
    connection:
      redisClient
  }

);

worker.on(
  "completed",
  (job) => {

    console.log(
      `Reward Job ${job.id} completed`
    );

  }
);

worker.on(
  "failed",
  (job, err) => {

    console.error(
      `Reward Job ${job.id} failed`,
      err
    );

  }
);

module.exports =
worker;
