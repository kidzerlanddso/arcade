const { Pool } = require("pg");
const dbConfig = require("../config/db.config.js");

const pool = new Pool({
  host: dbConfig.HOST,
  port: dbConfig.PORT || 5432,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
  ssl: dbConfig.SSL === "true" ? { rejectUnauthorized: false } : false,
});

pool.on("connect", () => {
  console.log("Successfully connected to PostgreSQL.");
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL client error:", error);
});

// Keep imported local databases from reusing existing auto-increment IDs.
pool.syncSequences = function (callback) {
  const sequenceQueries = [
    {
      table: "users",
      query: `
        SELECT setval(
          pg_get_serial_sequence('users', 'id'),
          COALESCE(MAX(id), 1),
          MAX(id) IS NOT NULL
        )
        FROM users
      `,
    },
    {
      table: "profile",
      query: `
        SELECT setval(
          pg_get_serial_sequence('profile', 'id'),
          COALESCE(MAX(id), 1),
          MAX(id) IS NOT NULL
        )
        FROM profile
      `,
    },
  ];

  Promise.all(
    sequenceQueries.map(({ table, query }) =>
      pool.query(query).catch((error) => {
        error.table = table;
        throw error;
      }),
    ),
  )
    .then(() => callback(null))
    .catch((error) => callback(error));
};

module.exports = pool;
