const { pool } = require("../database/mysql");

class ProductRepository {

    async createProduct(product) {
        const [result] = await pool.execute(
            `INSERT INTO products ( name, description, price,stock,sku) VALUES ( ?,?, ?, ?, ?)`,
            [product.name, product.description, product.price, product.stock, product.sku]
        );
        return result.insertId;
    }

    async getProductById(id) {
        console.log("Repository getProductById id:", id);

        const [rows] = await pool.execute(
            `SELECT * FROM products WHERE id=?`,
            [id]
        );

        console.log("Repository getProductById rows:", rows.length);

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
        `,
                [`%${keyword}%`]
            );

        return rows;
    }


    async update(id, product) {

        const [result] =
            await pool.execute(
                `
      UPDATE products
      SET
        name = ?,
        description = ?,
        price = ?,
        stock = ?,
        sku = ?
      WHERE id = ?
      `,
                [
                    product.name,
                    product.description,
                    product.price,
                    product.stock,
                    product.sku,
                    id
                ]
            );

        return result.affectedRows;
    }

    async delete(id) {

        const [result] =
            await pool.execute(
                `
      UPDATE products
      SET status = 'INACTIVE'
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
      WHERE status='ACTIVE'
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
    connection
  ) {

    await connection.execute(
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
