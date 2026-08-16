const { Pool } = require("pg");
const dbConfig = require("../config/db.config.js");

const pool = new Pool({
  host: dbConfig.HOST,
  port: dbConfig.PORT || 5432,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
  ssl: dbConfig.SSL === "true" ? { rejectUnauthorized: false } : false
});

pool.on("connect", () => {
  console.log("Successfully connected to PostgreSQL.");
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL client error:", error);
});

module.exports = pool;