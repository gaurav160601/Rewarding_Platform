const { createKafkaClient } = require("../config/kafka.config");
const TOPICS = require("../topics/kafka.topics");
const { sendMessage } = require("../producers/order.producer");

let consumer = null;

async function startOrderConsumer() {
  const kafka = createKafkaClient();
  if (!kafka) {
    console.log(" Kafka not configured — order consumer disabled");
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
    console.log(" Kafka order consumer connected");

    const topics = [TOPICS.ORDER_CREATED, TOPICS.ORDER_CANCELLED, TOPICS.ORDER_SHIPPED, TOPICS.ORDER_DELIVERED];
    for (const topic of topics) {
      try {
        await consumer.subscribe({ topic, fromBeginning: false });
      } catch (subErr) {
        console.log(` Kafka order consumer: topic "${topic}" not available`);
      }
    }

    consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const data = JSON.parse(message.value.toString());
          console.log(`[ORDER-CONSUMER] Received ${topic}:`, JSON.stringify(data).slice(0, 150));

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
        } catch (err) {
          console.error(`[ORDER-CONSUMER] Error processing ${topic}:`, err.message);
        }
      }
    });

    console.log(" Kafka order consumer running");
  } catch (err) {
    console.error(" Kafka order consumer failed:", err.message);
  }
}

async function stopOrderConsumer() {
  if (consumer) {
    try {
      await consumer.disconnect();
      console.log(" Kafka order consumer disconnected");
    } catch (err) {
      console.error(" Kafka order consumer disconnect error:", err.message);
    }
  }
}

module.exports = { startOrderConsumer, stopOrderConsumer };
