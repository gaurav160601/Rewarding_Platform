const { Queue } =
require("bullmq");

const redisClient =
require("../config/redis.config");

const emailQueue =
new Queue(
  "emailQueue",
  {
    connection:
      redisClient
  }
);

module.exports =
emailQueue;
