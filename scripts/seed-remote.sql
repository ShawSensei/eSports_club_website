-- scripts/seed-remote.sql
-- Run this in Supabase Dashboard → SQL Editor.
-- Uses the real admin user ID. Paste your user ID below if it differs.

DO $$
DECLARE
  admin_id UUID := 'dce97af5-9a6e-40eb-9f7e-fc6a2071d463'; -- masudworkspace@gmail.com
  val_id   UUID := 'aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa';
  cs2_id   UUID := 'aaaaaaaa-0002-0002-0002-aaaaaaaaaaaa';
  lol_id   UUID := 'aaaaaaaa-0003-0003-0003-aaaaaaaaaaaa';
BEGIN

-- ── Make sure you are admin ───────────────────────────────────────────────────
UPDATE profiles SET role = 'admin' WHERE id = admin_id;

-- ── Games ─────────────────────────────────────────────────────────────────────
INSERT INTO games (id, name, slug, current_patch, is_supported, sort_order) VALUES
  (val_id, 'VALORANT',          'valorant',          'Patch 9.08', TRUE, 1),
  (cs2_id, 'Counter-Strike 2',  'cs2',               'v1.39.7',    TRUE, 2),
  (lol_id, 'League of Legends', 'league-of-legends', '14.21',      TRUE, 3)
ON CONFLICT (slug) DO NOTHING;

-- ── Roster (your real account on VALORANT) ────────────────────────────────────
INSERT INTO team_roster (user_id, game_id, in_game_role, is_captain, is_active)
VALUES (admin_id, val_id, 'IGL', TRUE, TRUE)
ON CONFLICT (user_id, game_id) DO NOTHING;

-- ── Club Members ──────────────────────────────────────────────────────────────
INSERT INTO club_members (user_id, panel_role, is_founder, sort_order)
VALUES (admin_id, 'President', TRUE, 1)
ON CONFLICT (user_id) DO NOTHING;

-- ── Player Stats ──────────────────────────────────────────────────────────────
INSERT INTO player_stats (user_id, game_id, wins, losses, draws, rank_points, season)
VALUES (admin_id, val_id, 42, 18, 0, 2100, '2025')
ON CONFLICT (user_id, game_id, season) DO NOTHING;

