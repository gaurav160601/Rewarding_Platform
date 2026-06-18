const Redis =
require("ioredis");

const client =
new Redis({
  host: "localhost",
  port: 6379,
  maxRetriesPerRequest: null
});

client.on(
  "error",
  (err) => {
    console.error(
      "Redis Error:",
      err
    );
  }
);

client.on(
  "connect",
  () => {
    console.log(
      " Redis Connected"
    );
  }
);

module.exports = client;
