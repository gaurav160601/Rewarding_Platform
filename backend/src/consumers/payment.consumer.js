const { createKafkaClient } = require("../config/kafka.config");
const TOPICS = require("../topics/kafka.topics");
const { sendMessage } = require("../producers/order.producer");
const logger = require("../utils/logger");

const consumerLog = logger.child({ module: "kafka.payment-consumer" });

let consumer = null;

async function startPaymentConsumer() {
  const kafka = createKafkaClient();
  if (!kafka) {
    consumerLog.warn("Kafka not configured — payment consumer disabled");
    return;
  }

  consumer = kafka.consumer({
    groupId: "payment-consumer-group",
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
      await consumer.subscribe({ topic: TOPICS.PAYMENT_COMPLETED, fromBeginning: false });
    } catch (subErr) {
      consumerLog.warn({ topic: TOPICS.PAYMENT_COMPLETED, error: subErr.message }, "Topic not available");
    }

    consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const offset = message.offset;
        try {
          const data = JSON.parse(message.value.toString());
          consumerLog.info(
            { event: "KAFKA_MESSAGE_RECEIVED", topic, partition, offset, eventType: "PAYMENT_COMPLETED" },
            "KAFKA_MESSAGE_RECEIVED"
          );

          await sendMessage(TOPICS.EMAIL_NOTIFICATION, {
            type: "PAYMENT_SUCCESS",
            email: data.email,
            orderId: data.orderId,
            amount: data.amount
          });

          consumerLog.info(
            { event: "KAFKA_MESSAGE_PROCESSED", topic, partition, offset, eventType: "PAYMENT_COMPLETED" },
            "KAFKA_MESSAGE_PROCESSED"
          );
        } catch (err) {
          consumerLog.error(
            { event: "KAFKA_MESSAGE_FAILED", topic, partition, offset, error: err.message },
            "KAFKA_MESSAGE_FAILED"
          );
        }
      }
    });

    consumerLog.info("Kafka payment consumer running");
  } catch (err) {
    consumerLog.error({ error: err.message }, "Kafka payment consumer failed");
  }
}

async function stopPaymentConsumer() {
  if (consumer) {
    try {
      await consumer.disconnect();
      consumerLog.info("Kafka payment consumer disconnected");
    } catch (err) {
      consumerLog.error({ error: err.message }, "Kafka payment consumer disconnect error");
    }
  }
}

module.exports = { startPaymentConsumer, stopPaymentConsumer };
