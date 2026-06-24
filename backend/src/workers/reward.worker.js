const { Worker } = require("bullmq");
const rewardService = require("../services/reward.service");
const userRepository = require("../repositories/user.repository");
const rewardRepository = require("../repositories/reward.repository");
const emailQueue = require("../queues/email.queue");
const { createBullConnection } = require("../config/redis.bull.config");
const logger = require("../utils/logger");

const jobLog = logger.child({ module: "bullmq.reward" });

const worker = new Worker(
  "rewardQueue",
  async (job) => {
    const start = Date.now();
    jobLog.info({ event: "JOB_STARTED", jobId: job.id, queue: "rewardQueue", data: job.data }, "JOB_STARTED");
    const { userId, orderId, amount } = job.data;
    const result = await rewardService.earnPoints(userId, orderId, amount);
    if (result && result.points > 0) {
      const user = await userRepository.findById(userId);
      const balanceData = await rewardRepository.getUserPoints(userId);
      await emailQueue.add(
        "REWARD_EARNED",
        {
          email: user.email,
          points: result.points,
          balance: balanceData.reward_points
        },
        {
          attempts: 3,
          backoff: { type: "exponential", delay: 5000 }
        }
      );
    }
    const duration = Date.now() - start;
    jobLog.info({ event: "JOB_COMPLETED", jobId: job.id, queue: "rewardQueue", executionTime: duration }, "JOB_COMPLETED");
  },
  {
    connection: createBullConnection()
  }
);

worker.on("completed", (job) => {
  jobLog.info({ event: "JOB_COMPLETED", jobId: job.id, queue: "rewardQueue" }, "Reward Job completed");
});

worker.on("failed", (job, err) => {
  jobLog.error({ event: "JOB_FAILED", jobId: job.id, queue: "rewardQueue", error: err.message }, "JOB_FAILED");
});

module.exports = worker;
