const { Queue } = require("bullmq");
const { createBullConnection } = require("../config/redis.bull.config");
const logger = require("../utils/logger");

const queueLog = logger.child({ module: "bullmq.reward" });

const rewardQueue = new Queue("rewardQueue", {
  connection: createBullConnection()
});

rewardQueue.on("waiting", (jobId) => {
  queueLog.debug({ event: "JOB_CREATED", jobId, queue: "rewardQueue" }, "JOB_CREATED");
});

module.exports = rewardQueue;
