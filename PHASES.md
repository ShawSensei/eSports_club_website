# Build Phases — Claude Code Session Guide

## How to Use This File
Each phase = one focused Claude Code session.
Start each session by saying: "We are working on Phase [N]. Read CLAUDE.md and PHASES.md first."
Use Plan Mode (Shift+Tab twice) before each phase to review the plan before coding starts.

---

## Phase 1 — Project Scaffolding & Database
**Goal**: Working Next.js app connected to Supabase with full schema deployed.

**Claude Code Prompt:**
```
Read CLAUDE.md, docs/DATABASE.md, and docs/DEPLOYMENT.md.

Set up the project:
1. Initialize Next.js 14 with TypeScript, Tailwind CSS, App Router, pnpm
2. Install all dependencies from COMPONENTS.md (packages section)
3. Create the full directory structure from PAGES.md
4. Create src/lib/supabase/client.ts, server.ts, admin.ts
5. Create all Supabase migration SQL files in supabase/migrations/ based on DATABASE.md
6. Create supabase/seed.sql with sample data (3 games, 5 users, 5 news posts, 1 tournament)
7. Create .env.example
8. Set up tsconfig paths for @/ alias
9. Create globals.css with all CSS variables from COMPONENTS.md
10. Set up next.config.js with image domains for Supabase storage
```

**Done when**: `pnpm dev` runs, Supabase schema applied, types generated.

---

## Phase 2 — Auth System
**Goal**: Working login, register, Discord OAuth, profile auto-creation, middleware.

**Claude Code Prompt:**
```
Read CLAUDE.md and docs/FEATURES.md (Section 1: Auth).

Build the authentication system:
1. Create app/(auth)/login/page.tsx — email/password + Discord OAuth button
2. Create app/(auth)/register/page.tsx — email/password registration form
3. Create app/auth/callback/route.ts — Supabase OAuth callback handler
4. Create src/middleware.ts — protect /profile, /admin routes with role checks
5. Create app/(auth)/layout.tsx — minimal centered layout
6. Create Header component with auth state (login button or user avatar dropdown)
7. Zod schemas for login and register forms
8. Server Actions for login and register
9. Test: sign up, sign in, Discord OAuth, sign out all work
```

**Done when**: Full auth flow works including Discord OAuth and profile auto-creation.

---

## Phase 3 — Public Layout & Home Page
**Goal**: Beautiful home page with announcement banner, news highlights, tournament preview.

**Claude Code Prompt:**
```
Read CLAUDE.md, docs/COMPONENTS.md, docs/FEATURES.md (Section 2: Home Page), docs/PAGES.md.

Build the public layout and home page:
1. Create all UI primitives: Button, Badge, Card, Avatar, Skeleton (src/components/ui/)
2. Create layout/Header.tsx with nav links and mobile menu
3. Create layout/Footer.tsx with social links
4. Create layout/AnnouncementBanner.tsx (reads from site_settings)
5. Create app/(public)/layout.tsx wrapping with Header + AnnouncementBanner + Footer
6. Build app/(public)/page.tsx — full home page:
   - Hero section with CTA buttons
   - Announcement banner (conditional)
   - News highlights (latest 3 posts)
   - Upcoming tournaments (next 2)
   - Club stats bar (live counts)
7. Create loading.tsx skeletons for the home page
```

**Done when**: Home page renders with real data, looks dark/gaming themed, responsive.

---

## Phase 4 — News System
**Goal**: Full news feed with filters, pagination, and post detail pages.

**Claude Code Prompt:**
```
Read CLAUDE.md, docs/FEATURES.md (Section 3: News), docs/COMPONENTS.md.

Build the news system:
1. Create features/news/NewsCard.tsx, NewsFeed.tsx, NewsFilters.tsx, NewsDetail.tsx
2. Create app/(public)/news/page.tsx — paginated feed with category/game filters and search
3. Create app/(public)/news/[slug]/page.tsx — full post with Markdown rendering
4. Add view count increment via Supabase RPC function (create the function in a migration)
5. Set up react-markdown with remark-gfm, dark theme styling
6. Add related posts section at bottom of post detail
7. generateMetadata for SEO on both pages
8. loading.tsx and error.tsx for both routes
```

**Done when**: News feed and post detail fully functional with real DB data.

---

## Phase 5 — Games Hub
**Goal**: Games list and per-game detail with tabs for patches, strategies, team, leaderboard.

**Claude Code Prompt:**
```
Read CLAUDE.md, docs/FEATURES.md (Section 4: Games Hub).

Build the games hub:
1. Create app/(public)/games/page.tsx — grid of supported games
2. Create app/(public)/games/[slug]/page.tsx — game detail with Tabs component
3. Create ui/Tabs.tsx component (URL-synced via searchParams)
4. Tabs: Patch Notes (news filtered by game + category), Strategies, Team Roster, Leaderboard
5. Game cover/logo display
6. Create loading states for each tab
```

**Done when**: Each game has a working detail page with all four tabs populated.

---

## Phase 6 — Tournaments
**Goal**: Tournament list, detail pages with bracket, and team registration.

**Claude Code Prompt:**
```
Read CLAUDE.md, docs/FEATURES.md (Section 5: Tournaments), docs/ADMIN.md (Bracket section).

Build the tournaments system:
1. Create app/(public)/tournaments/page.tsx — list with status filter tabs
2. Create app/(public)/tournaments/[id]/page.tsx — detail with Overview/Bracket/Teams/Results tabs
3. Create features/tournaments/TournamentCard.tsx
4. Create features/tournaments/TournamentBracket.tsx — visual bracket from matches rows
5. Create features/tournaments/TournamentRegistrationForm.tsx — team sign-up
6. Registration Server Action → inserts to tournament_teams + tournament_team_members
7. Show registered teams list (approved only shown publicly)
```

