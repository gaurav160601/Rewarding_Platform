const RewardTransaction =
require("../models/rewardTransaction.model");

const { pool } =
require("../database/mysql");

class RewardRepository {

  async createTransaction(
    rewardData
  ) {

    return RewardTransaction.create(
      rewardData
    );
  }

  async updateUserPoints(
    userId,
    points
  ) {

    const [result] =
      await pool.execute(
        `
        UPDATE users
        SET reward_points =
            reward_points + ?
        WHERE id = ?
        `,
        [
          points,
          userId
        ]
      );

    return result;
  }

  async getUserPoints(
    userId
  ) {

    const [rows] =
      await pool.execute(
        `
        SELECT reward_points
        FROM users
        WHERE id = ?
        `,
        [userId]
      );

    return rows[0];
  }

  async deductUserPoints(
    userId,
    points
  ) {

    const [result] =
      await pool.execute(
        `
        UPDATE users
        SET reward_points =
            reward_points - ?
        WHERE id = ?
        `,
        [
          points,
          userId
        ]
      );

    return result;
  }

  async getUserRewardBalance(
    userId
  ) {

    const [rows] =
      await pool.execute(
        `
        SELECT reward_points
        FROM users
        WHERE id = ?
        `,
        [userId]
      );

    return rows[0];
  }

  async getRewardHistory(
    userId
  ) {

    return RewardTransaction
      .find({
        userId
      })
      .sort({
        createdAt: -1
      });
  }

}

module.exports =
new RewardRepository();