-- ============================================================
-- REMOTE SEED — paste into Supabase SQL Editor and run.
-- This creates all display data needed to see the site working.
--
-- BEFORE RUNNING:
--   1. Go to your site → /register and create your own account
--   2. Come back here and update the SET ROLE block below
--      with your actual email address.
-- ============================================================

-- ── 0. Promote YOUR account to admin ──────────────────────────────────────────
-- Replace 'your@email.com' with the email you used to sign up.
UPDATE profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'your@email.com' LIMIT 1
);

-- ── 1. Site Settings ──────────────────────────────────────────────────────────
INSERT INTO site_settings (key, value) VALUES
  ('club_name',          '"AI Zone Esports"'),
  ('tagline',            '"Play. Compete. Dominate."'),
  ('club_description',   '"A competitive gaming community for players who want to grow, compete, and win together."'),
  ('announcement_banner', '{"enabled": true, "text": "🏆 Spring 2025 Tournament registrations are open! Head to Tournaments to sign up."}'),
  ('social_links',       '{"discord": "https://discord.gg/example", "twitter": "https://twitter.com/example", "youtube": "https://youtube.com/example"}')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ── 2. Games ──────────────────────────────────────────────────────────────────
INSERT INTO games (id, name, slug, current_patch, is_supported, sort_order) VALUES
  ('aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa', 'VALORANT',          'valorant',          'Patch 9.08', TRUE, 1),
  ('aaaaaaaa-0002-0002-0002-aaaaaaaaaaaa', 'Counter-Strike 2',  'cs2',               'v1.39.7',   TRUE, 2),
  ('aaaaaaaa-0003-0003-0003-aaaaaaaaaaaa', 'League of Legends', 'league-of-legends', '14.21',     TRUE, 3)
ON CONFLICT (slug) DO UPDATE SET
  current_patch = EXCLUDED.current_patch,
  is_supported  = EXCLUDED.is_supported,
  sort_order    = EXCLUDED.sort_order;

