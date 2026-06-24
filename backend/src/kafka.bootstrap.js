const { createKafkaClient } = require("./config/kafka.config");
const { connectProducer, disconnectProducer } = require("./producers/order.producer");
const { startOrderConsumer, stopOrderConsumer } = require("./consumers/order.consumer");
const { startPaymentConsumer, stopPaymentConsumer } = require("./consumers/payment.consumer");
const { startNotificationConsumer, stopNotificationConsumer } = require("./consumers/notification.consumer");
const TOPICS = require("./topics/kafka.topics");

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
      console.log(` Kafka topics created: ${toCreate.map(t => t.topic).join(", ")}`);
    } else {
      console.log(" Kafka topics already exist");
    }
  } catch (err) {
    console.log(` Kafka topics must be created in Aiven console. Topics needed: ${Object.values(TOPICS).join(", ")}`);
  } finally {
    try { await admin.disconnect(); } catch {}
  }
}

async function startKafka() {
  console.log(" Starting Kafka...");

  if (!process.env.KAFKA_BROKER) {
    console.log(" KAFKA_BROKER not set — Kafka disabled");
    return;
  }

  const kafka = createKafkaClient();
  if (!kafka) {
    console.log(" Kafka client creation failed — Kafka disabled");
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
      console.log(` Kafka consumer start warning: ${result.reason.message}`);
    }
  }

  console.log(" Kafka services started");
}

async function stopKafka() {
  console.log(" Stopping Kafka...");

  await Promise.allSettled([
    disconnectProducer(),
    stopOrderConsumer(),
    stopPaymentConsumer(),
    stopNotificationConsumer()
  ]);

  console.log(" Kafka services stopped");
}

module.exports = { startKafka, stopKafka };
