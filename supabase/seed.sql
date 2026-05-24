-- supabase/seed.sql
-- Development seed data. Run via: supabase db reset
-- NOTE: Inserts into profiles directly (bypassing auth trigger).
-- Create real users via Supabase Auth dashboard or /register, then update their role as needed.

-- ── Games ─────────────────────────────────────────────────────────────────────
INSERT INTO games (id, name, slug, current_patch, is_supported, sort_order) VALUES
  ('aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa', 'VALORANT',        'valorant', 'Patch 9.08', TRUE, 1),
  ('aaaaaaaa-0002-0002-0002-aaaaaaaaaaaa', 'Counter-Strike 2','cs2',      'v1.39.7',   TRUE, 2),
  ('aaaaaaaa-0003-0003-0003-aaaaaaaaaaaa', 'League of Legends','league-of-legends', '14.21', TRUE, 3)
ON CONFLICT (slug) DO NOTHING;

-- ── Seed Profiles (no matching auth.users — dev only) ────────────────────────
INSERT INTO profiles (id, username, display_name, bio, role, discord_tag, is_active) VALUES
  ('bbbbbbbb-0001-0001-0001-bbbbbbbbbbbb', 'admin',      'Club Admin',    'Founder and admin of the esports club.', 'admin',     'admin#0001',   TRUE),
  ('bbbbbbbb-0002-0002-0002-bbbbbbbbbbbb', 'moderator1', 'Mod One',       'Head moderator and content manager.',    'moderator', 'modone#1234',  TRUE),
  ('bbbbbbbb-0003-0003-0003-bbbbbbbbbbbb', 'player_ace', 'Ace',           'Top VALORANT fragger.',                  'member',    'Ace#9999',     TRUE),
  ('bbbbbbbb-0004-0004-0004-bbbbbbbbbbbb', 'player_x',   'PlayerX',       'CS2 IGL and strategist.',                'member',    'PlayerX#5678', TRUE),
  ('bbbbbbbb-0005-0005-0005-bbbbbbbbbbbb', 'rookie',     'Rookie',        'Just joined — learning fast.',           'member',    'Rookie#0000',  TRUE)
ON CONFLICT (id) DO NOTHING;

-- ── Club Members ─────────────────────────────────────────────────────────────
INSERT INTO club_members (user_id, panel_role, is_founder, sort_order) VALUES
  ('bbbbbbbb-0001-0001-0001-bbbbbbbbbbbb', 'President', TRUE,  1),
  ('bbbbbbbb-0002-0002-0002-bbbbbbbbbbbb', 'Coach',     FALSE, 2)
ON CONFLICT (user_id) DO NOTHING;

-- ── Team Roster ───────────────────────────────────────────────────────────────
INSERT INTO team_roster (user_id, game_id, in_game_role, is_captain, is_active) VALUES
  ('bbbbbbbb-0003-0003-0003-bbbbbbbbbbbb', 'aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa', 'Duelist',  TRUE,  TRUE),
  ('bbbbbbbb-0004-0004-0004-bbbbbbbbbbbb', 'aaaaaaaa-0002-0002-0002-aaaaaaaaaaaa', 'IGL',      TRUE,  TRUE),
  ('bbbbbbbb-0005-0005-0005-bbbbbbbbbbbb', 'aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa', 'Support',  FALSE, TRUE)
ON CONFLICT (user_id, game_id) DO NOTHING;

-- ── Player Stats ──────────────────────────────────────────────────────────────
INSERT INTO player_stats (user_id, game_id, wins, losses, draws, rank_points, season) VALUES
  ('bbbbbbbb-0003-0003-0003-bbbbbbbbbbbb', 'aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa', 42, 18, 0, 2100, '2025'),
  ('bbbbbbbb-0004-0004-0004-bbbbbbbbbbbb', 'aaaaaaaa-0002-0002-0002-aaaaaaaaaaaa', 31, 22, 5, 1850, '2025'),
  ('bbbbbbbb-0005-0005-0005-bbbbbbbbbbbb', 'aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa', 10, 30, 2,  600, '2025')
