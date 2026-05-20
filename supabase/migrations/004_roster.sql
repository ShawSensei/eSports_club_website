-- 004_roster.sql
-- team roster and club membership roles

CREATE TABLE team_roster (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  game_id      UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  in_game_role TEXT,
  jersey_number INT,
  is_captain   BOOLEAN DEFAULT FALSE,
  is_active    BOOLEAN DEFAULT TRUE,
  joined_at    DATE DEFAULT CURRENT_DATE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, game_id)
);

CREATE TABLE club_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  panel_role  TEXT,
  is_founder  BOOLEAN DEFAULT FALSE,
  bio         TEXT,
  joined_at   DATE DEFAULT CURRENT_DATE,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
