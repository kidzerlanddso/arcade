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

pool.ensureEventsTable = function (callback) {
  pool.query(
    `CREATE TABLE IF NOT EXISTS events (
      id BIGSERIAL PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      event_date DATE NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      location VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      price VARCHAR(50) NOT NULL DEFAULT 'Free',
      image TEXT,
      created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS events_event_date_idx ON events (event_date, start_time);`,
    (error) => callback(error || null),
  );
};

pool.seedEvents = function (callback) {
  pool.query(
    `INSERT INTO events
      (title, event_date, start_time, end_time, location, description, price, image)
     SELECT * FROM (VALUES
       ('Rototuna Alumni Networking Evening', '2026-09-04'::date, '18:00'::time, '21:00'::time,
        'Rototuna High School Hall', 'Reconnect with classmates, meet recent graduates, and share career stories.', 'Free',
        'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=80'),
       ('Rototuna School Sports Day', '2026-09-12'::date, '10:00'::time, '15:00'::time,
        'Rototuna Junior High School Indoor Courts', 'A friendly day of games, team challenges, and school sports activities.', '$10',
        'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80'),
       ('Rototuna Alumni Career Workshop', '2026-09-18'::date, '17:30'::time, '19:30'::time,
        'Rototuna High School Library', 'Practical CV, interview, and career advice from Rototuna alumni.', 'Free',
        'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80'),
       ('Rototuna Community Cleanup', '2026-09-26'::date, '09:30'::time, '12:00'::time,
        'Rototuna High School Courtyard', 'Help prepare the school courtyard and gardens, followed by morning tea.', 'Free',
        'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1200&q=80'),
       ('Rototuna Alumni Reunion 2026', '2026-10-02'::date, '18:00'::time, '22:00'::time,
        'Rototuna High School Hall', 'An evening of reunion, networking, and school community updates.', '$5',
        'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80')
     ) AS seed(title, event_date, start_time, end_time, location, description, price, image)
     WHERE NOT EXISTS (SELECT 1 FROM events);`,
    (error) => callback(error || null),
  );
};

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
