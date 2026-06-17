const mongoose = require("mongoose");

const connectMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log(" MongoDB Connected");
  } catch (error) {
    console.error(" MongoDB Connection Failed");
    console.error(error);
    throw error;
  }
};
    
module.exports = connectMongo;