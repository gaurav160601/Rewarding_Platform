const { Worker } = require("bullmq");
const emailService = require("../services/email.service");
const { createBullConnection } = require("../config/redis.bull.config");
const logger = require("../utils/logger");

const jobLog = logger.child({ module: "bullmq.email" });

const worker = new Worker(
  "emailQueue",
  async (job) => {
    const start = Date.now();
    jobLog.info({ event: "JOB_STARTED", jobId: job.id, queue: "emailQueue", jobName: job.name }, "JOB_STARTED");
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
        jobLog.warn({ jobName: job.name }, "Unknown email job");
    }
    const duration = Date.now() - start;
    jobLog.info({ event: "JOB_COMPLETED", jobId: job.id, queue: "emailQueue", jobName: job.name, executionTime: duration }, "JOB_COMPLETED");
  },
  {
    connection: createBullConnection(),
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 }
  }
);

worker.on("completed", (job) => {
  jobLog.info({ event: "JOB_COMPLETED", jobId: job.id, queue: "emailQueue", jobName: job.name }, "Email Job completed");
});

worker.on("failed", (job, err) => {
  jobLog.error({ event: "JOB_FAILED", jobId: job.id, queue: "emailQueue", jobName: job.name, error: err.message }, "JOB_FAILED");
});

module.exports = worker;
