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

pool.ensureEventAttendeesTable = function (callback) {
  pool.query(`
    CREATE TABLE IF NOT EXISTS event_registrations (
      id BIGSERIAL PRIMARY KEY,
      event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      attended BOOLEAN NOT NULL DEFAULT FALSE,
      UNIQUE (event_id, user_id)
    );
    ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'pending';
    ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS attended BOOLEAN NOT NULL DEFAULT FALSE;
    CREATE INDEX IF NOT EXISTS event_registrations_event_id_idx ON event_registrations (event_id);
    CREATE INDEX IF NOT EXISTS event_registrations_user_id_idx ON event_registrations (user_id);

    CREATE TABLE IF NOT EXISTS event_attendees (
      event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'confirmed',
      attended BOOLEAN NOT NULL DEFAULT FALSE,
      attended_at TIMESTAMPTZ,
      joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (event_id, user_id)
    );
    ALTER TABLE event_attendees ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'confirmed';
    ALTER TABLE event_attendees ADD COLUMN IF NOT EXISTS attended BOOLEAN NOT NULL DEFAULT FALSE;
    ALTER TABLE event_attendees ADD COLUMN IF NOT EXISTS attended_at TIMESTAMPTZ;
    ALTER TABLE event_attendees ADD COLUMN IF NOT EXISTS joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
    UPDATE event_attendees SET status = 'confirmed' WHERE status IS NULL OR status = 'pending';
    UPDATE event_attendees SET attended = FALSE WHERE attended IS NULL;
    ALTER TABLE event_attendees DROP CONSTRAINT IF EXISTS event_attendees_status_check;
    ALTER TABLE event_attendees ADD CONSTRAINT event_attendees_status_check
      CHECK (status IN ('pending', 'confirmed', 'cancelled'));
    CREATE INDEX IF NOT EXISTS event_attendees_user_id_idx ON event_attendees (user_id);
  `)
    .then(() => callback(null))
    .catch((error) => callback(error));
};

module.exports = pool;
