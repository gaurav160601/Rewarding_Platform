const { pool } =
require("../database/mysql");

class CartRepository {

  async findCartByUserId(userId) {

    const [rows] =
      await pool.execute(
        `
        SELECT *
        FROM carts
        WHERE user_id = ?
        `,
        [userId]
      );

    return rows[0];
  }

  async createCart(userId) {

    const [result] =
      await pool.execute(
        `
        INSERT INTO carts
        (
          user_id
        )
        VALUES
        (?)
        `,
        [userId]
      );

    return result.insertId;
  }

  async addItem(
    cartId,
    productId,
    quantity
  ) {

    const [result] =
      await pool.execute(
        `
        INSERT INTO cart_items
        (
          cart_id,
          product_id,
          quantity
        )
        VALUES
        (?, ?, ?)
        `,
        [
          cartId,
          productId,
          quantity
        ]
      );

    return result.insertId;
  }

  async getCartItems(cartId) {

    const [rows] =
      await pool.execute(
        `
        SELECT
          ci.id,
          ci.product_id,
          ci.quantity,

          p.name,
          p.price,
          p.stock

        FROM cart_items ci

        INNER JOIN products p
        ON ci.product_id = p.id

        WHERE ci.cart_id = ?
        AND p.status = 'ACTIVE'
        `,
        [cartId]
      );

    return rows;
  }

  async findCartItem(
    cartId,
    productId
  ) {

    const [rows] =
      await pool.execute(
        `
        SELECT *
        FROM cart_items
        WHERE cart_id = ?
        AND product_id = ?
        `,
        [cartId, productId]
      );

    return rows[0];
  }

  async updateQuantity(
    cartId,
    productId,
    quantity
  ) {

    const [result] =
      await pool.execute(
        `
        UPDATE cart_items
        SET quantity = ?
        WHERE cart_id = ?
        AND product_id = ?
        `,
        [quantity, cartId, productId]
      );

    return result.affectedRows;
  }

  async removeItem(
    cartId,
    productId
  ) {

    const [result] =
      await pool.execute(
        `
        DELETE FROM cart_items
        WHERE cart_id = ?
        AND product_id = ?
        `,
        [cartId, productId]
      );

    return result.affectedRows;
  }

  async clearCart(cartId) {

    const [result] =
      await pool.execute(
        `
        DELETE FROM cart_items
        WHERE cart_id = ?
        `,
        [cartId]
      );

    return result.affectedRows;
  }

  async clearCartInTransaction(
  cartId,
  connection
) {

  await connection.execute(
    `
    DELETE FROM cart_items
    WHERE cart_id = ?
    `,
    [cartId]
  );
}

}

module.exports =
new CartRepository();