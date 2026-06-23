const { Worker } = require("bullmq");
const emailService = require("../services/email.service");
const { createBullConnection } = require("../config/redis.bull.config");

const worker = new Worker(
  "emailQueue",
  async (job) => {
    const data = job.data;
    switch (job.name) {
      case "WELCOME":
        await emailService.sendWelcomeEmail(data);
        break;
      case "ORDER_CREATED":
        await emailService.sendOrderCreatedEmail(data);
        break;
      case "PAYMENT_SUCCESS":
        await emailService.sendPaymentSuccessEmail(data);
        break;
      case "REFUND_PROCESSED":
        await emailService.sendRefundProcessedEmail(data);
        break;
      case "ORDER_SHIPPED":
        await emailService.sendOrderShippedEmail(data);
        break;
      case "ORDER_DELIVERED":
        await emailService.sendOrderDeliveredEmail(data);
        break;
      case "ORDER_CANCELLED":
        await emailService.sendOrderCancelledEmail(data);
        break;
      case "REWARD_EARNED":
        await emailService.sendRewardEarnedEmail(data);
        break;
      default:
        console.log(`Unknown email job: ${job.name}`);
    }
  },
  {
    connection: createBullConnection(),
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 }
  }
);

worker.on("completed", (job) => {
  console.log(`Email Job ${job.id} (${job.name}) completed`);
});

worker.on("failed", (job, err) => {
  console.error(`Email Job ${job.id} (${job.name}) failed`, err);
});

module.exports = worker;
