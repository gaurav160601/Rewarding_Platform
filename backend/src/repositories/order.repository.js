const { pool } =
require("../database/mysql");

class OrderRepository {

  async createOrder(
    userId,
    totalAmount,
    connection,
    pointsRedeemed = 0,
    discountAmount = 0,
    paymentExpiresAt = null
  ) {

    const [result] =
      await connection.execute(
        `
        INSERT INTO orders
        (
          user_id,
          total_amount,
          status,
          points_redeemed,
          discount_amount,
          payment_expires_at
        )
        VALUES
        (?, ?, 'PAYMENT_PENDING', ?, ?, ?)
        `,
        [
          userId,
          totalAmount,
          pointsRedeemed,
          discountAmount,
          paymentExpiresAt
        ]
      );

    return result.insertId;
  }

  async createOrderItem(
    orderId,
    item,
    connection
  ) {

    await connection.execute(
      `
      INSERT INTO order_items
      (
        order_id,
        product_id,
        product_name,
        product_price,
        quantity,
        subtotal
      )
      VALUES
      (?, ?, ?, ?, ?, ?)
      `,
      [
        orderId,
        item.productId,
        item.name,
        item.price,
        item.quantity,
        item.subtotal
      ]
    );
  }

  async getAllOrders() {

    const [rows] =
      await pool.execute(
        `
        SELECT *
        FROM orders
        ORDER BY id DESC
        `
      );

    return rows;
  }

  async getOrdersByUserId(
    userId
  ) {

    const [rows] =
      await pool.execute(
        `
        SELECT *
        FROM orders
        WHERE user_id = ?
        ORDER BY id DESC
        `,
        [userId]
      );

    return rows;
  }

  async getOrderById(
    orderId
  ) {

    const [rows] =
      await pool.execute(
        `
        SELECT *
        FROM orders
        WHERE id = ?
        `,
        [orderId]
      );

    return rows[0];
  }

  async getOrderByIdAndUserId(
    orderId,
    userId
  ) {

    const [rows] =
      await pool.execute(
        `
        SELECT *
        FROM orders
        WHERE id = ?
        AND user_id = ?
        `,
        [orderId, userId]
      );

    return rows[0];
  }

  async getOrderItems(orderId) {

    const [rows] =
      await pool.execute(
        `
        SELECT *
        FROM order_items
        WHERE order_id = ?
        `,
        [orderId]
      );

    return rows;
  }

  async updateOrderStatus(
    orderId,
    status,
    connection = null,
    timestampColumn = null
  ) {

    const executor =
      connection || pool;

    let sql = `
      UPDATE orders
      SET status = ?
    `;

    const params = [status];

    if (timestampColumn) {
      sql += `, ${timestampColumn} = NOW()`;
    }

    sql += ` WHERE id = ?`;
    params.push(orderId);

    await executor.execute(
      sql,
      params
    );
  }

}

module.exports =
new OrderRepository();
