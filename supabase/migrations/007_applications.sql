-- 007_applications.sql
-- membership applications, site settings key-value store, and audit log

CREATE TABLE membership_applications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  full_name       TEXT NOT NULL,
  email           TEXT NOT NULL,
  discord_tag     TEXT,
  motivation      TEXT NOT NULL,
  preferred_games UUID[],
  experience      TEXT,
  availability    TEXT,
  status          TEXT DEFAULT 'pending'
                  CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at     TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE site_settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- Default site settings rows
INSERT INTO site_settings (key, value) VALUES
  ('club_name',            '"Esports Club"'),
  ('club_tagline',         '"Play. Compete. Dominate."'),
  ('announcement_banner',  '{"text": "", "enabled": false}'),
  ('registration_open',    'false'),
  ('social_links',         '{"discord": "", "twitter": "", "youtube": ""}')
ON CONFLICT (key) DO NOTHING;

CREATE TABLE audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  target_type TEXT,
  target_id   UUID,
  metadata    JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
