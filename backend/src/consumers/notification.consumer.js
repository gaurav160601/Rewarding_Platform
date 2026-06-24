const { createKafkaClient } = require("../config/kafka.config");
const TOPICS = require("../topics/kafka.topics");

let consumer = null;

async function startNotificationConsumer() {
  const kafka = createKafkaClient();
  if (!kafka) {
    console.log(" Kafka not configured — notification consumer disabled");
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
    console.log(" Kafka notification consumer connected");

    try {
      await consumer.subscribe({ topic: TOPICS.EMAIL_NOTIFICATION, fromBeginning: false });
    } catch (subErr) {
      console.log(` Kafka notification consumer: topic "${TOPICS.EMAIL_NOTIFICATION}" not available`);
    }

    consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const data = JSON.parse(message.value.toString());
          console.log(`[NOTIFICATION-CONSUMER] Email notification received:`, JSON.stringify(data).slice(0, 200));

          if (data.type === "ORDER_CREATED") {
            console.log(`[NOTIFICATION] Simulating order confirmation email for Order #${data.orderId}`);
          } else if (data.type === "ORDER_CANCELLED") {
            console.log(`[NOTIFICATION] Simulating cancellation email for Order #${data.orderId}`);
          } else if (data.type === "PAYMENT_SUCCESS") {
            console.log(`[NOTIFICATION] Simulating payment success email for Order #${data.orderId}`);
          } else {
            console.log(`[NOTIFICATION] Simulating notification for type=${data.type}`);
          }
        } catch (err) {
          console.error(`[NOTIFICATION-CONSUMER] Error:`, err.message);
        }
      }
    });

    console.log(" Kafka notification consumer running");
  } catch (err) {
    console.error(" Kafka notification consumer failed:", err.message);
  }
}

async function stopNotificationConsumer() {
  if (consumer) {
    try {
      await consumer.disconnect();
      console.log(" Kafka notification consumer disconnected");
    } catch (err) {
      console.error(" Kafka notification consumer disconnect error:", err.message);
    }
  }
}

module.exports = { startNotificationConsumer, stopNotificationConsumer };