-- ── News Posts ────────────────────────────────────────────────────────────────
INSERT INTO news_posts (id, title, slug, body, excerpt, author_id, category, game_id, tags, is_published, is_pinned, published_at) VALUES

  ('cccccccc-0001-0001-0001-cccccccccccc',
   'Welcome to Esports Club!',
   'welcome-to-esports-club',
   E'# Welcome to Esports Club\n\nWe are thrilled to launch our official website. This is your hub for all things competitive gaming — news, tournaments, rosters, and more.\n\n## What to expect\n\n- **Weekly news** on patches, strategies, and club events\n- **Tournament brackets** updated in real-time\n- **Leaderboards** that sync live with match results\n\nStay tuned and register to join the club!',
   'Our official website is live. Find news, tournaments, and leaderboards all in one place.',
   admin_id, 'announcement', NULL,
   ARRAY['launch','welcome'],
   TRUE, TRUE, NOW() - INTERVAL '7 days'),

  ('cccccccc-0002-0002-0002-cccccccccccc',
   'VALORANT Patch 9.08 — What Changed?',
   'valorant-patch-9-08-breakdown',
   E'# VALORANT Patch 9.08 Breakdown\n\nRiot Games dropped a significant patch this week. Here''s what our analysts found.\n\n## Agent Changes\n- **Jett** dash cooldown increased by 0.5s\n- **Killjoy** turret damage reduced by 10%\n\n## Map Pool\n- Lotus returns to competitive rotation\n- Bind removed temporarily for updates\n\n## Our Take\nThe Jett nerf opens up duelist diversity. Expect to see more Raze and Neon picks in ranked.',
   'Patch 9.08 nerfs Jett, adjusts Killjoy, and shakes up the map pool. Our breakdown inside.',
   admin_id, 'patch', val_id,
   ARRAY['valorant','patch-notes','meta'],
   TRUE, FALSE, NOW() - INTERVAL '3 days'),

  ('cccccccc-0003-0003-0003-cccccccccccc',
   'Club VALORANT Team Places Top 4 in Regional',
   'valorant-team-top-4-regional',
   E'# Club VALORANT Team Places Top 4 in Regional Tournament\n\nOur VALORANT squad had an incredible run in last weekend''s regional invitational, finishing in the top 4 out of 32 teams.\n\n## Match Results\n- **vs Team Alpha** — Won 2-0\n- **vs Ghost Squad** — Won 2-1\n- **vs Neon Rush** — Won 2-0\n- **Semifinal vs The Collective** — Lost 1-2\n\n## Player Highlights\nAce posted a 1.45 ACS across all maps. Rookie showed massive improvement in clutch rounds.\n\nCongratulations to the whole squad — we are proud of you!',
   'Our VALORANT team finishes top 4 in the regional invitational out of 32 competing teams.',
   admin_id, 'news', val_id,
   ARRAY['valorant','tournament','results'],
   TRUE, FALSE, NOW() - INTERVAL '1 day'),

  ('cccccccc-0004-0004-0004-cccccccccccc',
   'CS2 IGL Guide: Economy Management in 2025',
   'cs2-igl-economy-guide-2025',
   E'# CS2 IGL Guide: Economy Management in 2025\n\nManaging economy as an IGL is the difference between winning and losing close matches.\n\n## The Core Principle\nNever let your team full-buy into a loss. A disciplined force-buy beats an undisciplined full-buy every time.\n\n## Round Types\n1. **Full Buy** — 5+ players with rifles + full utility\n2. **Force Buy** — 3-4 players with SMGs/pistols\n3. **Eco** — Save everything, use pistols only\n4. **Half Buy** — Flexible, one rifle + pistols\n\n## Decision Framework\nAfter losing a round with full equipment, always eco the next round unless you saved 3+ rifles.',
   'A framework for CS2 economy management — how our IGL wins close matches.',
   admin_id, 'strategy', cs2_id,
   ARRAY['cs2','strategy','igl','economy'],
   TRUE, FALSE, NOW() - INTERVAL '5 days'),

  ('cccccccc-0005-0005-0005-cccccccccccc',
   'Spring 2025 Internal Tournament — Registration Open',
   'spring-2025-tournament-registration',
   E'# Spring 2025 Internal Tournament — Registration Now Open\n\nOur biggest internal tournament of the year is here. Register your team before spots fill up!\n\n## Details\n- **Format:** Single Elimination\n- **Games:** VALORANT, CS2\n- **Teams:** Up to 16 per game\n- **Prize:** Gaming peripherals for winners\n- **Dates:** Matches begin June 1, 2025\n\n## How to Register\nHead to the Tournaments page and click Register. You need a minimum of 5 players per team.\n\nGood luck to all participants!',
   'Registration is now open for our Spring 2025 internal tournament. Limited spots — sign up now.',
   admin_id, 'event', NULL,
   ARRAY['tournament','registration','spring-2025'],
   TRUE, FALSE, NOW() - INTERVAL '2 days')

ON CONFLICT (slug) DO NOTHING;

-- ── Tournament ────────────────────────────────────────────────────────────────
INSERT INTO tournaments (id, game_id, name, description, format, status, max_teams, prize_pool, registration_open, start_date, end_date, created_by)
VALUES (
  'dddddddd-0001-0001-0001-dddddddddddd',
  val_id,
  'Spring 2025 VALORANT Cup',
  'Our flagship internal VALORANT tournament. Single elimination, best-of-3 from quarterfinals.',
  'single_elimination', 'registration', 16,
  'Gaming peripherals for the winning team',
  TRUE,
  NOW() + INTERVAL '12 days',
  NOW() + INTERVAL '19 days',
  admin_id
)
ON CONFLICT (id) DO NOTHING;

-- ── Site Settings ─────────────────────────────────────────────────────────────
UPDATE site_settings SET value = '"Esports Club"'             WHERE key = 'club_name';
UPDATE site_settings SET value = '"Play. Compete. Dominate."' WHERE key = 'club_tagline';
UPDATE site_settings SET
  value = '{"text": "Welcome to the new website! Apply now to join the club.", "enabled": true}'
  WHERE key = 'announcement_banner';
UPDATE site_settings SET
  value = '{"discord": "", "twitter": "", "youtube": ""}'
  WHERE key = 'social_links';

END $$;
