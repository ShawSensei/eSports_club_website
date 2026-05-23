-- 009_fix_triggers.sql
-- Idempotent catch-up migration.
-- Creates all tables/functions/triggers/policies/indexes that were missing
-- because migrations 001-008 were marked applied without running on the remote DB.
-- Only profiles existed remotely; everything else is created here.

-- ── Shared trigger function ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── RLS helper functions ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_mod()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── handle_new_user trigger ───────────────────────────────────────────────────
-- Uses display_name meta key (matching the register action) and appends part
-- of the UUID to prevent username collisions on identical email prefixes.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      split_part(NEW.email, '@', 1) || '_' || substr(NEW.id::text, 1, 4)
    ),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- ── profiles updated_at trigger ───────────────────────────────────────────────
DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- ── games ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS games (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  logo_url      TEXT,
  cover_url     TEXT,
  current_patch TEXT,
  is_supported  BOOLEAN DEFAULT TRUE,
  sort_order    INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS games_updated_at ON games;
CREATE TRIGGER games_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- ── user_games ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_games (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  game_id      UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  in_game_name TEXT,
  current_rank TEXT,
  peak_rank    TEXT,
  is_primary   BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, game_id)
);

-- ── news_posts ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS news_posts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  slug         TEXT UNIQUE NOT NULL,
  body         TEXT NOT NULL,
  excerpt      TEXT,
  cover_url    TEXT,
  author_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  category     TEXT DEFAULT 'news'
               CHECK (category IN ('news', 'announcement', 'patch', 'strategy', 'event')),
  game_id      UUID REFERENCES games(id) ON DELETE SET NULL,
  tags         TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT FALSE,
  is_pinned    BOOLEAN DEFAULT FALSE,
  views        INT DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS news_posts_updated_at ON news_posts;
CREATE TRIGGER news_posts_updated_at
  BEFORE UPDATE ON news_posts
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

CREATE OR REPLACE FUNCTION increment_post_views(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE news_posts SET views = views + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── team_roster ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS team_roster (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  game_id       UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  in_game_role  TEXT,
  jersey_number INT,
  is_captain    BOOLEAN DEFAULT FALSE,
  is_active     BOOLEAN DEFAULT TRUE,
  joined_at     DATE DEFAULT CURRENT_DATE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, game_id)
);

-- ── club_members ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS club_members (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  panel_role TEXT,
  is_founder BOOLEAN DEFAULT FALSE,
  bio        TEXT,
  joined_at  DATE DEFAULT CURRENT_DATE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── tournaments ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tournaments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id           UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  description       TEXT,
  cover_url         TEXT,
  format            TEXT DEFAULT 'single_elimination'
                    CHECK (format IN ('single_elimination', 'double_elimination', 'round_robin', 'swiss')),
  status            TEXT DEFAULT 'upcoming'
                    CHECK (status IN ('upcoming', 'registration', 'ongoing', 'completed', 'cancelled')),
  max_teams         INT,
  prize_pool        TEXT,
  rules_url         TEXT,
  stream_url        TEXT,
  registration_open BOOLEAN DEFAULT FALSE,
  start_date        TIMESTAMPTZ,
  end_date          TIMESTAMPTZ,
  created_by        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS tournaments_updated_at ON tournaments;
CREATE TRIGGER tournaments_updated_at
  BEFORE UPDATE ON tournaments
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- ── tournament_teams ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tournament_teams (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  team_name     TEXT NOT NULL,
  captain_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status        TEXT DEFAULT 'pending'
                CHECK (status IN ('pending', 'approved', 'rejected', 'disqualified')),
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tournament_id, team_name)
);

-- ── tournament_team_members ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tournament_team_members (
  id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES tournament_teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  UNIQUE (team_id, user_id)
);

