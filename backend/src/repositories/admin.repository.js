const { pool } =
  require("../database/mysql");

const RewardTransaction =
  require("../models/rewardTransaction.model");

class AdminRepository {

  async getTotalUsers() {

    const [rows] =
      await pool.execute(
        `
        SELECT COUNT(*) AS totalUsers
        FROM users
        `
      );

    return rows[0].totalUsers;
  }

  async getTotalProducts() {

    const [rows] =
      await pool.execute(
        `
        SELECT COUNT(*) AS totalProducts
        FROM products
        `
      );

    return rows[0].totalProducts;
  }

  async getTotalOrders() {

    const [rows] =
      await pool.execute(
        `
        SELECT COUNT(*) AS totalOrders
        FROM orders
        WHERE status IN ('PAID', 'DELIVERED', 'PROCESSING', 'SHIPPED')
        `
      );

    return rows[0].totalOrders;
  }

  async getTotalRevenue() {

    const [rows] =
      await pool.execute(
        `
        SELECT
          COALESCE(
            SUM(total_amount),
            0
          ) AS totalRevenue
        FROM orders
        WHERE status IN ('PAID', 'DELIVERED')
        `
      );

    return rows[0].totalRevenue;
  }

  async getTotalRewardTransactions() {

    return RewardTransaction
      .countDocuments();
  }

  async getOrdersByStatus() {

    const [rows] =
      await pool.execute(
        `
        SELECT
          status,
          COUNT(*) AS count
        FROM orders
        GROUP BY status
        `
      );

    const result = {};

    for (const row of rows) {
      result[row.status] =
        row.count;
    }

    return result;
  }

  async getRecentOrders() {

    const [rows] =
      await pool.execute(
        `
        SELECT
          id,
          user_id,
          status,
          total_amount,
          created_at
        FROM orders
        ORDER BY created_at DESC
        LIMIT 5
        `
      );

    return rows;
  }

  async getTopProducts() {

    const [rows] =
      await pool.execute(
        `
        SELECT
          p.id,
          p.name,
          SUM(oi.quantity) AS sales
        FROM order_items oi
        JOIN products p
          ON oi.product_id = p.id
        GROUP BY p.id, p.name
        ORDER BY sales DESC
        LIMIT 5
        `
      );

    return rows;
  }

  async getAllUsers() {

    const [rows] =
      await pool.execute(
        `
        SELECT id, email, role
        FROM users
        ORDER BY id ASC
        `
      );

    return rows;
  }
}

module.exports =
  new AdminRepository();
