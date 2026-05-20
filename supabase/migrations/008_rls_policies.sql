-- 008_rls_policies.sql
-- Enable RLS on all tables, define all policies, create indexes

-- Helper functions to avoid repeating subqueries in every policy
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

-- ── profiles ─────────────────────────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_public_read"   ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_self_update"   ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_admin_all"     ON profiles FOR ALL   USING (is_admin());

-- ── games ────────────────────────────────────────────────────────────────────
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "games_public_read"  ON games FOR SELECT USING (true);
CREATE POLICY "games_admin_write"  ON games FOR ALL    USING (is_admin());

-- ── user_games ───────────────────────────────────────────────────────────────
ALTER TABLE user_games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_games_public_read"  ON user_games FOR SELECT USING (true);
CREATE POLICY "user_games_owner_write"  ON user_games FOR ALL    USING (auth.uid() = user_id);
CREATE POLICY "user_games_admin_all"    ON user_games FOR ALL    USING (is_admin());

-- ── news_posts ───────────────────────────────────────────────────────────────
ALTER TABLE news_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "news_published_read" ON news_posts FOR SELECT
  USING (is_published = true OR is_mod());
CREATE POLICY "news_mod_write"      ON news_posts FOR ALL USING (is_mod());

-- ── team_roster ──────────────────────────────────────────────────────────────
ALTER TABLE team_roster ENABLE ROW LEVEL SECURITY;

CREATE POLICY "roster_public_read"  ON team_roster FOR SELECT USING (true);
CREATE POLICY "roster_mod_write"    ON team_roster FOR ALL    USING (is_mod());

-- ── club_members ─────────────────────────────────────────────────────────────
ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "club_members_public_read"  ON club_members FOR SELECT USING (true);
CREATE POLICY "club_members_admin_write"  ON club_members FOR ALL    USING (is_admin());

-- ── tournaments ──────────────────────────────────────────────────────────────
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tournaments_public_read" ON tournaments FOR SELECT USING (true);
CREATE POLICY "tournaments_mod_write"   ON tournaments FOR ALL    USING (is_mod());

-- ── tournament_teams ─────────────────────────────────────────────────────────
ALTER TABLE tournament_teams ENABLE ROW LEVEL SECURITY;

-- Public sees only approved teams; captain sees own team; mods see all
CREATE POLICY "tournament_teams_read" ON tournament_teams FOR SELECT
  USING (status = 'approved' OR auth.uid() = captain_id OR is_mod());
CREATE POLICY "tournament_teams_member_register" ON tournament_teams FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "tournament_teams_captain_update"  ON tournament_teams FOR UPDATE
  USING (auth.uid() = captain_id OR is_mod());
CREATE POLICY "tournament_teams_mod_all"         ON tournament_teams FOR ALL USING (is_mod());

-- ── tournament_team_members ──────────────────────────────────────────────────
ALTER TABLE tournament_team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ttm_public_read"   ON tournament_team_members FOR SELECT USING (true);
CREATE POLICY "ttm_member_insert" ON tournament_team_members FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "ttm_mod_all"       ON tournament_team_members FOR ALL USING (is_mod());

-- ── matches ──────────────────────────────────────────────────────────────────
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "matches_public_read" ON matches FOR SELECT USING (true);
CREATE POLICY "matches_mod_write"   ON matches FOR ALL    USING (is_mod());

-- ── player_stats ─────────────────────────────────────────────────────────────
ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stats_public_read" ON player_stats FOR SELECT USING (true);
CREATE POLICY "stats_mod_write"   ON player_stats FOR ALL    USING (is_mod());

-- ── membership_applications ──────────────────────────────────────────────────
ALTER TABLE membership_applications ENABLE ROW LEVEL SECURITY;

-- Anyone can apply (including guests with no account)
CREATE POLICY "applications_public_insert" ON membership_applications FOR INSERT
  WITH CHECK (true);
-- Applicant can view own application
CREATE POLICY "applications_owner_read" ON membership_applications FOR SELECT
  USING (auth.uid() = user_id OR is_mod());
-- Mods can update (approve/reject)
CREATE POLICY "applications_mod_update" ON membership_applications FOR UPDATE
  USING (is_mod());

-- ── site_settings ────────────────────────────────────────────────────────────
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "settings_public_read"  ON site_settings FOR SELECT USING (true);
CREATE POLICY "settings_admin_write"  ON site_settings FOR ALL    USING (is_admin());

-- ── audit_log ────────────────────────────────────────────────────────────────
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Admins read; inserts only via service-role client (bypasses RLS)
CREATE POLICY "audit_admin_read" ON audit_log FOR SELECT USING (is_admin());

-- ── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX idx_news_posts_published   ON news_posts(is_published, published_at DESC);
CREATE INDEX idx_news_posts_game        ON news_posts(game_id);
CREATE INDEX idx_news_posts_slug        ON news_posts(slug);
CREATE INDEX idx_team_roster_game       ON team_roster(game_id, is_active);
CREATE INDEX idx_player_stats_season    ON player_stats(game_id, season, rank_points DESC);
CREATE INDEX idx_matches_tournament     ON matches(tournament_id, round);
CREATE INDEX idx_audit_log_actor        ON audit_log(actor_id, created_at DESC);
CREATE INDEX idx_audit_log_created      ON audit_log(created_at DESC);
CREATE INDEX idx_applications_status    ON membership_applications(status, created_at DESC);
