# Feature Specifications

## 1. Authentication & User System

### Sign Up / Sign In
- Email + password via Supabase Auth
- Discord OAuth (configure in Supabase dashboard → Auth → Providers)
- On first sign-in, profile auto-created via DB trigger
- Middleware (`src/middleware.ts`) protects `/profile`, `/admin`, `/apply` routes

### User Profile (`/profile/[username]`)
- Public profile: display name, avatar, bio, discord tag
- Linked games: in-game name + current rank per game
- Stats card: wins/losses/rank points per game
- Tournament history: past tournaments participated in
- Own profile: editable inline (display name, bio, avatar upload, discord tag)
- Avatar upload → Supabase Storage `avatars/` bucket

### Role Management (Admin Only)
- Admin can change any user's role via `/admin/users`
- Roles: `member`, `moderator`, `admin`
- Role change is logged to `audit_log`

---

## 2. Home Page (`/`)

### Hero Section
- Club name + tagline (from `site_settings`)
- CTA buttons: "Join the Club" → `/apply`, "View Tournaments" → `/tournaments`
- Background: animated/gradient, gaming aesthetic

### Announcement Banner
- Conditionally rendered if `site_settings.announcement_banner.enabled = true`
- Text pulled from `site_settings.announcement_banner.text`
- Admin toggles via admin panel — no redeploy

### News Highlights
- Latest 3 published news posts (pinned posts first)
- Card layout: cover image, title, category badge, excerpt, author, date
- "View All News" link

### Upcoming Tournaments
- Next 2 tournaments with `status IN ('upcoming', 'registration')`
- Game logo, tournament name, date, status badge, registration CTA

### Club Stats Bar
- Total members, active tournaments, games supported (live counts from DB)

---

## 3. News (`/news`)

### Feed Page
- Paginated list (12 per page) of published posts
- Filter by: category (news, announcement, patch, strategy, event), game
- Search by title/tag
- Pinned posts always shown first
- Each card: cover, category badge, game tag, title, excerpt, author avatar + name, date, view count

### Post Detail (`/news/[slug]`)
- Full Markdown rendered body (use `react-markdown` + `remark-gfm`)
- Author info card
- Related posts (same game or category)
- View count incremented on load (via Supabase RPC)
- Social share buttons (Twitter/X, Discord copy-link)

---

## 4. Games Hub (`/games`)

### Games List
- Grid of all supported games (`is_supported = true`)
- Game card: logo, name, current patch badge, link to game detail

### Game Detail (`/games/[slug]`)
- Game header: cover, name, current patch
- Sub-tabs:
  - **Patch Notes** — news posts with `category = 'patch'` filtered to this game
  - **Strategies** — posts with `category = 'strategy'` filtered to this game
  - **Team** — roster members for this game
  - **Leaderboard** — top 10 club members by rank_points for this game

---

## 5. Tournaments (`/tournaments`)

### List Page
- Filter tabs: All, Upcoming, Registration Open, Ongoing, Completed
- Tournament card: cover, game logo, name, format badge, date, team count, status
- "Register" CTA if `registration_open = true` and user is logged in

### Tournament Detail (`/tournaments/[id]`)
- Header: cover, name, game, format, prize pool, dates, stream link
- Tabs:
  - **Overview** — description + rules link
  - **Bracket** — visual bracket (built from `matches` table, displayed as SVG/CSS grid)
  - **Teams** — registered + approved teams with members
  - **Results** — completed match scores + VOD links
- Registration form (if open): team name, member selection (search by username)

### Registration Flow
- User selects team members (must be registered members)
- Team submitted → status `pending` → mod approves in admin panel
- Confirmation notification/banner shown

---

## 6. Roster (`/roster`)

### Page Layout
- Filter by game (tab or dropdown)
- Player cards: avatar, display name, in-game role, game rank, captain badge
- "Meet the Team" section header with game logo

### Player Card Detail (modal or expand)
- Avatar, display name, game role, ranks, profile link
- Stats: wins/losses/rank points for that game

---

## 7. Members (`/members`)

### Club Members Page
- Section: **Founders** — `is_founder = true`, shown with special styling
- Section: **Panel / Leadership** — `panel_role IS NOT NULL`
- Section: **All Members** — searchable/filterable member directory
- Member card: avatar, display name, panel role (if any), joined date

---

## 8. Leaderboard (`/leaderboard`)

- Filter by game + season
- Ranked table: rank #, avatar, username, game, rank title, wins, losses, points
- Current user's row highlighted if logged in
- Updates in near-real-time via Supabase Realtime subscription

---

## 9. Apply (`/apply`)

### Membership Application Form
Fields: full name, email, Discord tag, motivation (textarea), preferred games (multi-select), gaming experience (textarea), weekly availability
- Validation via Zod
- Submitted to `membership_applications` table
- Confirmation page shown after submit
- User can check status if logged in via `/profile`

---

## 10. Admin Panel (`/admin`) — Requires `role = 'admin'`

### Dashboard
- Summary stats: pending applications, unpublished drafts, upcoming tournaments, recent audit log entries
- Quick action shortcuts

### News Manager (`/admin/news`)
- Table of all posts: title, category, status (draft/published), author, date
- Create new post (Markdown editor with preview — use `@uiw/react-md-editor` or similar)
- Edit, publish/unpublish, pin/unpin, delete
- Cover image upload

### Roster Manager (`/admin/roster`)
- Add/remove players from team roster per game
- Set in-game role, captain status
- Activate/deactivate players

### Tournament Manager (`/admin/tournaments`)
- Create tournament (form with all fields)
- Edit tournament details
- Open/close registration
- Approve/reject team registrations
- Enter match scores (bracket view with score input)
- Change tournament status

### User Manager (`/admin/users`)
- Table of all users: username, email, role, joined date, active status
- Change role (member ↔ moderator ↔ admin)
- Deactivate account
- View profile

### Application Manager (`/admin/applications`)
- List of pending applications
- View full application details
- Approve (creates/upgrades account, sends welcome) or reject with note

### Games Manager (`/admin/games`)
- Add new game (name, slug, logos, patch)
- Toggle `is_supported`
- Update current patch

### Site Settings (`/admin/settings`)
- Club name
- Announcement banner (text + enable/disable toggle)
- Social links (Discord invite, Twitter, YouTube)
- Club description/tagline

### Audit Log (`/admin/audit`)
- Paginated log of all admin/mod actions
- Filter by actor, action type, date range

---

## 11. Mod Channel (`/admin`) — Accessible to `moderator` role too

Moderators can access subset of admin panel:
- ✅ News Manager (create/edit/publish)
- ✅ Roster Manager (update active status, roles)
- ✅ Match score entry
- ✅ Application review
- ❌ User role management (admin only)
- ❌ Site settings (admin only)
- ❌ Audit log (admin only)

---

## 12. Real-time Features (Supabase Realtime)

Enable Realtime on these tables:
- `news_posts` → home page news section auto-updates
- `matches` → tournament bracket live score updates
- `player_stats` → leaderboard live updates
- `tournaments` → status changes reflected immediately

Subscribe in relevant components using `supabase.channel()`.
