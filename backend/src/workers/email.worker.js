const { Worker } =
require("bullmq");

const emailService =
require("../services/email.service");

const redisClient =
require("../config/redis.config");

const worker =
new Worker(

  "emailQueue",

  async (job) => {

    const {
      email,
      orderId,
      points,
      balance
    } = job.data;

    switch (job.name) {

      case "ORDER_SHIPPED":

        await emailService
          .sendOrderShippedEmail({
            email,
            orderId
          });

        break;

      case "ORDER_DELIVERED":

        await emailService
          .sendOrderDeliveredEmail({
            email,
            orderId
          });

        break;

      case "ORDER_CANCELLED":

        await emailService
          .sendOrderCancelledEmail({
            email,
            orderId
          });

        break;

      case "REWARD_EARNED":

        await emailService
          .sendRewardEarnedEmail({
            email,
            points,
            balance
          });

        break;

      default:

        console.log(
          `Unknown email job: ${job.name}`
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
      `Email Job ${job.id} (${job.name}) completed`
    );
  }
);

worker.on(
  "failed",
  (job, err) => {

    console.error(
      `Email Job ${job.id} (${job.name}) failed`,
      err
    );
  }
);

module.exports =
worker;