ON CONFLICT (user_id, game_id, season) DO NOTHING;

-- ── News Posts ────────────────────────────────────────────────────────────────
INSERT INTO news_posts (id, title, slug, body, excerpt, author_id, category, game_id, tags, is_published, is_pinned, published_at) VALUES
  (
    'cccccccc-0001-0001-0001-cccccccccccc',
    'Welcome to Esports Club!',
    'welcome-to-esports-club',
    '# Welcome to Esports Club

We are thrilled to launch our official website. This is your hub for all things competitive gaming — news, tournaments, rosters, and more.

## What to expect

- **Weekly news** on patches, strategies, and club events
- **Tournament brackets** updated in real-time
- **Leaderboards** that sync live with match results

Stay tuned and register to join the club!',
    'Our official website is live. Find news, tournaments, and leaderboards all in one place.',
    'bbbbbbbb-0001-0001-0001-bbbbbbbbbbbb',
    'announcement',
    NULL,
    ARRAY['launch', 'welcome'],
    TRUE, TRUE, NOW() - INTERVAL '7 days'
  ),
  (
    'cccccccc-0002-0002-0002-cccccccccccc',
    'VALORANT Patch 9.08 — What Changed?',
    'valorant-patch-9-08-breakdown',
    '# VALORANT Patch 9.08 Breakdown

Riot Games dropped a significant patch this week. Here''s what our analysts found.

## Agent Changes
- **Jett** dash cooldown increased by 0.5s
- **Killjoy** turret damage reduced by 10%

## Map Pool
- Lotus returns to competitive rotation
- Bind removed temporarily for updates

## Our Take
The Jett nerf opens up duelist diversity. Expect to see more Raze and Neon picks in ranked.',
    'Patch 9.08 nerfs Jett, adjusts Killjoy, and shakes up the map pool. Our breakdown inside.',
    'bbbbbbbb-0002-0002-0002-bbbbbbbbbbbb',
    'patch',
    'aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa',
    ARRAY['valorant', 'patch-notes', 'meta'],
    TRUE, FALSE, NOW() - INTERVAL '3 days'
  ),
  (
    'cccccccc-0003-0003-0003-cccccccccccc',
    'Club VALORANT Team Places Top 4 in Regional',
    'valorant-team-top-4-regional',
    '# Club VALORANT Team Places Top 4 in Regional Tournament

Our VALORANT squad had an incredible run in last weekend''s regional invitational, finishing in the top 4 out of 32 teams.

## Match Results
- **vs Team Alpha** — Won 2-0
- **vs Ghost Squad** — Won 2-1
- **vs Neon Rush** — Won 2-0
- **Semifinal vs The Collective** — Lost 1-2

## Player Highlights
Ace posted a 1.45 ACS across all maps. Rookie showed massive improvement in clutch rounds.

Congratulations to the whole squad — we are proud of you!',
    'Our VALORANT team finishes top 4 in the regional invitational out of 32 competing teams.',
    'bbbbbbbb-0001-0001-0001-bbbbbbbbbbbb',
    'news',
    'aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa',
    ARRAY['valorant', 'tournament', 'results'],
    TRUE, FALSE, NOW() - INTERVAL '1 day'
  ),
  (
    'cccccccc-0004-0004-0004-cccccccccccc',
    'CS2 IGL Guide: Economy Management in 2025',
    'cs2-igl-economy-guide-2025',
    '# CS2 IGL Guide: Economy Management in 2025

Managing economy as an IGL is the difference between winning and losing close matches. PlayerX shares his framework.

## The Core Principle
Never let your team full-buy into a loss. A disciplined force-buy beats an undisciplined full-buy every time.

## Round Types
1. **Full Buy** — 5+ players with rifles + full utility
2. **Force Buy** — 3-4 players with SMGs/pistols
3. **Eco** — Save everything, use pistols only
4. **Half Buy** — Flexible, one rifle + pistols

## Decision Framework
After losing a round with full equipment, always eco the next round unless you saved 3+ rifles.',
    'PlayerX breaks down CS2 economy management — the framework our IGL uses to win close matches.',
    'bbbbbbbb-0002-0002-0002-bbbbbbbbbbbb',
    'strategy',
    'aaaaaaaa-0002-0002-0002-aaaaaaaaaaaa',
    ARRAY['cs2', 'strategy', 'igl', 'economy'],
    TRUE, FALSE, NOW() - INTERVAL '5 days'
  ),
  (
    'cccccccc-0005-0005-0005-cccccccccccc',
    'Spring 2025 Internal Tournament — Registration Open',
    'spring-2025-tournament-registration',
    '# Spring 2025 Internal Tournament — Registration Now Open

Our biggest internal tournament of the year is here. Register your team before spots fill up!

## Details
- **Format:** Single Elimination
- **Games:** VALORANT, CS2
- **Teams:** Up to 16 per game
- **Prize:** Gaming peripherals for winners
- **Dates:** Matches begin June 1, 2025

## How to Register
Head to the Tournaments page and click Register on the Spring 2025 event. You need a minimum of 5 players per team.

Good luck to all participants!',
    'Registration is now open for our Spring 2025 internal tournament. Limited spots — sign up now.',
    'bbbbbbbb-0001-0001-0001-bbbbbbbbbbbb',
    'event',
    NULL,
    ARRAY['tournament', 'registration', 'spring-2025'],
    TRUE, FALSE, NOW() - INTERVAL '2 days'
  )
