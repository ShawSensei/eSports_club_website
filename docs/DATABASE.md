# Database Documentation

## Overview
All data lives in Supabase (PostgreSQL). Row Level Security is enabled on every table.
Never bypass RLS except through the service-role client in server-side admin operations.

---

## Migration Files
Create numbered files in `supabase/migrations/`:
```
001_profiles.sql
002_games.sql
003_news.sql
004_roster.sql
005_tournaments.sql
006_stats.sql
007_applications.sql
008_rls_policies.sql
009_seed.sql
```

---

## Schema

### `profiles` — extends Supabase auth.users
```sql
CREATE TABLE profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username     TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url   TEXT,
  bio          TEXT,
  discord_tag  TEXT,
  role         TEXT NOT NULL DEFAULT 'member'
               CHECK (role IN ('member', 'moderator', 'admin')),
  is_active    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);
-- Trigger: auto-create profile on auth.users insert
-- Trigger: auto-update updated_at on change
```

### `games` — supported games registry
```sql
CREATE TABLE games (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,       -- e.g. 'valorant', 'cs2'
  logo_url      TEXT,
  cover_url     TEXT,
  current_patch TEXT,
  is_supported  BOOLEAN DEFAULT TRUE,       -- toggleable by admin
  sort_order    INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### `user_games` — player's linked game accounts
```sql
CREATE TABLE user_games (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  game_id         UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  in_game_name    TEXT,
  current_rank    TEXT,
  peak_rank       TEXT,
  is_primary      BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, game_id)
);
```

### `news_posts` — club news and announcements
```sql
CREATE TABLE news_posts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  slug         TEXT UNIQUE NOT NULL,
  body         TEXT NOT NULL,              -- Markdown content
  excerpt      TEXT,
  cover_url    TEXT,
  author_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  category     TEXT DEFAULT 'news'
               CHECK (category IN ('news', 'announcement', 'patch', 'strategy', 'event')),
  game_id      UUID REFERENCES games(id) ON DELETE SET NULL,  -- optional: tie to a game
  tags         TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT FALSE,
  is_pinned    BOOLEAN DEFAULT FALSE,
  views        INT DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);
```

### `team_roster` — official team members per game
```sql
CREATE TABLE team_roster (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  game_id       UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  in_game_role  TEXT,                      -- e.g. 'IGL', 'AWPer', 'Support'
  jersey_number INT,
  is_captain    BOOLEAN DEFAULT FALSE,
  is_active     BOOLEAN DEFAULT TRUE,
  joined_at     DATE DEFAULT CURRENT_DATE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, game_id)
);
```

### `club_members` — extended club roles beyond team roster
```sql
CREATE TABLE club_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  panel_role  TEXT,                        -- e.g. 'President', 'Coach', 'Analyst'
  is_founder  BOOLEAN DEFAULT FALSE,
  bio         TEXT,
  joined_at   DATE DEFAULT CURRENT_DATE,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### `tournaments`
```sql
CREATE TABLE tournaments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id         UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  cover_url       TEXT,
  format          TEXT DEFAULT 'single_elimination'
                  CHECK (format IN ('single_elimination', 'double_elimination', 'round_robin', 'swiss')),
  status          TEXT DEFAULT 'upcoming'
                  CHECK (status IN ('upcoming', 'registration', 'ongoing', 'completed', 'cancelled')),
  max_teams       INT,
  prize_pool      TEXT,                    -- free text, e.g. "Gaming peripherals"
  rules_url       TEXT,
  stream_url      TEXT,
  registration_open BOOLEAN DEFAULT FALSE,
  start_date      TIMESTAMPTZ,
  end_date        TIMESTAMPTZ,
  created_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### `tournament_teams` — teams registered for a tournament
```sql
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
```

### `tournament_team_members`
```sql
CREATE TABLE tournament_team_members (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id   UUID NOT NULL REFERENCES tournament_teams(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  UNIQUE (team_id, user_id)
);
```

### `matches`
```sql
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
```

### `player_stats` — aggregated per-game stats
```sql
CREATE TABLE player_stats (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  game_id       UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  wins          INT DEFAULT 0,
  losses        INT DEFAULT 0,
  draws         INT DEFAULT 0,
  rank_points   INT DEFAULT 0,
  season        TEXT DEFAULT '2025',
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, game_id, season)
);
```

### `membership_applications`
```sql
CREATE TABLE membership_applications (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  full_name      TEXT NOT NULL,
  email          TEXT NOT NULL,
  discord_tag    TEXT,
  motivation     TEXT NOT NULL,
  preferred_games UUID[],                  -- array of game IDs
  experience     TEXT,
  availability   TEXT,
  status         TEXT DEFAULT 'pending'
                 CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at    TIMESTAMPTZ,
  notes          TEXT,                     -- internal mod notes
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
```

### `site_settings` — key-value store for admin-configurable settings
```sql
CREATE TABLE site_settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Default rows (insert in seed):
-- { key: 'club_name', value: '"Esports Club"' }
-- { key: 'announcement_banner', value: '{"text":"","enabled":false}' }
-- { key: 'registration_open', value: 'false' }
-- { key: 'social_links', value: '{"discord":"","twitter":"","youtube":""}' }
```

### `audit_log` — mod action trail
```sql
CREATE TABLE audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,              -- e.g. 'news.publish', 'user.role_change'
  target_type TEXT,                       -- e.g. 'news_post', 'profile'
  target_id   UUID,
  metadata    JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

## RLS Policies (Key Examples)

```sql
-- profiles: public read, self-write, admin full access
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_public_read" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_self_update" ON profiles FOR UPDATE
  USING (auth.uid() = id);
CREATE POLICY "profiles_admin_all" ON profiles FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- news_posts: published posts public, mods can write
CREATE POLICY "news_public_read" ON news_posts FOR SELECT
  USING (is_published = true);
CREATE POLICY "news_mod_write" ON news_posts FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')
  ));

-- audit_log: admin read only, system insert via service role
CREATE POLICY "audit_admin_read" ON audit_log FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));
```

---

## Triggers

```sql
-- Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- Auto-update updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;
-- Apply to: profiles, games, news_posts, tournaments, player_stats, site_settings
```

---

## Indexes
```sql
CREATE INDEX idx_news_posts_published ON news_posts(is_published, published_at DESC);
CREATE INDEX idx_news_posts_game ON news_posts(game_id);
CREATE INDEX idx_team_roster_game ON team_roster(game_id, is_active);
CREATE INDEX idx_player_stats_game_season ON player_stats(game_id, season, rank_points DESC);
CREATE INDEX idx_matches_tournament ON matches(tournament_id, round);
CREATE INDEX idx_audit_log_actor ON audit_log(actor_id, created_at DESC);
```

---

## Supabase Storage Buckets
```
avatars/        → user profile pictures (public read, auth write)
covers/         → news/tournament cover images (public read, mod write)
game-assets/    → game logos and covers (public read, admin write)
```
File size limits: 2MB for avatars, 5MB for covers. Accept: image/jpeg, image/png, image/webp.
