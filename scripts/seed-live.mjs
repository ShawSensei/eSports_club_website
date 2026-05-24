/**
 * Applies seed.sql data to the live Supabase database.
 * Uses the Admin Auth API + REST API with service role key.
 */

const BASE     = 'https://bzdciswoqmodlhklcent.supabase.co'
const KEY      = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6ZGNpc3dvcW1vZGxoa2xjZW50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTI3MjA1MSwiZXhwIjoyMDk0ODQ4MDUxfQ.nN2HKfkNFLr3KUBY3JEwKXwudEY0JFQoTPJK6XSXNUE'

const headers = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=minimal,resolution=ignore-duplicates',
}

const now = new Date()
const ago = (days, hours = 0) => new Date(now - (days * 86400 + hours * 3600) * 1000).toISOString()
const fwd = (days) => new Date(now.getTime() + days * 86400 * 1000).toISOString()

async function insert(table, rows) {
  const res = await fetch(`${BASE}/rest/v1/${table}`, {
    method: 'POST', headers,
    body: JSON.stringify(Array.isArray(rows) ? rows : [rows]),
  })
  if (!res.ok) {
    const text = await res.text()
    // 409 = duplicate, treat as success (ON CONFLICT DO NOTHING)
    if (res.status === 409 || text.includes('23505')) {
      console.log(`  ↷ ${table} already exists, skipped`)
      return
    }
    throw new Error(`INSERT ${table} failed ${res.status}: ${text}`)
  }
  console.log(`  ✓ ${table} (${Array.isArray(rows) ? rows.length : 1} rows)`)
}

async function patch(table, filter, data) {
  const res = await fetch(`${BASE}/rest/v1/${table}?${filter}`, {
    method: 'PATCH',
    headers: { ...headers, Prefer: 'return=minimal' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`PATCH ${table} failed ${res.status}: ${err}`)
  }
  console.log(`  ✓ ${table} updated (${filter})`)
}

async function createAuthUser(id, email, username, displayName) {
  const res = await fetch(`${BASE}/auth/v1/admin/users`, {
    method: 'POST',
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id,
      email,
      password: 'Esports@Club2026!',
      email_confirm: true,
      user_metadata: { username, display_name: displayName },
    }),
  })
  const data = await res.json()
  if (data.error && !data.error.message?.includes('already been registered')) {
    console.warn(`  ⚠ auth user ${email}: ${data.error.message}`)
  } else {
    console.log(`  ✓ auth user: ${email}`)
  }
}

