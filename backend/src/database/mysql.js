const mySql = require("mysql2/promise");

const databaseConfig =
  require("../config/database.config");

const pool = mySql.createPool(
  databaseConfig.mysql
);

const connectMySQL = async () => {
  try {

    const connection =
      await pool.getConnection();

    console.log(
      " TiDB Connected Successfully"
    );

    connection.release();

  } catch (error) {

    console.error(
      " TiDB Connection Failed"
    );

    console.error(error);

    throw error;
  }
};

module.exports = {
  pool,
  connectMySQL,
};