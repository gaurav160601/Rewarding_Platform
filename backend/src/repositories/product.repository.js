const { pool } = require("../database/mysql");

class ProductRepository {

    async createProduct(product) {
        const [result] = await pool.execute(
            `INSERT INTO products ( name, description, price,stock,sku) VALUES ( ?,?, ?, ?, ?)`,
            [
              product.name ?? null,
              product.description ?? null,
              product.price ?? null,
              product.stock ?? null,
              product.sku ?? null,
            ]
        );
        return result.insertId;
    }

    async getProductById(id) {

        const [rows] = await pool.execute(
            `SELECT * FROM products WHERE id=?`,
            [id]
        );

        return rows[0];
    }

    async getProducts(
        limit,
        offset
    ) {
        if (
            !Number.isSafeInteger(limit) ||
            !Number.isSafeInteger(offset) ||
            limit <= 0 ||
            offset < 0
        ) {
            throw new Error("Invalid pagination values");
        }

        const [rows] =
            await pool.query(
                `
        SELECT *
        FROM products
        WHERE is_active = TRUE
        ORDER BY id DESC
        LIMIT ${limit}
        OFFSET ${offset}
        `
            );

        return rows;
    }

    async search(keyword) {

        const [rows] =
            await pool.execute(
                `
        SELECT *
        FROM products
        WHERE name LIKE ?
        AND is_active = TRUE
        `,
                [`%${keyword}%`]
            );

        return rows;
    }


    async update(id, product) {

        const fields = [];
        const values = [];

        for (const [key, value] of Object.entries(product)) {
            if (key === 'id') continue;
            if (value === undefined) continue;
            fields.push(`${key} = ?`);
            values.push(value ?? null);
        }

        if (fields.length === 0) {
            throw new Error("No fields to update");
        }

        values.push(id);

        const [result] =
            await pool.execute(
                `UPDATE products SET ${fields.join(', ')} WHERE id = ? AND is_active = TRUE`,
                values
            );

        return result.affectedRows;
    }

    async delete(id) {

        const [result] =
            await pool.execute(
                `
      UPDATE products
      SET is_active = FALSE
      WHERE id = ?
      `,
                [id]
            );

        return result.affectedRows;
    }

    async countProducts() {

        const [rows] =
            await pool.execute(
                `
      SELECT COUNT(*) AS total
      FROM products
      WHERE is_active = TRUE
      `
            );

        return rows[0].total;
    }

    async updateStock(
  productId,
  quantity,
  connection
) {

  const [result] =
    await connection.execute(
      `
      UPDATE products
      SET stock = stock - ?
      WHERE id = ?
      `,
      [
        quantity,
        productId
      ]
    );

  return result.affectedRows;
}

  async findByIdForUpdate(
    productId,
    connection
  ) {

    const [rows] =
      await connection.execute(
        `
        SELECT *
        FROM products
        WHERE id = ?
        FOR UPDATE
        `,
        [productId]
      );

    return rows[0];
  }

  async restoreStock(
    productId,
    quantity,
    connection = null
  ) {

    const executor =
      connection || pool;

    await executor.execute(
      `
      UPDATE products
      SET stock = stock + ?
      WHERE id = ?
      `,
      [quantity, productId]
    );
  }
}

module.exports =
    new ProductRepository();
