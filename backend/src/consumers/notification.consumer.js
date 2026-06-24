const { createKafkaClient } = require("../config/kafka.config");
const TOPICS = require("../topics/kafka.topics");
const logger = require("../utils/logger");

const consumerLog = logger.child({ module: "kafka.notification-consumer" });

let consumer = null;

async function startNotificationConsumer() {
  const kafka = createKafkaClient();
  if (!kafka) {
    consumerLog.warn("Kafka not configured — notification consumer disabled");
    return;
  }

  consumer = kafka.consumer({
    groupId: "notification-consumer-group",
    sessionTimeout: 30000,
    heartbeatInterval: 3000,
    retry: {
      initialRetryTime: 300,
      retries: 5,
      maxRetryTime: 10000
    }
  });

  try {
    await consumer.connect();
    consumerLog.info({ event: "KAFKA_CONSUMER_CONNECTED" }, "KAFKA_CONSUMER_CONNECTED");

    try {
      await consumer.subscribe({ topic: TOPICS.EMAIL_NOTIFICATION, fromBeginning: false });
    } catch (subErr) {
      consumerLog.warn({ topic: TOPICS.EMAIL_NOTIFICATION, error: subErr.message }, "Topic not available");
    }

    consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const offset = message.offset;
        try {
          const data = JSON.parse(message.value.toString());
          consumerLog.info(
            { event: "KAFKA_MESSAGE_RECEIVED", topic, partition, offset, eventType: "EMAIL_NOTIFICATION" },
            "KAFKA_MESSAGE_RECEIVED"
          );

          if (data.type === "ORDER_CREATED") {
            consumerLog.info({ event: "KAFKA_MESSAGE_PROCESSED", topic, notification: "order_confirmation", orderId: data.orderId }, "Email notification processed");
          } else if (data.type === "ORDER_CANCELLED") {
            consumerLog.info({ event: "KAFKA_MESSAGE_PROCESSED", topic, notification: "cancellation", orderId: data.orderId }, "Email notification processed");
          } else if (data.type === "PAYMENT_SUCCESS") {
            consumerLog.info({ event: "KAFKA_MESSAGE_PROCESSED", topic, notification: "payment_success", orderId: data.orderId }, "Email notification processed");
          } else {
            consumerLog.info({ event: "KAFKA_MESSAGE_PROCESSED", topic, notification: data.type }, "Email notification processed");
          }
        } catch (err) {
          consumerLog.error(
            { event: "KAFKA_MESSAGE_FAILED", topic, partition, offset, error: err.message },
            "KAFKA_MESSAGE_FAILED"
          );
        }
      }
    });

    consumerLog.info("Kafka notification consumer running");
  } catch (err) {
    consumerLog.error({ error: err.message }, "Kafka notification consumer failed");
  }
}

async function stopNotificationConsumer() {
  if (consumer) {
    try {
      await consumer.disconnect();
      consumerLog.info("Kafka notification consumer disconnected");
    } catch (err) {
      consumerLog.error({ error: err.message }, "Kafka notification consumer disconnect error");
    }
  }
}

module.exports = { startNotificationConsumer, stopNotificationConsumer };
