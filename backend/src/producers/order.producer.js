const { createKafkaClient } = require("../config/kafka.config");

let producer = null;
let connected = false;

async function connectProducer() {
  const kafka = createKafkaClient();
  if (!kafka) {
    console.log(" Kafka not configured — producer disabled");
    return;
  }
  producer = kafka.producer({
    allowAutoTopicCreation: true,
    retry: {
      initialRetryTime: 300,
      retries: 5,
      maxRetryTime: 10000
    }
  });
  try {
    await producer.connect();
    connected = true;
    console.log(" Kafka producer connected");
  } catch (err) {
    console.error(" Kafka producer connection failed:", err.message);
    producer = null;
  }
}

async function disconnectProducer() {
  if (producer && connected) {
    try {
      await producer.disconnect();
      connected = false;
      console.log(" Kafka producer disconnected");
    } catch (err) {
      console.error(" Kafka producer disconnect error:", err.message);
    }
  }
}

async function sendMessage(topic, payload) {
  if (!producer || !connected) {
    return;
  }
  try {
    await producer.send({
      topic,
      messages: [
        {
          value: JSON.stringify({
            ...payload,
            _timestamp: new Date().toISOString()
          })
        }
      ]
    });
    console.log(`[KAFKA] Sent to ${topic}:`, JSON.stringify(payload).slice(0, 120));
  } catch (err) {
    console.error(`[KAFKA] Failed to send to ${topic}:`, err.message);
  }
}

function isProducerConnected() {
  return connected;
}

module.exports = {
  connectProducer,
  disconnectProducer,
  sendMessage,
  isProducerConnected
};