ON CONFLICT (slug) DO NOTHING;

-- ── Tournament captain profiles ───────────────────────────────────────────────
INSERT INTO profiles (id, username, display_name, bio, role, discord_tag, is_active) VALUES
  ('eeeeeeee-0001-0001-0001-eeeeeeeeeeee', 'cap_alpha',    'Striker',    'Alpha Squad IGL.',          'member', 'Striker#0001',  TRUE),
  ('eeeeeeee-0002-0002-0002-eeeeeeeeeeee', 'cap_ghost',    'Phantom',    'Ghost Squad fragger.',      'member', 'Phantom#0002',  TRUE),
  ('eeeeeeee-0003-0003-0003-eeeeeeeeeeee', 'cap_neon',     'Voltage',    'Neon Rush entry fragger.',  'member', 'Voltage#0003',  TRUE),
  ('eeeeeeee-0004-0004-0004-eeeeeeeeeeee', 'cap_collect',  'Oracle',     'The Collective tactician.', 'member', 'Oracle#0004',   TRUE),
  ('eeeeeeee-0005-0005-0005-eeeeeeeeeeee', 'cap_iron',     'Ironclad',   'Iron Fist in-game leader.', 'member', 'Ironclad#0005', TRUE),
  ('eeeeeeee-0006-0006-0006-eeeeeeeeeeee', 'cap_shadow',   'Spectre',    'Shadow Protocol lurker.',   'member', 'Spectre#0006',  TRUE),
  ('eeeeeeee-0007-0007-0007-eeeeeeeeeeee', 'cap_cyber',    'Byte',       'Cyber Wolves sentinel.',    'member', 'Byte#0007',     TRUE),
  ('eeeeeeee-0008-0008-0008-eeeeeeeeeeee', 'cap_storm',    'Tempest',    'Storm Riders duelist.',     'member', 'Tempest#0008',  TRUE)
ON CONFLICT (id) DO NOTHING;

