const { pool } = require("../database/mysql");

const PAYMENT_STATUS =
  require("../constants/paymentStatus");

class PaymentRepository {

  async createPayment(
    orderId,
    userId,
    amount,
    provider = "STRIPE"
  ) {

    const [result] =
      await pool.execute(
        `
        INSERT INTO payments
        (
          order_id,
          user_id,
          amount,
          provider,
          status
        )
        VALUES
        (?, ?, ?, ?, ?)
        `,
        [
          orderId,
          userId,
          amount,
          provider,
          PAYMENT_STATUS.PENDING
        ]
      );

    return result.insertId;
  }

  async findById(id) {

    const [rows] =
      await pool.execute(
        `
        SELECT *
        FROM payments
        WHERE id = ?
        `,
        [id]
      );

    return rows[0];
  }

  async findByOrderId(orderId) {

    const [rows] =
      await pool.execute(
        `
        SELECT *
        FROM payments
        WHERE order_id = ?
        `,
        [orderId]
      );

    return rows[0];
  }

  async updateStatus(
    paymentId,
    status
  ) {

    const [result] =
      await pool.execute(
        `
        UPDATE payments
        SET status = ?
        WHERE id = ?
        `,
        [
          status,
          paymentId
        ]
      );

    return result.affectedRows;
  }

  async findBySessionId(
    sessionId
  ) {

    const [rows] =
      await pool.execute(
        `
        SELECT *
        FROM payments
        WHERE provider_session_id = ?
        `,
        [sessionId]
      );

    return rows[0];
  }

  async updateProviderDetails(
    paymentId,
    providerSessionId,
    providerPaymentId = null
  ) {

    const [result] =
      await pool.execute(
        `
        UPDATE payments
        SET
          provider_session_id = ?,
          provider_payment_id = ?
        WHERE id = ?
        `,
        [
          providerSessionId,
          providerPaymentId,
          paymentId
        ]
      );

    return result.affectedRows;
  }

}

module.exports =
new PaymentRepository();