**Done when**: Tournaments list works, detail page shows bracket and teams, registration submits.

---

## Phase 7 — Roster, Members & Leaderboard
**Goal**: Team roster page, members/founders page, real-time leaderboard.

**Claude Code Prompt:**
```
Read CLAUDE.md, docs/FEATURES.md (Sections 6, 7, 8).

Build roster, members, and leaderboard:
1. Create app/(public)/roster/page.tsx — filterable by game
2. Create features/roster/PlayerCard.tsx, RosterGrid.tsx
3. Create app/(public)/members/page.tsx — Founders + Panel + All Members sections
4. Create app/(public)/leaderboard/page.tsx — ranked table with game/season filters
5. Create features/leaderboard/LeaderboardTable.tsx with Supabase Realtime subscription
6. Create features/leaderboard/LeaderboardFilters.tsx
7. Highlight current user's row on leaderboard
```

**Done when**: All three pages render correctly with real-time leaderboard working.

---

## Phase 8 — User Profile
**Goal**: Public profile pages, own profile editing, game account linking.

**Claude Code Prompt:**
```
Read CLAUDE.md, docs/FEATURES.md (Section 1: User Profile), docs/PAGES.md.

Build user profiles:
1. Create app/(protected)/profile/[username]/page.tsx
2. Create features/profile/ProfileHeader.tsx — avatar, name, bio, edit button
3. Create features/profile/GameAccountCard.tsx — linked game + rank
4. Create features/profile/ProfileStatsCard.tsx — wins/losses/points
5. Edit profile: inline editing for display_name, bio, discord_tag
6. Avatar upload to Supabase Storage (avatars/ bucket)
7. Add/remove linked game accounts (user_games table)
8. Tournament history section
9. Redirect /profile → /profile/[current_user_username]
```

**Done when**: Own profile editable, public profiles viewable, avatar upload works.

---

## Phase 9 — Apply Page
**Goal**: Working membership application form.

**Claude Code Prompt:**
```
Read CLAUDE.md, docs/FEATURES.md (Section 9: Apply).

Build the membership application:
1. Create app/(public)/apply/page.tsx — full form
2. Create app/(public)/apply/actions.ts — Server Action with Zod validation
3. Multi-select for preferred games (fetch from games table)
4. Confirmation page / success state after submit
5. If logged in, pre-fill name/email/discord from profile
6. Create app/(public)/apply/success/page.tsx
```

**Done when**: Form submits, validates, saves to DB, shows confirmation.

---

## Phase 10 — Admin Panel
**Goal**: Full CMS dashboard for admin and moderators.

**Claude Code Prompt:**
```
Read CLAUDE.md, docs/ADMIN.md, docs/FEATURES.md (Section 10 & 11).

Build the admin panel:
1. Create app/admin/layout.tsx — role guard + AdminSidebar
2. Create layout/AdminSidebar.tsx — icon nav, role-gated links
3. Create app/admin/page.tsx — dashboard with StatCards + recent audit log
4. Create app/admin/news/* — full CRUD with MarkdownEditor + cover upload
5. Create app/admin/roster/page.tsx — add/remove/update players
6. Create app/admin/tournaments/* — create/edit tournaments + bracket score entry
7. Create app/admin/applications/* — review + approve/reject
8. Create app/admin/games/page.tsx — add/toggle games, update patches
9. Create app/admin/users/page.tsx — role management (admin only)
10. Create app/admin/settings/page.tsx — site settings form (admin only)
11. Create app/admin/audit/page.tsx — audit log table (admin only)
12. Wire logAudit() to every action
13. Implement revalidatePath/revalidateTag on all mutations
```

**Done when**: Admin and mods can manage all content without touching code.

---

## Phase 11 — Polish & Production
**Goal**: Error states, SEO, performance, final styling pass.

**Claude Code Prompt:**
```
Read CLAUDE.md, docs/DEPLOYMENT.md.

Polish the project for production:
1. Add error.tsx and not-found.tsx to every route segment
2. Add generateMetadata to all public pages
3. Create app/api/og/route.tsx — Open Graph image generation
4. Verify all loading.tsx skeletons exist
5. Add mobile responsiveness pass — test all pages at 375px
6. Verify all RLS policies are correct (try accessing data as different roles)
7. Run pnpm build — fix all TypeScript errors
8. Run pnpm lint — fix all ESLint warnings
9. Add /403 page for unauthorized access
10. Verify environment variables are all in .env.example
11. Update this PHASES.md marking all phases complete
```

**Done when**: `pnpm build` passes clean, all pages work on mobile, RLS verified.

---

## Session Tips

- **Always read CLAUDE.md at session start** — it loads all context
- **Use Plan Mode first** (Shift+Tab twice) — review plan before Claude writes code
- **One phase per session** — don't mix features from different phases
- **Commit after each phase**: `git commit -m "feat: phase [N] — [description]"`
- **If Claude goes off track**: use `/rewind` to go back, don't try to fix bad output
- **Running low on context**: use `/compact` with "keep focus on current phase"
- **Type generation after schema changes**: run `supabase gen types typescript --local > src/types/supabase.ts`
