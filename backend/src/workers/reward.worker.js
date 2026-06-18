const { Worker } =
require("bullmq");

const rewardService =
require("../services/reward.service");

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

    await rewardService.earnPoints(
      userId,
      orderId,
      amount
    );
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
