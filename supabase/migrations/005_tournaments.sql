-- 005_tournaments.sql
-- tournaments, team registrations, and match bracket rows

CREATE TABLE tournaments (
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

CREATE TRIGGER tournaments_updated_at
  BEFORE UPDATE ON tournaments
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

CREATE TABLE tournament_teams (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  team_name     TEXT NOT NULL,
  captain_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status        TEXT DEFAULT 'pending'
                CHECK (status IN ('pending', 'approved', 'rejected', 'disqualified')),
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tournament_id, team_name)
);

CREATE TABLE tournament_team_members (
  id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES tournament_teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  UNIQUE (team_id, user_id)
);

CREATE TABLE matches (
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
