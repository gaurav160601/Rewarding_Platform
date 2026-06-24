const { createKafkaClient } = require("../config/kafka.config");
const logger = require("../utils/logger");

const producerLog = logger.child({ module: "kafka.producer" });

let producer = null;
let connected = false;

async function connectProducer() {
  producerLog.info({ event: "KAFKA_PRODUCER_CONNECTING" }, "KAFKA_PRODUCER_CONNECTING");
  const kafka = createKafkaClient();
  if (!kafka) {
    producerLog.warn("Kafka not configured — producer disabled");
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
    producerLog.info({ event: "KAFKA_PRODUCER_CONNECTED" }, "KAFKA_PRODUCER_CONNECTED");
  } catch (err) {
    producerLog.error({ event: "KAFKA_PRODUCER_CONNECTED", error: err.message }, "Kafka producer connection failed");
    producer = null;
  }
}

async function disconnectProducer() {
  if (producer && connected) {
    try {
      await producer.disconnect();
      connected = false;
      producerLog.info("Kafka producer disconnected");
    } catch (err) {
      producerLog.error({ error: err.message }, "Kafka producer disconnect error");
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
    producerLog.info(
      { event: "KAFKA_MESSAGE_SENT", topic, eventType: topic, data: JSON.stringify(payload).slice(0, 200) },
      "KAFKA_MESSAGE_SENT"
    );
  } catch (err) {
    producerLog.error(
      { event: "KAFKA_MESSAGE_FAILED", topic, error: err.message },
      "KAFKA_MESSAGE_FAILED"
    );
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
