-- Run once on PostgreSQL (Supabase) to support Google SSO.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS google_id character varying(255);

CREATE UNIQUE INDEX IF NOT EXISTS users_google_id_key ON users (google_id)
  WHERE google_id IS NOT NULL;
