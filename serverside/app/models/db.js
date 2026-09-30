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

pool.ensureContentTables = function (callback) {
  pool.query(`
    CREATE TABLE IF NOT EXISTS teacher_profiles (
      id BIGSERIAL PRIMARY KEY,
      team VARCHAR(80) NOT NULL CHECK (team IN ('leadership', 'pastoral', 'department')),
      department VARCHAR(120),
      name VARCHAR(180) NOT NULL,
      role VARCHAR(180) NOT NULL,
      focus VARCHAR(180),
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(80),
      image TEXT,
      created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT teacher_profiles_department_check CHECK (
        (team = 'department' AND department IS NOT NULL)
        OR team IN ('leadership', 'pastoral')
      )
    );
    ALTER TABLE teacher_profiles ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT FALSE;
    CREATE INDEX IF NOT EXISTS teacher_profiles_team_idx ON teacher_profiles (team);
    CREATE INDEX IF NOT EXISTS teacher_profiles_department_idx ON teacher_profiles (department);
    CREATE INDEX IF NOT EXISTS teacher_profiles_featured_idx ON teacher_profiles (featured);

    CREATE TABLE IF NOT EXISTS spotlights (
      id BIGSERIAL PRIMARY KEY,
      teacher_id BIGINT REFERENCES teacher_profiles(id) ON DELETE CASCADE,
      spotlight_type VARCHAR(20) NOT NULL DEFAULT 'teacher'
        CHECK (spotlight_type IN ('teacher', 'alumni', 'community')),
      subject_name VARCHAR(180),
      title VARCHAR(200) NOT NULL,
      story TEXT NOT NULL,
      achievement_date DATE NOT NULL DEFAULT CURRENT_DATE,
      image TEXT,
      published BOOLEAN NOT NULL DEFAULT FALSE,
      created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT spotlights_subject_check CHECK (
        (spotlight_type = 'teacher' AND teacher_id IS NOT NULL)
        OR (spotlight_type <> 'teacher' AND teacher_id IS NULL)
      )
    );
    CREATE INDEX IF NOT EXISTS spotlights_published_date_idx
      ON spotlights (published, achievement_date DESC);
    CREATE INDEX IF NOT EXISTS spotlights_teacher_idx
      ON spotlights (teacher_id, achievement_date DESC);

    DO $spotlight_migration$
    BEGIN
      IF to_regclass('public.teacher_spotlights') IS NOT NULL THEN
        INSERT INTO spotlights
          (id, teacher_id, spotlight_type, subject_name, title, story,
           achievement_date, image, published, created_by, created_at, updated_at)
        SELECT id, teacher_id, 'teacher', NULL, title, story,
               achievement_date, image, published, created_by, created_at, updated_at
        FROM teacher_spotlights
        ON CONFLICT (id) DO NOTHING;

        PERFORM setval(
          pg_get_serial_sequence('spotlights', 'id'),
          COALESCE((SELECT MAX(id) FROM spotlights), 1),
          EXISTS (SELECT 1 FROM spotlights)
        );
      END IF;
    END
    $spotlight_migration$;

    CREATE TABLE IF NOT EXISTS content_items (
      id BIGSERIAL PRIMARY KEY,
      content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('news', 'teacher')),
      issue VARCHAR(120),
      title TEXT,
      published_date DATE,
      body TEXT,
      full_body TEXT,
      team VARCHAR(80),
      department VARCHAR(120),
      name VARCHAR(180),
      role VARCHAR(180),
      focus VARCHAR(180),
      email VARCHAR(255),
      phone VARCHAR(80),
      image TEXT,
      created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS content_items_type_idx ON content_items (content_type);

    INSERT INTO content_items (content_type, issue, title, published_date, body, full_body)
    SELECT seed.content_type, seed.issue, seed.title, seed.published_date::date, seed.body, seed.full_body
    FROM (VALUES
      ('news', 'Winter 2026', 'Welcome to the Rototuna community', '2026-09-09', 'Discover the latest updates, upcoming events, and stories from across our school community.', 'Rototuna students, staff, families, and supporters make our school community special. Follow the latest updates and opportunities to get involved.'),
      ('news', 'Winter 2026', 'What is happening around Rototuna', '2026-09-07', 'From school events to new opportunities, there is plenty to look forward to as the year continues.', 'Our community calendar is full of opportunities to connect and get involved. Keep checking the events page for school updates and upcoming activities.'),
      ('news', 'Winter 2026', 'Celebrating student achievements', '2026-09-02', 'Read about the students, staff, and teams making a positive contribution to our school community.', 'Rototuna celebrates the achievements, projects, and experiences that make our community proud.'),
      ('news', 'Autumn 2026', 'Keeping our community connected', '2026-06-12', 'Our school community is growing, with new ways to connect, share expertise, and support students.', 'The Rototuna community continues to grow through shared learning, events, and opportunities for families and staff to get involved.'),
      ('news', 'Autumn 2026', 'A look back at our community events', '2026-06-01', 'Thank you to everyone who helped make our recent school events a success.', 'Our latest events created valuable opportunities for students, families, staff, and the wider community to connect.'),
      ('news', 'Autumn 2026', 'Supporting student pathways', '2026-05-20', 'Discover opportunities that support students as they explore their next steps in learning and life.', 'Students can access guidance, mentoring, and practical opportunities as they explore future study and career pathways.')
    ) AS seed(content_type, issue, title, published_date, body, full_body)
    WHERE NOT EXISTS (SELECT 1 FROM content_items WHERE content_type = 'news');

    INSERT INTO content_items (content_type, team, department, name, role, focus, email, phone)
    SELECT seed.content_type, seed.team, seed.department, seed.name, seed.role, seed.focus, seed.email, seed.phone
    FROM (VALUES
      ('teacher', 'leadership', NULL, 'Marie Gordon', 'Principal', NULL, 'principal@rototuna.school.nz', NULL),
      ('teacher', 'leadership', NULL, 'Craig Scrimgeour', '(2IC) Deputy Principal', 'Operations and Data', 'scrimgeourc@rototuna.school.nz', NULL),
      ('teacher', 'leadership', NULL, 'Victoria Trenwith', 'Deputy Principal', 'School Culture', 'trenwithv@rototuna.school.nz', NULL),
      ('teacher', 'leadership', NULL, 'Grainne O Mahony', 'Deputy Principal', 'Student Hauora', 'omahonyg@rototuna.school.nz', NULL),
      ('teacher', 'leadership', NULL, 'Suzie Brace', 'Deputy Principal', 'Teaching and Learning', 'braces@rototuna.school.nz', NULL),
      ('teacher', 'leadership', NULL, 'Campbell Wood', 'Deputy Principal', 'Teaching and Learning', 'woodc@rototuna.school.nz', NULL),
      ('teacher', 'pastoral', NULL, 'Pastoral Support Team', 'Student wellbeing', NULL, 'pastoral@rototuna.school.nz', NULL),
      ('teacher', 'pastoral', NULL, 'Student Services', 'Guidance and support', NULL, 'studentservices@rototuna.school.nz', NULL),
      ('teacher', 'pastoral', NULL, 'Whanau Liaison', 'Community connection', NULL, 'liaison@rototuna.school.nz', NULL),
      ('teacher', 'department', 'Extracurricular', 'Lana Kershaw-Work', 'Director of Sport', NULL, 'kershaw-workl@rototuna.school.nz', '(07) 839 1304 ext 847'),
      ('teacher', 'department', 'Extracurricular', 'Loretta Pennington', 'Director of Arts', NULL, 'penningtonl@rototuna.school.nz', '(07) 839 1304 ext 831'),
      ('teacher', 'department', 'Extracurricular', 'Edward Dawkins', 'Associate Director of Sports', NULL, 'dawkinse@rototuna.school.nz', '(07) 839 1304 ext 847'),
      ('teacher', 'department', 'Extracurricular', 'Robyn Ferrier', 'Sport Coordinator', NULL, 'ferrierr@rototuna.school.nz', '(07) 839 1304 ext 847')
    ) AS seed(content_type, team, department, name, role, focus, email, phone)
    WHERE NOT EXISTS (SELECT 1 FROM content_items WHERE content_type = 'teacher');

    INSERT INTO teacher_profiles (team, department, name, role, focus, email, phone, image, created_by)
    SELECT team, department, name, role, focus, email, phone, image, created_by
    FROM content_items
    WHERE content_type = 'teacher'
      AND NOT EXISTS (SELECT 1 FROM teacher_profiles);

    CREATE TABLE IF NOT EXISTS announcements (
      id BIGSERIAL PRIMARY KEY,
      issue VARCHAR(120) NOT NULL,
      title TEXT NOT NULL,
      published_date DATE,
      body TEXT NOT NULL,
      full_body TEXT,
      image TEXT,
      created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS announcements_published_date_idx ON announcements (published_date DESC);
    CREATE INDEX IF NOT EXISTS announcements_issue_idx ON announcements (issue);

    INSERT INTO announcements (issue, title, published_date, body, full_body, image, created_by)
    SELECT issue, title, published_date, body, full_body, image, created_by
    FROM content_items
    WHERE content_type = 'news'
      AND NOT EXISTS (SELECT 1 FROM announcements);
  `).then(() => callback(null)).catch((error) => callback(error));
};

module.exports = pool;