-- ── 3. Fake auth users (for display data — they cannot log in) ────────────────
-- These exist only to satisfy the FK constraint on profiles.
-- Real logins use accounts created via /register.
INSERT INTO auth.users (
  id, instance_id, aud, role, email,
  encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_user_meta_data
)
VALUES
  ('bbbbbbbb-0001-0001-0001-bbbbbbbbbbbb', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'admin@seed.local',
   '$2a$10$placeholder.hash.only.not.real.bcrypt.value.x', NOW(), NOW(), NOW(),
   '{"username": "clubadmin", "full_name": "Club Admin"}'::jsonb),

  ('bbbbbbbb-0002-0002-0002-bbbbbbbbbbbb', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'mod@seed.local',
   '$2a$10$placeholder.hash.only.not.real.bcrypt.value.x', NOW(), NOW(), NOW(),
   '{"username": "modone", "full_name": "Mod One"}'::jsonb),

  ('bbbbbbbb-0003-0003-0003-bbbbbbbbbbbb', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'ace@seed.local',
   '$2a$10$placeholder.hash.only.not.real.bcrypt.value.x', NOW(), NOW(), NOW(),
   '{"username": "player_ace", "full_name": "Ace"}'::jsonb),

  ('bbbbbbbb-0004-0004-0004-bbbbbbbbbbbb', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'playerx@seed.local',
   '$2a$10$placeholder.hash.only.not.real.bcrypt.value.x', NOW(), NOW(), NOW(),
   '{"username": "player_x", "full_name": "PlayerX"}'::jsonb),

  ('bbbbbbbb-0005-0005-0005-bbbbbbbbbbbb', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'rookie@seed.local',
   '$2a$10$placeholder.hash.only.not.real.bcrypt.value.x', NOW(), NOW(), NOW(),
   '{"username": "rookie", "full_name": "Rookie"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ── 4. Profiles (trigger auto-creates rows — we update them here) ──────────────
UPDATE profiles SET
  display_name = 'Club Admin',
  bio          = 'Founder and admin of AI Zone Esports. Building the best competitive community.',
  role         = 'admin',
  discord_tag  = 'clubadmin#0001',
  is_active    = TRUE
WHERE id = 'bbbbbbbb-0001-0001-0001-bbbbbbbbbbbb';

UPDATE profiles SET
  display_name = 'Mod One',
  bio          = 'Head moderator and content manager. Keeping the vibes good.',
  role         = 'moderator',
  discord_tag  = 'modone#1234',
  is_active    = TRUE
WHERE id = 'bbbbbbbb-0002-0002-0002-bbbbbbbbbbbb';

UPDATE profiles SET
  display_name = 'Ace',
  bio          = 'Top VALORANT fragger. Entry king. Living for the clutch.',
  role         = 'member',
  discord_tag  = 'Ace#9999',
  is_active    = TRUE
WHERE id = 'bbbbbbbb-0003-0003-0003-bbbbbbbbbbbb';

UPDATE profiles SET
  display_name = 'PlayerX',
  bio          = 'CS2 IGL and strategist. Economy is everything.',
  role         = 'member',
  discord_tag  = 'PlayerX#5678',
  is_active    = TRUE
WHERE id = 'bbbbbbbb-0004-0004-0004-bbbbbbbbbbbb';

UPDATE profiles SET
  display_name = 'Rookie',
  bio          = 'Just joined — learning fast. Watch out.',
  role         = 'member',
  discord_tag  = 'Rookie#0000',
  is_active    = TRUE
WHERE id = 'bbbbbbbb-0005-0005-0005-bbbbbbbbbbbb';

-- ── 5. Club Members (founders + leadership) ───────────────────────────────────
INSERT INTO club_members (user_id, panel_role, is_founder, bio, sort_order) VALUES
  ('bbbbbbbb-0001-0001-0001-bbbbbbbbbbbb', 'President', TRUE,  'Founded AI Zone Esports in 2023 with one goal: build the region''s best club.', 1),
  ('bbbbbbbb-0002-0002-0002-bbbbbbbbbbbb', 'Head Coach', FALSE, 'Coaching the teams and managing day-to-day operations.',                        2),
  ('bbbbbbbb-0003-0003-0003-bbbbbbbbbbbb', 'Team Captain', FALSE, 'Leading the VALORANT squad since Season 1.',                                  3)
ON CONFLICT (user_id) DO UPDATE SET
  panel_role = EXCLUDED.panel_role,
  is_founder = EXCLUDED.is_founder,
  bio        = EXCLUDED.bio,
  sort_order = EXCLUDED.sort_order;

-- ── 6. Team Roster ────────────────────────────────────────────────────────────
INSERT INTO team_roster (user_id, game_id, in_game_role, jersey_number, is_captain, is_active, joined_at) VALUES
  ('bbbbbbbb-0003-0003-0003-bbbbbbbbbbbb', 'aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa', 'Duelist', 7,  TRUE,  TRUE, CURRENT_DATE - 180),
  ('bbbbbbbb-0005-0005-0005-bbbbbbbbbbbb', 'aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa', 'Support', 12, FALSE, TRUE, CURRENT_DATE - 90),
  ('bbbbbbbb-0001-0001-0001-bbbbbbbbbbbb', 'aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa', 'Controller', 1, FALSE, TRUE, CURRENT_DATE - 200),
  ('bbbbbbbb-0004-0004-0004-bbbbbbbbbbbb', 'aaaaaaaa-0002-0002-0002-aaaaaaaaaaaa', 'IGL',     3,  TRUE,  TRUE, CURRENT_DATE - 150),
  ('bbbbbbbb-0002-0002-0002-bbbbbbbbbbbb', 'aaaaaaaa-0002-0002-0002-aaaaaaaaaaaa', 'AWPer',   9,  FALSE, TRUE, CURRENT_DATE - 120)
ON CONFLICT (user_id, game_id) DO UPDATE SET
  in_game_role   = EXCLUDED.in_game_role,
  jersey_number  = EXCLUDED.jersey_number,
  is_captain     = EXCLUDED.is_captain,
  is_active      = EXCLUDED.is_active;

-- ── 7. User Game Accounts ─────────────────────────────────────────────────────
INSERT INTO user_games (user_id, game_id, in_game_name, current_rank, peak_rank, is_primary) VALUES
  ('bbbbbbbb-0003-0003-0003-bbbbbbbbbbbb', 'aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa', 'Ace#VAL',   'Immortal 2',  'Radiant',    TRUE),
  ('bbbbbbbb-0004-0004-0004-bbbbbbbbbbbb', 'aaaaaaaa-0002-0002-0002-aaaaaaaaaaaa', 'PlayerX',   'Global Elite','Global Elite',TRUE),
  ('bbbbbbbb-0005-0005-0005-bbbbbbbbbbbb', 'aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa', 'Rookie#9',  'Gold 2',      'Platinum 1', TRUE),
  ('bbbbbbbb-0001-0001-0001-bbbbbbbbbbbb', 'aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa', 'Admin#777', 'Diamond 1',   'Immortal 1', TRUE),
  ('bbbbbbbb-0002-0002-0002-bbbbbbbbbbbb', 'aaaaaaaa-0002-0002-0002-aaaaaaaaaaaa', 'ModOne',    'Supreme',     'Global Elite',TRUE)
ON CONFLICT (user_id, game_id) DO UPDATE SET
  in_game_name = EXCLUDED.in_game_name,
  current_rank = EXCLUDED.current_rank,
  peak_rank    = EXCLUDED.peak_rank;

-- ── 8. Player Stats (Leaderboard) ─────────────────────────────────────────────
INSERT INTO player_stats (user_id, game_id, wins, losses, draws, rank_points, season) VALUES
  ('bbbbbbbb-0003-0003-0003-bbbbbbbbbbbb', 'aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa', 62, 21, 0, 3100, '2025'),
  ('bbbbbbbb-0001-0001-0001-bbbbbbbbbbbb', 'aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa', 48, 28, 2, 2400, '2025'),
  ('bbbbbbbb-0005-0005-0005-bbbbbbbbbbbb', 'aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa', 14, 38, 3,  700, '2025'),
  ('bbbbbbbb-0004-0004-0004-bbbbbbbbbbbb', 'aaaaaaaa-0002-0002-0002-aaaaaaaaaaaa', 45, 19, 6, 2850, '2025'),
  ('bbbbbbbb-0002-0002-0002-bbbbbbbbbbbb', 'aaaaaaaa-0002-0002-0002-aaaaaaaaaaaa', 38, 24, 4, 2200, '2025')
ON CONFLICT (user_id, game_id, season) DO UPDATE SET
  wins        = EXCLUDED.wins,
  losses      = EXCLUDED.losses,
  draws       = EXCLUDED.draws,
  rank_points = EXCLUDED.rank_points;

-- ── 9. News Posts ─────────────────────────────────────────────────────────────
INSERT INTO news_posts (id, title, slug, body, excerpt, author_id, category, game_id, tags, is_published, is_pinned, published_at) VALUES
  (
    'cccccccc-0001-0001-0001-cccccccccccc',
    'Welcome to AI Zone Esports!',
    'welcome-to-ai-zone-esports',
    E'# Welcome to AI Zone Esports\n\nWe are thrilled to launch our official website. This is your hub for all things competitive gaming — news, tournaments, rosters, and more.\n\n## What to expect\n\n- **Weekly news** on patches, strategies, and club events\n- **Tournament brackets** updated in real-time\n- **Leaderboards** that sync live with match results\n\nStay tuned and register to join the club!',
    'Our official website is live. Find news, tournaments, and leaderboards all in one place.',
    'bbbbbbbb-0001-0001-0001-bbbbbbbbbbbb', 'announcement', NULL,
    ARRAY['launch', 'welcome'], TRUE, TRUE, NOW() - INTERVAL '7 days'
  ),
  (
    'cccccccc-0002-0002-0002-cccccccccccc',
    'VALORANT Patch 9.08 — What Changed?',
    'valorant-patch-9-08-breakdown',
    E'# VALORANT Patch 9.08 Breakdown\n\nRiot Games dropped a significant patch this week. Here''s what our analysts found.\n\n## Agent Changes\n- **Jett** dash cooldown increased by 0.5s\n- **Killjoy** turret damage reduced by 10%\n\n## Map Pool\n- Lotus returns to competitive rotation\n- Bind removed temporarily for updates\n\n## Our Take\nThe Jett nerf opens up duelist diversity. Expect to see more Raze and Neon picks in ranked.',
    'Patch 9.08 nerfs Jett, adjusts Killjoy, and shakes up the map pool. Our breakdown inside.',
    'bbbbbbbb-0002-0002-0002-bbbbbbbbbbbb', 'patch',
    'aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa',
    ARRAY['valorant', 'patch-notes', 'meta'], TRUE, FALSE, NOW() - INTERVAL '4 days'
  ),
  (
    'cccccccc-0003-0003-0003-cccccccccccc',
    'Club VALORANT Team Places Top 4 in Regional',
    'valorant-team-top-4-regional',
    E'# Club VALORANT Team Places Top 4 in Regional Tournament\n\nOur VALORANT squad had an incredible run in last weekend''s regional invitational, finishing in the top 4 out of 32 teams.\n\n## Match Results\n- **vs Team Alpha** — Won 2-0\n- **vs Ghost Squad** — Won 2-1\n- **vs Neon Rush** — Won 2-0\n- **Semifinal vs The Collective** — Lost 1-2\n\n## Player Highlights\nAce posted a 1.45 ACS across all maps. Rookie showed massive improvement in clutch rounds.\n\nCongratulations to the whole squad!',
    'Our VALORANT team finishes top 4 in the regional invitational out of 32 competing teams.',
    'bbbbbbbb-0001-0001-0001-bbbbbbbbbbbb', 'news',
    'aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa',
    ARRAY['valorant', 'tournament', 'results'], TRUE, FALSE, NOW() - INTERVAL '2 days'
  ),
  (
    'cccccccc-0004-0004-0004-cccccccccccc',
    'CS2 IGL Guide: Economy Management in 2025',
    'cs2-igl-economy-guide-2025',
    E'# CS2 IGL Guide: Economy Management in 2025\n\nManaging economy as an IGL is the difference between winning and losing close matches. PlayerX shares his framework.\n\n## The Core Principle\nNever let your team full-buy into a loss. A disciplined force-buy beats an undisciplined full-buy every time.\n\n## Round Types\n1. **Full Buy** — 5+ players with rifles + full utility\n2. **Force Buy** — 3-4 players with SMGs/pistols\n3. **Eco** — Save everything, use pistols only\n\n## Decision Framework\nAfter losing a round with full equipment, always eco the next round unless you saved 3+ rifles.',
    'PlayerX breaks down CS2 economy management — the framework our IGL uses to win close matches.',
    'bbbbbbbb-0002-0002-0002-bbbbbbbbbbbb', 'strategy',
    'aaaaaaaa-0002-0002-0002-aaaaaaaaaaaa',
    ARRAY['cs2', 'strategy', 'igl'], TRUE, FALSE, NOW() - INTERVAL '5 days'
  ),
  (
    'cccccccc-0005-0005-0005-cccccccccccc',
    'Spring 2025 Tournament — Registration Open',
    'spring-2025-tournament-registration',
    E'# Spring 2025 Tournament — Registration Now Open\n\nOur biggest internal tournament of the year is here. Register your team before spots fill up!\n\n## Details\n- **Format:** Single Elimination\n- **Game:** VALORANT\n- **Teams:** Up to 16 teams\n- **Prize:** Gaming peripherals for winners\n- **Dates:** Matches begin June 1, 2025\n\n## How to Register\nHead to the Tournaments page and click Register on the Spring 2025 event. Good luck!',
    'Registration is now open for our Spring 2025 internal tournament. Limited spots — sign up now.',
    'bbbbbbbb-0001-0001-0001-bbbbbbbbbbbb', 'event', NULL,
    ARRAY['tournament', 'registration', 'spring-2025'], TRUE, FALSE, NOW() - INTERVAL '1 day'
  )
ON CONFLICT (slug) DO UPDATE SET
  body        = EXCLUDED.body,
  excerpt     = EXCLUDED.excerpt,
  is_published = EXCLUDED.is_published,
  is_pinned   = EXCLUDED.is_pinned,
  published_at = EXCLUDED.published_at;

-- ── 10. Tournaments ───────────────────────────────────────────────────────────
INSERT INTO tournaments (id, game_id, name, description, format, status, max_teams, prize_pool, registration_open, start_date, end_date, created_by) VALUES
  (
    'dddddddd-0001-0001-0001-dddddddddddd',
    'aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa',
    'Spring 2025 VALORANT Cup',
    'Our flagship internal VALORANT tournament. Single elimination, best-of-3 from quarterfinals. Open to all registered members.',
    'single_elimination', 'registration', 16,
    'Gaming peripherals for the winning team',
    TRUE,
    NOW() + INTERVAL '12 days',
    NOW() + INTERVAL '19 days',
    'bbbbbbbb-0001-0001-0001-bbbbbbbbbbbb'
  ),
  (
    'dddddddd-0002-0002-0002-dddddddddddd',
    'aaaaaaaa-0002-0002-0002-aaaaaaaaaaaa',
    'Winter 2024 CS2 Championship',
    'Our completed CS2 championship from last season. PlayerX''s squad won in dominant fashion.',
    'single_elimination', 'completed', 8,
    '$200 store credit',
    FALSE,
    NOW() - INTERVAL '60 days',
    NOW() - INTERVAL '53 days',
    'bbbbbbbb-0001-0001-0001-bbbbbbbbbbbb'
  )
ON CONFLICT (id) DO UPDATE SET
  name              = EXCLUDED.name,
  status            = EXCLUDED.status,
  registration_open = EXCLUDED.registration_open;

-- ── 11. Tournament Teams (for the completed CS2 tournament) ───────────────────
INSERT INTO tournament_teams (id, tournament_id, team_name, captain_id, status, registered_at) VALUES
  ('eeeeeeee-0001-0001-0001-eeeeeeeeeeee', 'dddddddd-0002-0002-0002-dddddddddddd', 'Stack Overflow',  'bbbbbbbb-0004-0004-0004-bbbbbbbbbbbb', 'approved', NOW() - INTERVAL '70 days'),
  ('eeeeeeee-0002-0002-0002-eeeeeeeeeeee', 'dddddddd-0002-0002-0002-dddddddddddd', 'No Scope Kings',  'bbbbbbbb-0002-0002-0002-bbbbbbbbbbbb', 'approved', NOW() - INTERVAL '70 days'),
  ('eeeeeeee-0003-0003-0003-eeeeeeeeeeee', 'dddddddd-0002-0002-0002-dddddddddddd', 'Headshot Heroes', 'bbbbbbbb-0001-0001-0001-bbbbbbbbbbbb', 'approved', NOW() - INTERVAL '69 days'),
  ('eeeeeeee-0004-0004-0004-eeeeeeeeeeee', 'dddddddd-0002-0002-0002-dddddddddddd', 'The Flickers',    'bbbbbbbb-0003-0003-0003-bbbbbbbbbbbb', 'approved', NOW() - INTERVAL '69 days')
ON CONFLICT (tournament_id, team_name) DO NOTHING;

-- ── 12. Matches (completed CS2 bracket) ──────────────────────────────────────
INSERT INTO matches (tournament_id, round, match_number, team1_id, team2_id, team1_score, team2_score, winner_id, status, played_at) VALUES
  -- Semifinals
  ('dddddddd-0002-0002-0002-dddddddddddd', 1, 1,
   'eeeeeeee-0001-0001-0001-eeeeeeeeeeee', 'eeeeeeee-0004-0004-0004-eeeeeeeeeeee',
   2, 0, 'eeeeeeee-0001-0001-0001-eeeeeeeeeeee', 'completed', NOW() - INTERVAL '56 days'),
  ('dddddddd-0002-0002-0002-dddddddddddd', 1, 2,
   'eeeeeeee-0002-0002-0002-eeeeeeeeeeee', 'eeeeeeee-0003-0003-0003-eeeeeeeeeeee',
   1, 2, 'eeeeeeee-0003-0003-0003-eeeeeeeeeeee', 'completed', NOW() - INTERVAL '56 days'),
  -- Final
  ('dddddddd-0002-0002-0002-dddddddddddd', 2, 1,
   'eeeeeeee-0001-0001-0001-eeeeeeeeeeee', 'eeeeeeee-0003-0003-0003-eeeeeeeeeeee',
   2, 1, 'eeeeeeee-0001-0001-0001-eeeeeeeeeeee', 'completed', NOW() - INTERVAL '53 days');

-- ── 13. Sample Membership Application ────────────────────────────────────────
INSERT INTO membership_applications (full_name, email, discord_tag, motivation, preferred_games, experience, availability, status)
VALUES (
  'Alex Johnson',
  'alex@example.com',
  'AlexJ#4421',
  'I have been playing VALORANT competitively for 2 years and want to join a structured club to improve and compete at a higher level. I love the community aspect of esports clubs.',
  ARRAY['VALORANT', 'League of Legends'],
  'Former captain of my university esports team. Peaked Immortal 1 in VALORANT.',
  '10–20 hours/week',
  'pending'
) ON CONFLICT DO NOTHING;

-- ── Done! ─────────────────────────────────────────────────────────────────────
-- You should now see:
--   /           → hero, news highlights, tournament, stats bar
--   /news       → 5 published posts
--   /games      → 3 supported games
--   /roster     → 5 players across 2 games
--   /members    → 3 club members (1 founder)
--   /leaderboard → ranked stats for 5 players
--   /tournaments → 1 registration-open + 1 completed
--   /admin      → login with your account (promoted to admin above)
