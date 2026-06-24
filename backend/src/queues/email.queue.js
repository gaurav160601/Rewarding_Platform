const { Queue } = require("bullmq");
const { createBullConnection } = require("../config/redis.bull.config");
const logger = require("../utils/logger");

const queueLog = logger.child({ module: "bullmq.email" });

const emailQueue = new Queue("emailQueue", {
  connection: createBullConnection()
});

emailQueue.on("waiting", (jobId) => {
  queueLog.debug({ event: "JOB_CREATED", jobId, queue: "emailQueue" }, "JOB_CREATED");
});

module.exports = emailQueue;
