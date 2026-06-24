const { createKafkaClient } = require("../config/kafka.config");
const TOPICS = require("../topics/kafka.topics");
const { sendMessage } = require("../producers/order.producer");
const logger = require("../utils/logger");

const consumerLog = logger.child({ module: "kafka.order-consumer" });

let consumer = null;

async function startOrderConsumer() {
  const kafka = createKafkaClient();
  if (!kafka) {
    consumerLog.warn("Kafka not configured — order consumer disabled");
    return;
  }

  consumer = kafka.consumer({
    groupId: "order-consumer-group",
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

    const topics = [TOPICS.ORDER_CREATED, TOPICS.ORDER_CANCELLED, TOPICS.ORDER_SHIPPED, TOPICS.ORDER_DELIVERED];
    for (const topic of topics) {
      try {
        await consumer.subscribe({ topic, fromBeginning: false });
      } catch (subErr) {
        consumerLog.warn({ topic, error: subErr.message }, `Topic "${topic}" not available`);
      }
    }

    consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const offset = message.offset;
        try {
          const data = JSON.parse(message.value.toString());
          consumerLog.info(
            { event: "KAFKA_MESSAGE_RECEIVED", topic, partition, offset, eventType: topic },
            "KAFKA_MESSAGE_RECEIVED"
          );

          if (topic === TOPICS.ORDER_CREATED) {
            await sendMessage(TOPICS.EMAIL_NOTIFICATION, {
              type: "ORDER_CREATED",
              email: data.email,
              orderId: data.orderId,
              totalAmount: data.totalAmount
            });
          } else if (topic === TOPICS.ORDER_CANCELLED) {
            await sendMessage(TOPICS.EMAIL_NOTIFICATION, {
              type: "ORDER_CANCELLED",
              email: data.email,
              orderId: data.orderId,
              refundAmount: data.refundAmount
            });
          }

          consumerLog.info(
            { event: "KAFKA_MESSAGE_PROCESSED", topic, partition, offset, eventType: topic },
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

    consumerLog.info("Kafka order consumer running");
  } catch (err) {
    consumerLog.error({ error: err.message }, "Kafka order consumer failed");
  }
}

async function stopOrderConsumer() {
  if (consumer) {
    try {
      await consumer.disconnect();
      consumerLog.info("Kafka order consumer disconnected");
    } catch (err) {
      consumerLog.error({ error: err.message }, "Kafka order consumer disconnect error");
    }
  }
}

module.exports = { startOrderConsumer, stopOrderConsumer };
