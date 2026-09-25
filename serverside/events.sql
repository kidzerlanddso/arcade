CREATE TABLE IF NOT EXISTS events (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  event_date DATE NOT NULL,
  active_from DATE NOT NULL,
  active_to DATE,
  active INTEGER NOT NULL DEFAULT 0,
  recurring BOOLEAN NOT NULL DEFAULT FALSE,
  recurrence_frequency VARCHAR(10) NOT NULL DEFAULT 'monthly',
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

ALTER TABLE events ADD COLUMN IF NOT EXISTS active_from DATE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS active_to DATE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS active INTEGER NOT NULL DEFAULT 0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS recurring BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS recurrence_frequency VARCHAR(10) NOT NULL DEFAULT 'monthly';
UPDATE events SET active_from = event_date WHERE active_from IS NULL;
ALTER TABLE events ALTER COLUMN active_from SET NOT NULL;
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_recurrence_frequency_check;
ALTER TABLE events ADD CONSTRAINT events_recurrence_frequency_check
  CHECK (recurrence_frequency IN ('monthly', 'yearly'));
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_recurring_dates_check;
ALTER TABLE events ADD CONSTRAINT events_recurring_dates_check
  CHECK (NOT recurring OR (active_to IS NOT NULL AND active_to >= active_from));

CREATE INDEX IF NOT EXISTS events_event_date_idx ON events (event_date, start_time);
