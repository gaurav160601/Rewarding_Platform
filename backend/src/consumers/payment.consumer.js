const { createKafkaClient } = require("../config/kafka.config");
const TOPICS = require("../topics/kafka.topics");
const { sendMessage } = require("../producers/order.producer");

let consumer = null;

async function startPaymentConsumer() {
  const kafka = createKafkaClient();
  if (!kafka) {
    console.log(" Kafka not configured — payment consumer disabled");
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
    console.log(" Kafka payment consumer connected");

    try {
      await consumer.subscribe({ topic: TOPICS.PAYMENT_COMPLETED, fromBeginning: false });
    } catch (subErr) {
      console.log(` Kafka payment consumer: topic "${TOPICS.PAYMENT_COMPLETED}" not available`);
    }

    consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const data = JSON.parse(message.value.toString());
          console.log(`[PAYMENT-CONSUMER] Received ${topic}:`, JSON.stringify(data).slice(0, 150));

          await sendMessage(TOPICS.EMAIL_NOTIFICATION, {
            type: "PAYMENT_SUCCESS",
            email: data.email,
            orderId: data.orderId,
            amount: data.amount
          });
        } catch (err) {
          console.error(`[PAYMENT-CONSUMER] Error processing ${topic}:`, err.message);
        }
      }
    });

    console.log(" Kafka payment consumer running");
  } catch (err) {
    console.error(" Kafka payment consumer failed:", err.message);
  }
}

async function stopPaymentConsumer() {
  if (consumer) {
    try {
      await consumer.disconnect();
      console.log(" Kafka payment consumer disconnected");
    } catch (err) {
      console.error(" Kafka payment consumer disconnect error:", err.message);
    }
  }
}

module.exports = { startPaymentConsumer, stopPaymentConsumer };
