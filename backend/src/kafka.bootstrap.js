const { createKafkaClient } = require("./config/kafka.config");
const { connectProducer, disconnectProducer } = require("./producers/order.producer");
const { startOrderConsumer, stopOrderConsumer } = require("./consumers/order.consumer");
const { startPaymentConsumer, stopPaymentConsumer } = require("./consumers/payment.consumer");
const { startNotificationConsumer, stopNotificationConsumer } = require("./consumers/notification.consumer");
const TOPICS = require("./topics/kafka.topics");
const logger = require("./utils/logger");

const kafkaLog = logger.child({ module: "kafka.bootstrap" });

function withTimeout(promise, label, ms = 15000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    )
  ]);
}

async function ensureTopics(kafka) {
  const topics = Object.values(TOPICS);
  const admin = kafka.admin();
  try {
    await admin.connect();
    const existing = await admin.listTopics();
    const toCreate = topics
      .filter(t => !existing.includes(t))
      .map(topic => ({ topic }));
    if (toCreate.length > 0) {
      await admin.createTopics({ topics: toCreate, waitForLeaders: true, timeout: 15000 });
      kafkaLog.info({ topics: toCreate.map(t => t.topic).join(", ") }, "Kafka topics created");
    }
  } catch (err) {
    kafkaLog.warn({ topics: Object.values(TOPICS).join(", ") }, "Kafka topics must be created in Aiven console");
  } finally {
    try { await admin.disconnect(); } catch {}
  }
}

async function startKafka() {
  kafkaLog.info({ event: "KAFKA_STARTING" }, "Starting Kafka...");

  if (!process.env.KAFKA_BROKER) {
    kafkaLog.warn("KAFKA_BROKER not set — Kafka disabled");
    return;
  }

  const kafka = createKafkaClient();
  if (!kafka) {
    kafkaLog.warn("Kafka client creation failed — Kafka disabled");
    return;
  }

  await withTimeout(connectProducer(), "Kafka producer", 10000);

  await withTimeout(ensureTopics(kafka), "Topic creation", 20000);

  const results = await Promise.allSettled([
    withTimeout(startOrderConsumer(), "Order consumer", 10000),
    withTimeout(startPaymentConsumer(), "Payment consumer", 10000),
    withTimeout(startNotificationConsumer(), "Notification consumer", 10000)
  ]);

  for (const result of results) {
    if (result.status === "rejected") {
      kafkaLog.warn({ error: result.reason.message }, "Kafka consumer start warning");
    }
  }

  kafkaLog.info({ event: "KAFKA_CONNECTED" }, "KAFKA_CONNECTED");
}

async function stopKafka() {
  kafkaLog.info("Stopping Kafka...");

  await Promise.allSettled([
    disconnectProducer(),
    stopOrderConsumer(),
    stopPaymentConsumer(),
    stopNotificationConsumer()
  ]);

  kafkaLog.info("Kafka services stopped");
}

module.exports = { startKafka, stopKafka };