-- ── Tournaments ───────────────────────────────────────────────────────────────
INSERT INTO tournaments (id, game_id, name, description, format, status, max_teams, prize_pool, registration_open, start_date, end_date, created_by) VALUES
  (
    'dddddddd-0001-0001-0001-dddddddddddd',
    'aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa',
    'Spring 2025 VALORANT Cup',
    'Our flagship internal VALORANT tournament. 8 teams, single elimination, best-of-3 from semifinals. Quarterfinals are best-of-1.',
    'single_elimination',
    'ongoing',
    8,
    'Gaming peripherals for the winning team',
    FALSE,
    NOW() - INTERVAL '2 days',
    NOW() + INTERVAL '5 days',
    'bbbbbbbb-0001-0001-0001-bbbbbbbbbbbb'
  ),
  (
    'dddddddd-0002-0002-0002-dddddddddddd',
    'aaaaaaaa-0002-0002-0002-aaaaaaaaaaaa',
    'CS2 Winter League 2025',
    'Round-robin group stage followed by a single-elimination playoff bracket. Open to all club members.',
    'round_robin',
    'registration',
    16,
    'Cash prize pool: BDT 5,000',
    TRUE,
    NOW() + INTERVAL '10 days',
    NOW() + INTERVAL '24 days',
    'bbbbbbbb-0001-0001-0001-bbbbbbbbbbbb'
  )
ON CONFLICT (id) DO NOTHING;

