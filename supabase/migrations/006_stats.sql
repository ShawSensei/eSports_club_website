-- 006_stats.sql
-- player stats (aggregated per game per season)

CREATE TABLE player_stats (
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

CREATE TRIGGER player_stats_updated_at
  BEFORE UPDATE ON player_stats
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
