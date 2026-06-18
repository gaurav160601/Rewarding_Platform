const mongoose = require("mongoose");

const rewardTransactionSchema =
  new mongoose.Schema(
    {
      userId: {
        type: Number,
        required: true
      },

      orderId: {
        type: Number
      },

      points: {
        type: Number,
        required: true
      },

      type: {
        type: String,
        enum: [
          "EARN",
          "REDEEM"
        ],
        required: true
      },

      description: {
        type: String
      }
    },
    {
      timestamps: true
    }
  );

module.exports = mongoose.model(
  "RewardTransaction",
  rewardTransactionSchema
);