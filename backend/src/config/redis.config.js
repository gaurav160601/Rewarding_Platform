console.log("REDIS_HOST =", process.env.REDIS_HOST);
console.log("REDIS_PORT =", process.env.REDIS_PORT);
console.log("REDIS_TLS =", process.env.REDIS_TLS);

const Redis =
require("ioredis");

const client =
new Redis({
  host:
    process.env
      .REDIS_HOST ||
    "localhost",
  port:
    Number(
      process.env
        .REDIS_PORT ||
      6379
    ),
  password:
    process.env
      .REDIS_PASSWORD ||
    undefined,
  tls:
    process.env
      .REDIS_TLS ===
    "true"
      ? {}
      : undefined,
  maxRetriesPerRequest: null,
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
