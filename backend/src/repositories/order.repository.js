const { pool } =
require("../database/mysql");

class OrderRepository {

  async createOrder(
    userId,
    totalAmount,
    connection
  ) {

    const [result] =
      await connection.execute(
        `
        INSERT INTO orders
        (
          user_id,
          total_amount,
          status
        )
        VALUES
        (?, ?, 'PAYMENT_PENDING')
        `,
        [
          userId,
          totalAmount
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
    connection = null
  ) {

    const executor =
      connection || pool;

    await executor.execute(
      `
      UPDATE orders
      SET status = ?
      WHERE id = ?
      `,
      [
        status,
        orderId
      ]
    );
  }

}

module.exports =
new OrderRepository();
