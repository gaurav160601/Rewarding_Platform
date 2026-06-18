const { Queue } =
require("bullmq");

const redisClient =
require("../config/redis.config");

const rewardQueue =
new Queue(
  "rewardQueue",
  {
    connection:
      redisClient
  }
);

module.exports =
rewardQueue;
