const { Kafka } = require("kafkajs");
const fs = require("fs");
const path = require("path");

function readFileOrUndefined(filePath) {
  if (!filePath) return undefined;
  try {
    return fs.readFileSync(path.resolve(filePath), "utf8");
  } catch {
    return undefined;
  }
}

function createKafkaConfig() {
  const broker = process.env.KAFKA_BROKER;
  if (!broker) return null;

  const ssl = process.env.KAFKA_SSL === "true";
  let sslConfig = undefined;

  if (ssl) {
    sslConfig = {
      ca: readFileOrUndefined(process.env.KAFKA_CA_PATH),
      cert: readFileOrUndefined(process.env.KAFKA_CERT_PATH),
      key: readFileOrUndefined(process.env.KAFKA_KEY_PATH),
      rejectUnauthorized: false
    };
  }

  const saslUsername = process.env.KAFKA_USERNAME;
  const saslPassword = process.env.KAFKA_PASSWORD;
  let saslConfig = undefined;

  if (saslUsername && saslPassword) {
    saslConfig = {
      mechanism: "plain",
      username: saslUsername,
      password: saslPassword
    };
  }

  return {
    clientId: process.env.KAFKA_CLIENT_ID || "rewarding-platform",
    brokers: [broker],
    ssl: ssl ? sslConfig : false,
    sasl: saslConfig,
    connectionTimeout: 10000,
    authenticationTimeout: 10000,
    retry: {
      initialRetryTime: 300,
      retries: 10,
      maxRetryTime: 30000
    }
  };
}

function createKafkaClient() {
  const config = createKafkaConfig();
  if (!config) return null;
  return new Kafka(config);
}

module.exports = { createKafkaConfig, createKafkaClient };