-- ── Tournament teams (VALORANT Cup — 8 approved) ──────────────────────────────
INSERT INTO tournament_teams (id, tournament_id, team_name, captain_id, status, registered_at) VALUES
  ('ffffffff-0001-0001-0001-ffffffffffff', 'dddddddd-0001-0001-0001-dddddddddddd', 'Alpha Squad',      'eeeeeeee-0001-0001-0001-eeeeeeeeeeee', 'approved', NOW() - INTERVAL '5 days'),
  ('ffffffff-0002-0002-0002-ffffffffffff', 'dddddddd-0001-0001-0001-dddddddddddd', 'Ghost Squad',      'eeeeeeee-0002-0002-0002-eeeeeeeeeeee', 'approved', NOW() - INTERVAL '5 days'),
  ('ffffffff-0003-0003-0003-ffffffffffff', 'dddddddd-0001-0001-0001-dddddddddddd', 'Neon Rush',        'eeeeeeee-0003-0003-0003-eeeeeeeeeeee', 'approved', NOW() - INTERVAL '4 days'),
  ('ffffffff-0004-0004-0004-ffffffffffff', 'dddddddd-0001-0001-0001-dddddddddddd', 'The Collective',   'eeeeeeee-0004-0004-0004-eeeeeeeeeeee', 'approved', NOW() - INTERVAL '4 days'),
  ('ffffffff-0005-0005-0005-ffffffffffff', 'dddddddd-0001-0001-0001-dddddddddddd', 'Iron Fist',        'eeeeeeee-0005-0005-0005-eeeeeeeeeeee', 'approved', NOW() - INTERVAL '4 days'),
  ('ffffffff-0006-0006-0006-ffffffffffff', 'dddddddd-0001-0001-0001-dddddddddddd', 'Shadow Protocol',  'eeeeeeee-0006-0006-0006-eeeeeeeeeeee', 'approved', NOW() - INTERVAL '3 days'),
  ('ffffffff-0007-0007-0007-ffffffffffff', 'dddddddd-0001-0001-0001-dddddddddddd', 'Cyber Wolves',     'eeeeeeee-0007-0007-0007-eeeeeeeeeeee', 'approved', NOW() - INTERVAL '3 days'),
  ('ffffffff-0008-0008-0008-ffffffffffff', 'dddddddd-0001-0001-0001-dddddddddddd', 'Storm Riders',     'eeeeeeee-0008-0008-0008-eeeeeeeeeeee', 'approved', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

-- ── Matches — Spring 2025 VALORANT Cup ────────────────────────────────────────
-- Seeding: 1vBye→→ standard bracket: R1: 1v8, 4v5, 2v7, 3v6
-- R1 results: Alpha 13-8, Collective 13-10, Ghost 13-7, Neon 13-11
-- R2: Alpha vs Collective (LIVE), Ghost vs Neon (scheduled)
-- Final: TBD (scheduled, no teams yet)

INSERT INTO matches (id, tournament_id, round, match_number, team1_id, team2_id, team1_score, team2_score, winner_id, status, played_at, vod_url) VALUES
  -- Round 1 (completed)
  (
    'mmmmmmmm-0001-0001-0001-mmmmmmmmmmmm',
    'dddddddd-0001-0001-0001-dddddddddddd',
    1, 1,
    'ffffffff-0001-0001-0001-ffffffffffff',  -- Alpha Squad (seed 1)
    'ffffffff-0008-0008-0008-ffffffffffff',  -- Storm Riders (seed 8)
    13, 8,
    'ffffffff-0001-0001-0001-ffffffffffff',  -- Alpha Squad wins
    'completed',
    NOW() - INTERVAL '1 day 6 hours',
    NULL
  ),
  (
    'mmmmmmmm-0002-0002-0002-mmmmmmmmmmmm',
    'dddddddd-0001-0001-0001-dddddddddddd',
    1, 2,
    'ffffffff-0004-0004-0004-ffffffffffff',  -- The Collective (seed 4)
    'ffffffff-0005-0005-0005-ffffffffffff',  -- Iron Fist (seed 5)
    13, 10,
    'ffffffff-0004-0004-0004-ffffffffffff',  -- The Collective wins
    'completed',
    NOW() - INTERVAL '1 day 5 hours',
    NULL
  ),
  (
    'mmmmmmmm-0003-0003-0003-mmmmmmmmmmmm',
    'dddddddd-0001-0001-0001-dddddddddddd',
    1, 3,
    'ffffffff-0002-0002-0002-ffffffffffff',  -- Ghost Squad (seed 2)
    'ffffffff-0007-0007-0007-ffffffffffff',  -- Cyber Wolves (seed 7)
    13, 7,
    'ffffffff-0002-0002-0002-ffffffffffff',  -- Ghost Squad wins
    'completed',
    NOW() - INTERVAL '1 day 4 hours',
    NULL
  ),
  (
    'mmmmmmmm-0004-0004-0004-mmmmmmmmmmmm',
    'dddddddd-0001-0001-0001-dddddddddddd',
    1, 4,
    'ffffffff-0003-0003-0003-ffffffffffff',  -- Neon Rush (seed 3)
    'ffffffff-0006-0006-0006-ffffffffffff',  -- Shadow Protocol (seed 6)
    13, 11,
    'ffffffff-0003-0003-0003-ffffffffffff',  -- Neon Rush wins
    'completed',
    NOW() - INTERVAL '1 day 3 hours',
    NULL
  ),
  -- Round 2 (semifinal)
  (
    'mmmmmmmm-0005-0005-0005-mmmmmmmmmmmm',
    'dddddddd-0001-0001-0001-dddddddddddd',
    2, 1,
    'ffffffff-0001-0001-0001-ffffffffffff',  -- Alpha Squad
    'ffffffff-0004-0004-0004-ffffffffffff',  -- The Collective
    NULL, NULL, NULL,
    'live',
    NULL,
    NULL
  ),
  (
    'mmmmmmmm-0006-0006-0006-mmmmmmmmmmmm',
    'dddddddd-0001-0001-0001-dddddddddddd',
    2, 2,
    'ffffffff-0002-0002-0002-ffffffffffff',  -- Ghost Squad
    'ffffffff-0003-0003-0003-ffffffffffff',  -- Neon Rush
    NULL, NULL, NULL,
    'scheduled',
    NULL,
    NULL
  ),
  -- Round 3 (final) — teams TBD
  (
    'mmmmmmmm-0007-0007-0007-mmmmmmmmmmmm',
    'dddddddd-0001-0001-0001-dddddddddddd',
    3, 1,
    NULL, NULL,
    NULL, NULL, NULL,
    'scheduled',
    NULL,
    NULL
  )
ON CONFLICT (id) DO NOTHING;

-- ── Site Settings (update defaults if already inserted by migration 007) ──────
UPDATE site_settings SET value = '"Esports Club"'                        WHERE key = 'club_name';
UPDATE site_settings SET value = '"Play. Compete. Dominate."'            WHERE key = 'club_tagline';
UPDATE site_settings SET value = '{"text":"Welcome to the new website! Apply now to join the club.", "enabled": true}'
  WHERE key = 'announcement_banner';
