const { Queue } = require("bullmq");
const { createBullConnection } = require("../config/redis.bull.config");

const emailQueue = new Queue("emailQueue", {
  connection: createBullConnection()
});

module.exports = emailQueue;
