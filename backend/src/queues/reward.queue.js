const { Queue } = require("bullmq");
const { createBullConnection } = require("../config/redis.bull.config");

const rewardQueue = new Queue("rewardQueue", {
  connection: createBullConnection()
});

module.exports = rewardQueue;
