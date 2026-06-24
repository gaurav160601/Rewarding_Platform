const mongoose = require("mongoose");
const logger = require("../utils/logger");

const mongoLog = logger.child({ module: "db.mongo" });

const connectMongo = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI,
      {
        tlsInsecure: true,
        serverSelectionTimeoutMS: 10000,
      }
    );

    mongoLog.info({ event: "MONGODB_CONNECTED" }, "MongoDB Connected");
  } catch (error) {
    mongoLog.error({ event: "MONGODB_CONNECTED", error: error.message }, "MongoDB Connection Failed");
    throw error;
  }
};
    
module.exports = connectMongo;