-- ── matches ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS matches (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  round         INT NOT NULL,
  match_number  INT NOT NULL,
  team1_id      UUID REFERENCES tournament_teams(id) ON DELETE SET NULL,
  team2_id      UUID REFERENCES tournament_teams(id) ON DELETE SET NULL,
  team1_score   INT,
  team2_score   INT,
  winner_id     UUID REFERENCES tournament_teams(id) ON DELETE SET NULL,
  vod_url       TEXT,
  played_at     TIMESTAMPTZ,
  status        TEXT DEFAULT 'scheduled'
                CHECK (status IN ('scheduled', 'live', 'completed', 'forfeit')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── player_stats ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS player_stats (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  game_id     UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  wins        INT DEFAULT 0,
  losses      INT DEFAULT 0,
  draws       INT DEFAULT 0,
  rank_points INT DEFAULT 0,
  season      TEXT DEFAULT '2025',
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, game_id, season)
);

DROP TRIGGER IF EXISTS player_stats_updated_at ON player_stats;
CREATE TRIGGER player_stats_updated_at
  BEFORE UPDATE ON player_stats
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- ── membership_applications ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS membership_applications (
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

-- ── site_settings ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS site_settings_updated_at ON site_settings;
CREATE TRIGGER site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

INSERT INTO site_settings (key, value) VALUES
  ('club_name',            '"Esports Club"'),
  ('club_tagline',         '"Play. Compete. Dominate."'),
  ('announcement_banner',  '{"text": "", "enabled": false}'),
  ('registration_open',    'false'),
  ('social_links',         '{"discord": "", "twitter": "", "youtube": ""}')
ON CONFLICT (key) DO NOTHING;

-- ── audit_log ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  target_type TEXT,
  target_id   UUID,
  metadata    JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── RLS ──────────────────────────────────────────────────────────────────────
ALTER TABLE profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE games                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_games            ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_posts            ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_roster           ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_members          ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments           ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_teams      ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches               ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_stats          ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings         ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log             ENABLE ROW LEVEL SECURITY;

-- Policies — use DO blocks so re-runs don't fail on duplicate_object
DO $$ BEGIN
  CREATE POLICY "profiles_public_read" ON profiles FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "profiles_self_update" ON profiles FOR UPDATE USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "profiles_admin_all" ON profiles FOR ALL USING (is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "games_public_read" ON games FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "games_admin_write" ON games FOR ALL USING (is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "user_games_public_read" ON user_games FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "user_games_owner_write" ON user_games FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "user_games_admin_all" ON user_games FOR ALL USING (is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "news_published_read" ON news_posts FOR SELECT
    USING (is_published = true OR is_mod());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "news_mod_write" ON news_posts FOR ALL USING (is_mod());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "roster_public_read" ON team_roster FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "roster_mod_write" ON team_roster FOR ALL USING (is_mod());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "club_members_public_read" ON club_members FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "club_members_admin_write" ON club_members FOR ALL USING (is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "tournaments_public_read" ON tournaments FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "tournaments_mod_write" ON tournaments FOR ALL USING (is_mod());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "tournament_teams_read" ON tournament_teams FOR SELECT
    USING (status = 'approved' OR auth.uid() = captain_id OR is_mod());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "tournament_teams_member_register" ON tournament_teams FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "tournament_teams_captain_update" ON tournament_teams FOR UPDATE
    USING (auth.uid() = captain_id OR is_mod());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "tournament_teams_mod_all" ON tournament_teams FOR ALL USING (is_mod());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "ttm_public_read" ON tournament_team_members FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "ttm_member_insert" ON tournament_team_members FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "ttm_mod_all" ON tournament_team_members FOR ALL USING (is_mod());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "matches_public_read" ON matches FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "matches_mod_write" ON matches FOR ALL USING (is_mod());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "stats_public_read" ON player_stats FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "stats_mod_write" ON player_stats FOR ALL USING (is_mod());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "applications_public_insert" ON membership_applications FOR INSERT
    WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "applications_owner_read" ON membership_applications FOR SELECT
    USING (auth.uid() = user_id OR is_mod());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "applications_mod_update" ON membership_applications FOR UPDATE
    USING (is_mod());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "settings_public_read" ON site_settings FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "settings_admin_write" ON site_settings FOR ALL USING (is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "audit_admin_read" ON audit_log FOR SELECT USING (is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_news_posts_published   ON news_posts(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_posts_game        ON news_posts(game_id);
CREATE INDEX IF NOT EXISTS idx_news_posts_slug        ON news_posts(slug);
CREATE INDEX IF NOT EXISTS idx_team_roster_game       ON team_roster(game_id, is_active);
CREATE INDEX IF NOT EXISTS idx_player_stats_season    ON player_stats(game_id, season, rank_points DESC);
CREATE INDEX IF NOT EXISTS idx_matches_tournament     ON matches(tournament_id, round);
CREATE INDEX IF NOT EXISTS idx_audit_log_actor        ON audit_log(actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_created      ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_status    ON membership_applications(status, created_at DESC);