async function main() {

  // ── 1. Create auth users (trigger auto-creates profiles) ──────────────────
  console.log('\n── Auth Users ──')
  const authUsers = [
    { id: 'bbbbbbbb-0001-0001-0001-bbbbbbbbbbbb', email: 'admin@esportsclub.dev',      username: 'admin',      displayName: 'Club Admin' },
    { id: 'bbbbbbbb-0002-0002-0002-bbbbbbbbbbbb', email: 'mod1@esportsclub.dev',        username: 'moderator1', displayName: 'Mod One' },
    { id: 'bbbbbbbb-0003-0003-0003-bbbbbbbbbbbb', email: 'ace@esportsclub.dev',         username: 'player_ace', displayName: 'Ace' },
    { id: 'bbbbbbbb-0004-0004-0004-bbbbbbbbbbbb', email: 'playerx@esportsclub.dev',     username: 'player_x',   displayName: 'PlayerX' },
    { id: 'bbbbbbbb-0005-0005-0005-bbbbbbbbbbbb', email: 'rookie@esportsclub.dev',      username: 'rookie',     displayName: 'Rookie' },
    { id: 'eeeeeeee-0001-0001-0001-eeeeeeeeeeee', email: 'striker@esportsclub.dev',     username: 'cap_alpha',  displayName: 'Striker' },
    { id: 'eeeeeeee-0002-0002-0002-eeeeeeeeeeee', email: 'phantom@esportsclub.dev',     username: 'cap_ghost',  displayName: 'Phantom' },
    { id: 'eeeeeeee-0003-0003-0003-eeeeeeeeeeee', email: 'voltage@esportsclub.dev',     username: 'cap_neon',   displayName: 'Voltage' },
    { id: 'eeeeeeee-0004-0004-0004-eeeeeeeeeeee', email: 'oracle@esportsclub.dev',      username: 'cap_collect',displayName: 'Oracle' },
    { id: 'eeeeeeee-0005-0005-0005-eeeeeeeeeeee', email: 'ironclad@esportsclub.dev',    username: 'cap_iron',   displayName: 'Ironclad' },
    { id: 'eeeeeeee-0006-0006-0006-eeeeeeeeeeee', email: 'spectre@esportsclub.dev',     username: 'cap_shadow', displayName: 'Spectre' },
    { id: 'eeeeeeee-0007-0007-0007-eeeeeeeeeeee', email: 'byte@esportsclub.dev',        username: 'cap_cyber',  displayName: 'Byte' },
    { id: 'eeeeeeee-0008-0008-0008-eeeeeeeeeeee', email: 'tempest@esportsclub.dev',     username: 'cap_storm',  displayName: 'Tempest' },
  ]
  for (const u of authUsers) {
    await createAuthUser(u.id, u.email, u.username, u.displayName)
  }

  // ── 2. Update profiles with roles / bios / discord tags ───────────────────
  console.log('\n── Profile Updates ──')
  const profileUpdates = [
    { id: 'bbbbbbbb-0001-0001-0001-bbbbbbbbbbbb', role: 'admin',     bio: 'Founder and admin of the esports club.', discord_tag: 'admin#0001' },
    { id: 'bbbbbbbb-0002-0002-0002-bbbbbbbbbbbb', role: 'moderator', bio: 'Head moderator and content manager.',    discord_tag: 'modone#1234' },
    { id: 'bbbbbbbb-0003-0003-0003-bbbbbbbbbbbb', role: 'member',    bio: 'Top VALORANT fragger.',                  discord_tag: 'Ace#9999' },
    { id: 'bbbbbbbb-0004-0004-0004-bbbbbbbbbbbb', role: 'member',    bio: 'CS2 IGL and strategist.',                discord_tag: 'PlayerX#5678' },
    { id: 'bbbbbbbb-0005-0005-0005-bbbbbbbbbbbb', role: 'member',    bio: 'Just joined — learning fast.',           discord_tag: 'Rookie#0000' },
    { id: 'eeeeeeee-0001-0001-0001-eeeeeeeeeeee', role: 'member',    bio: 'Alpha Squad IGL.',                       discord_tag: 'Striker#0001' },
    { id: 'eeeeeeee-0002-0002-0002-eeeeeeeeeeee', role: 'member',    bio: 'Ghost Squad fragger.',                   discord_tag: 'Phantom#0002' },
    { id: 'eeeeeeee-0003-0003-0003-eeeeeeeeeeee', role: 'member',    bio: 'Neon Rush entry fragger.',               discord_tag: 'Voltage#0003' },
    { id: 'eeeeeeee-0004-0004-0004-eeeeeeeeeeee', role: 'member',    bio: 'The Collective tactician.',              discord_tag: 'Oracle#0004' },
    { id: 'eeeeeeee-0005-0005-0005-eeeeeeeeeeee', role: 'member',    bio: 'Iron Fist in-game leader.',              discord_tag: 'Ironclad#0005' },
    { id: 'eeeeeeee-0006-0006-0006-eeeeeeeeeeee', role: 'member',    bio: 'Shadow Protocol lurker.',                discord_tag: 'Spectre#0006' },
    { id: 'eeeeeeee-0007-0007-0007-eeeeeeeeeeee', role: 'member',    bio: 'Cyber Wolves sentinel.',                 discord_tag: 'Byte#0007' },
    { id: 'eeeeeeee-0008-0008-0008-eeeeeeeeeeee', role: 'member',    bio: 'Storm Riders duelist.',                  discord_tag: 'Tempest#0008' },
  ]
  for (const p of profileUpdates) {
    const { id, ...data } = p
    await patch('profiles', `id=eq.${id}`, data)
  }

  // ── 3. Club members ───────────────────────────────────────────────────────
  console.log('\n── Club Members ──')
  await insert('club_members', [
    { user_id: 'bbbbbbbb-0001-0001-0001-bbbbbbbbbbbb', panel_role: 'President', is_founder: true,  sort_order: 1 },
    { user_id: 'bbbbbbbb-0002-0002-0002-bbbbbbbbbbbb', panel_role: 'Coach',     is_founder: false, sort_order: 2 },
  ])

  // ── 4. Team roster ────────────────────────────────────────────────────────
  console.log('\n── Team Roster ──')
  await insert('team_roster', [
    { user_id: 'bbbbbbbb-0003-0003-0003-bbbbbbbbbbbb', game_id: 'aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa', in_game_role: 'Duelist', is_captain: true,  is_active: true },
    { user_id: 'bbbbbbbb-0004-0004-0004-bbbbbbbbbbbb', game_id: 'aaaaaaaa-0002-0002-0002-aaaaaaaaaaaa', in_game_role: 'IGL',     is_captain: true,  is_active: true },
    { user_id: 'bbbbbbbb-0005-0005-0005-bbbbbbbbbbbb', game_id: 'aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa', in_game_role: 'Support', is_captain: false, is_active: true },
  ])

  // ── 5. Player stats ───────────────────────────────────────────────────────
  console.log('\n── Player Stats ──')
  await insert('player_stats', [
    { user_id: 'bbbbbbbb-0003-0003-0003-bbbbbbbbbbbb', game_id: 'aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa', wins: 42, losses: 18, draws: 0, rank_points: 2100, season: '2026' },
    { user_id: 'bbbbbbbb-0004-0004-0004-bbbbbbbbbbbb', game_id: 'aaaaaaaa-0002-0002-0002-aaaaaaaaaaaa', wins: 31, losses: 22, draws: 5, rank_points: 1850, season: '2026' },
    { user_id: 'bbbbbbbb-0005-0005-0005-bbbbbbbbbbbb', game_id: 'aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa', wins: 10, losses: 30, draws: 2, rank_points:  600, season: '2026' },
  ])

  // ── 6. News posts ─────────────────────────────────────────────────────────
  console.log('\n── News Posts ──')
  await insert('news_posts', [
    {
      id: 'cccccccc-0001-0001-0001-cccccccccccc',
      title: 'Welcome to Esports Club!', slug: 'welcome-to-esports-club',
      body: '# Welcome\nWe are thrilled to launch our official website.',
      excerpt: 'Our official website is live. Find news, tournaments, and leaderboards all in one place.',
      author_id: 'bbbbbbbb-0001-0001-0001-bbbbbbbbbbbb',
      category: 'announcement', game_id: null, tags: ['launch','welcome'],
      is_published: true, is_pinned: true, published_at: ago(7),
    },
    {
      id: 'cccccccc-0002-0002-0002-cccccccccccc',
      title: 'VALORANT Patch 9.08 — What Changed?', slug: 'valorant-patch-9-08-breakdown',
      body: '# VALORANT Patch 9.08 Breakdown\nRiot dropped a significant patch this week.',
      excerpt: 'Patch 9.08 nerfs Jett, adjusts Killjoy, and shakes up the map pool.',
      author_id: 'bbbbbbbb-0002-0002-0002-bbbbbbbbbbbb',
      category: 'patch', game_id: 'aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa',
      tags: ['valorant','patch-notes','meta'],
      is_published: true, is_pinned: false, published_at: ago(3),
    },
    {
      id: 'cccccccc-0003-0003-0003-cccccccccccc',
      title: 'Club VALORANT Team Places Top 4 in Regional', slug: 'valorant-team-top-4-regional',
      body: '# Top 4 in Regional\nOur VALORANT squad had an incredible run.',
      excerpt: 'Our VALORANT team finishes top 4 in the regional invitational out of 32 competing teams.',
      author_id: 'bbbbbbbb-0001-0001-0001-bbbbbbbbbbbb',
      category: 'news', game_id: 'aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa',
      tags: ['valorant','tournament','results'],
      is_published: true, is_pinned: false, published_at: ago(1),
    },
    {
      id: 'cccccccc-0004-0004-0004-cccccccccccc',
      title: 'CS2 IGL Guide: Economy Management in 2026', slug: 'cs2-igl-economy-guide-2026',
      body: '# CS2 Economy Guide\nManaging economy as an IGL is the difference between winning and losing.',
      excerpt: 'PlayerX breaks down CS2 economy management — the framework our IGL uses to win close matches.',
      author_id: 'bbbbbbbb-0002-0002-0002-bbbbbbbbbbbb',
      category: 'strategy', game_id: 'aaaaaaaa-0002-0002-0002-aaaaaaaaaaaa',
      tags: ['cs2','strategy','igl','economy'],
      is_published: true, is_pinned: false, published_at: ago(5),
    },
    {
      id: 'cccccccc-0005-0005-0005-cccccccccccc',
      title: 'Spring 2026 Internal Tournament — Registration Open', slug: 'spring-2026-tournament-registration',
      body: '# Spring 2026 Tournament\nOur biggest internal tournament of the year is here.',
      excerpt: 'Registration is now open for our Spring 2026 internal tournament. Limited spots — sign up now.',
      author_id: 'bbbbbbbb-0001-0001-0001-bbbbbbbbbbbb',
      category: 'event', game_id: null, tags: ['tournament','registration','spring-2026'],
      is_published: true, is_pinned: false, published_at: ago(2),
    },
  ])

  // ── 7. Tournaments ────────────────────────────────────────────────────────
  console.log('\n── Tournaments ──')
  await insert('tournaments', [
    {
      id: 'dddddddd-0001-0001-0001-dddddddddddd',
      game_id: 'aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa',
      name: 'Spring 2026 VALORANT Cup',
      description: 'Our flagship internal VALORANT tournament. 8 teams, single elimination, best-of-3 from semifinals.',
      format: 'single_elimination', status: 'ongoing', max_teams: 8,
      prize_pool: 'Gaming peripherals for the winning team',
      registration_open: false,
      start_date: ago(2), end_date: fwd(5),
      created_by: 'bbbbbbbb-0001-0001-0001-bbbbbbbbbbbb',
    },
    {
      id: 'dddddddd-0002-0002-0002-dddddddddddd',
      game_id: 'aaaaaaaa-0002-0002-0002-aaaaaaaaaaaa',
      name: 'CS2 Winter League 2026',
      description: 'Round-robin group stage followed by a single-elimination playoff bracket. Open to all club members.',
      format: 'round_robin', status: 'registration', max_teams: 16,
      prize_pool: 'Cash prize pool: BDT 5,000',
      registration_open: true,
      start_date: fwd(10), end_date: fwd(24),
      created_by: 'bbbbbbbb-0001-0001-0001-bbbbbbbbbbbb',
    },
  ])

  // ── 8. Tournament teams ───────────────────────────────────────────────────
  console.log('\n── Tournament Teams ──')
  await insert('tournament_teams', [
    { id: 'ffffffff-0001-0001-0001-ffffffffffff', tournament_id: 'dddddddd-0001-0001-0001-dddddddddddd', team_name: 'Alpha Squad',     captain_id: 'eeeeeeee-0001-0001-0001-eeeeeeeeeeee', status: 'approved', registered_at: ago(5) },
    { id: 'ffffffff-0002-0002-0002-ffffffffffff', tournament_id: 'dddddddd-0001-0001-0001-dddddddddddd', team_name: 'Ghost Squad',     captain_id: 'eeeeeeee-0002-0002-0002-eeeeeeeeeeee', status: 'approved', registered_at: ago(5) },
    { id: 'ffffffff-0003-0003-0003-ffffffffffff', tournament_id: 'dddddddd-0001-0001-0001-dddddddddddd', team_name: 'Neon Rush',       captain_id: 'eeeeeeee-0003-0003-0003-eeeeeeeeeeee', status: 'approved', registered_at: ago(4) },
    { id: 'ffffffff-0004-0004-0004-ffffffffffff', tournament_id: 'dddddddd-0001-0001-0001-dddddddddddd', team_name: 'The Collective',  captain_id: 'eeeeeeee-0004-0004-0004-eeeeeeeeeeee', status: 'approved', registered_at: ago(4) },
    { id: 'ffffffff-0005-0005-0005-ffffffffffff', tournament_id: 'dddddddd-0001-0001-0001-dddddddddddd', team_name: 'Iron Fist',       captain_id: 'eeeeeeee-0005-0005-0005-eeeeeeeeeeee', status: 'approved', registered_at: ago(4) },
    { id: 'ffffffff-0006-0006-0006-ffffffffffff', tournament_id: 'dddddddd-0001-0001-0001-dddddddddddd', team_name: 'Shadow Protocol', captain_id: 'eeeeeeee-0006-0006-0006-eeeeeeeeeeee', status: 'approved', registered_at: ago(3) },
    { id: 'ffffffff-0007-0007-0007-ffffffffffff', tournament_id: 'dddddddd-0001-0001-0001-dddddddddddd', team_name: 'Cyber Wolves',    captain_id: 'eeeeeeee-0007-0007-0007-eeeeeeeeeeee', status: 'approved', registered_at: ago(3) },
    { id: 'ffffffff-0008-0008-0008-ffffffffffff', tournament_id: 'dddddddd-0001-0001-0001-dddddddddddd', team_name: 'Storm Riders',    captain_id: 'eeeeeeee-0008-0008-0008-eeeeeeeeeeee', status: 'approved', registered_at: ago(3) },
  ])

  // ── 9. Matches ────────────────────────────────────────────────────────────
  console.log('\n── Matches ──')
  await insert('matches', [
    // R1 — completed
    { id: 'cccc0001-cc01-cc01-cc01-cccccccc0001', tournament_id: 'dddddddd-0001-0001-0001-dddddddddddd', round: 1, match_number: 1, team1_id: 'ffffffff-0001-0001-0001-ffffffffffff', team2_id: 'ffffffff-0008-0008-0008-ffffffffffff', team1_score: 13, team2_score: 8,  winner_id: 'ffffffff-0001-0001-0001-ffffffffffff', status: 'completed', played_at: ago(1,6), vod_url: null },
    { id: 'cccc0002-cc02-cc02-cc02-cccccccc0002', tournament_id: 'dddddddd-0001-0001-0001-dddddddddddd', round: 1, match_number: 2, team1_id: 'ffffffff-0004-0004-0004-ffffffffffff', team2_id: 'ffffffff-0005-0005-0005-ffffffffffff', team1_score: 13, team2_score: 10, winner_id: 'ffffffff-0004-0004-0004-ffffffffffff', status: 'completed', played_at: ago(1,5), vod_url: null },
    { id: 'cccc0003-cc03-cc03-cc03-cccccccc0003', tournament_id: 'dddddddd-0001-0001-0001-dddddddddddd', round: 1, match_number: 3, team1_id: 'ffffffff-0002-0002-0002-ffffffffffff', team2_id: 'ffffffff-0007-0007-0007-ffffffffffff', team1_score: 13, team2_score: 7,  winner_id: 'ffffffff-0002-0002-0002-ffffffffffff', status: 'completed', played_at: ago(1,4), vod_url: null },
    { id: 'cccc0004-cc04-cc04-cc04-cccccccc0004', tournament_id: 'dddddddd-0001-0001-0001-dddddddddddd', round: 1, match_number: 4, team1_id: 'ffffffff-0003-0003-0003-ffffffffffff', team2_id: 'ffffffff-0006-0006-0006-ffffffffffff', team1_score: 13, team2_score: 11, winner_id: 'ffffffff-0003-0003-0003-ffffffffffff', status: 'completed', played_at: ago(1,3), vod_url: null },
    // R2 — semifinal
    { id: 'cccc0005-cc05-cc05-cc05-cccccccc0005', tournament_id: 'dddddddd-0001-0001-0001-dddddddddddd', round: 2, match_number: 1, team1_id: 'ffffffff-0001-0001-0001-ffffffffffff', team2_id: 'ffffffff-0004-0004-0004-ffffffffffff', team1_score: null, team2_score: null, winner_id: null, status: 'live',      played_at: null, vod_url: null },
    { id: 'cccc0006-cc06-cc06-cc06-cccccccc0006', tournament_id: 'dddddddd-0001-0001-0001-dddddddddddd', round: 2, match_number: 2, team1_id: 'ffffffff-0002-0002-0002-ffffffffffff', team2_id: 'ffffffff-0003-0003-0003-ffffffffffff', team1_score: null, team2_score: null, winner_id: null, status: 'scheduled', played_at: null, vod_url: null },
    // Final — TBD
    { id: 'cccc0007-cc07-cc07-cc07-cccccccc0007', tournament_id: 'dddddddd-0001-0001-0001-dddddddddddd', round: 3, match_number: 1, team1_id: null, team2_id: null, team1_score: null, team2_score: null, winner_id: null, status: 'scheduled', played_at: null, vod_url: null },
  ])

  // ── 10. Site settings ─────────────────────────────────────────────────────
  console.log('\n── Site Settings ──')
  await patch('site_settings', 'key=eq.club_name',     { value: '"Esports Club"' })
  await patch('site_settings', 'key=eq.club_tagline',  { value: '"Play. Compete. Dominate."' })

  console.log('\n✓ Seed complete.')
}

main().catch(err => { console.error('\n✗', err.message); process.exit(1) })
