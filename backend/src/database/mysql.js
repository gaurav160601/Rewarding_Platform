const mySql = require("mysql2/promise");
const logger = require("../utils/logger");

const databaseConfig =
  require("../config/database.config");

const pool = mySql.createPool(
  databaseConfig.mysql
);

const queryLog = logger.child({ module: "db.mysql" });

const origExecute = pool.execute.bind(pool);
pool.execute = async function wrappedExecute(sql, params) {
  const start = Date.now();
  const truncatedSQL = typeof sql === "string" ? sql.replace(/\s+/g, " ").trim().slice(0, 200) : String(sql).slice(0, 200);
  try {
    const [rows, fields] = await origExecute(sql, params);
    const duration = Date.now() - start;
    queryLog.debug(
      { query: truncatedSQL, duration, rows: Array.isArray(rows) ? rows.length : rows?.affectedRows || 0, event: "DB_QUERY_SUCCESS" },
      "DB_QUERY_SUCCESS"
    );
    return [rows, fields];
  } catch (error) {
    const duration = Date.now() - start;
    queryLog.error(
      { query: truncatedSQL, duration, error: error.message, code: error.code, event: "DB_QUERY_FAILED" },
      "DB_QUERY_FAILED"
    );
    throw error;
  }
};

const origQuery = pool.query.bind(pool);
pool.query = async function wrappedQuery(sql, params) {
  const start = Date.now();
  const truncatedSQL = typeof sql === "string" ? sql.replace(/\s+/g, " ").trim().slice(0, 200) : String(sql).slice(0, 200);
  try {
    const [rows, fields] = await origQuery(sql, params);
    const duration = Date.now() - start;
    queryLog.debug(
      { query: truncatedSQL, duration, rows: Array.isArray(rows) ? rows.length : rows?.affectedRows || 0, event: "DB_QUERY_SUCCESS" },
      "DB_QUERY_SUCCESS"
    );
    return [rows, fields];
  } catch (error) {
    const duration = Date.now() - start;
    queryLog.error(
      { query: truncatedSQL, duration, error: error.message, code: error.code, event: "DB_QUERY_FAILED" },
      "DB_QUERY_FAILED"
    );
    throw error;
  }
};

const origGetConnection = pool.getConnection.bind(pool);
pool.getConnection = async function wrappedGetConnection() {
  const conn = await origGetConnection();

  const origConnExecute = conn.execute.bind(conn);
  conn.execute = async function wrappedConnExecute(sql, params) {
    const start = Date.now();
    const truncatedSQL = typeof sql === "string" ? sql.replace(/\s+/g, " ").trim().slice(0, 200) : String(sql).slice(0, 200);
    try {
      const [rows, fields] = await origConnExecute(sql, params);
      const duration = Date.now() - start;
      queryLog.debug(
        { query: truncatedSQL, duration, rows: Array.isArray(rows) ? rows.length : rows?.affectedRows || 0, event: "DB_QUERY_SUCCESS", transaction: true },
        "DB_QUERY_SUCCESS"
      );
      return [rows, fields];
    } catch (error) {
      const duration = Date.now() - start;
      queryLog.error(
        { query: truncatedSQL, duration, error: error.message, code: error.code, event: "DB_QUERY_FAILED", transaction: true },
        "DB_QUERY_FAILED"
      );
      throw error;
    }
  };

  const origBeginTransaction = conn.beginTransaction.bind(conn);
  conn.beginTransaction = async function wrappedBeginTransaction() {
    queryLog.debug({ event: "DB_TRANSACTION_START" }, "DB_TRANSACTION_START");
    return origBeginTransaction();
  };

  const origCommit = conn.commit.bind(conn);
  conn.commit = async function wrappedCommit() {
    queryLog.debug({ event: "DB_TRANSACTION_COMMIT" }, "DB_TRANSACTION_COMMIT");
    return origCommit();
  };

  const origRollback = conn.rollback.bind(conn);
  conn.rollback = async function wrappedRollback() {
    queryLog.warn({ event: "DB_TRANSACTION_ROLLBACK" }, "DB_TRANSACTION_ROLLBACK");
    return origRollback();
  };

  return conn;
};

const connectMySQL = async () => {
  try {

    const connection =
      await pool.getConnection();

    connection.release();

  } catch (error) {

    throw error;
  }
};

module.exports = {
  pool,
  connectMySQL,
};