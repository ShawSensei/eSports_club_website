# Nexus — Esports Club Platform

A full-stack esports club website built with Next.js 14, Supabase, and Tailwind CSS. Designed for competitive gaming communities that need a professional home: news, rosters, tournament management, real-time brackets, and a full admin panel — all without touching code after deploy.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database / Auth / Storage | Supabase |
| Styling | Tailwind CSS + CSS custom properties |
| Animation | GSAP, Framer Motion, Lenis |
| Forms | React Hook Form + Zod |
| Deployment | Vercel |

---

## Features

**Public**
- News feed with categories, game filters, Markdown rendering, and view counts
- Games hub with per-game patch notes, strategies, rosters, and leaderboards
- Tournament listings with status filters and registration flow
- Real-time bracket viewer — updates live as scores are entered, no refresh needed
- User profiles with linked games, rank stats, and tournament history

**Auth**
- Email/password and Discord OAuth via Supabase Auth
- Profile auto-created on first sign-in via DB trigger
- Three roles: `member`, `moderator`, `admin` — enforced at RLS, middleware, and layout levels

**Admin Panel** (`/admin`)
- Full CRUD for news posts, games, tournaments, and team applications
- Bracket generation from approved teams — single-elimination, seeded automatically
- Match score entry with VOD link support
- User role management and audit log
- Site settings (announcement banner, hero copy, club stats) — live, no redeploy

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, register
│   ├── (public)/        # Home, news, games, tournaments, profile
│   └── admin/           # Admin panel (role-gated)
├── components/
│   ├── ui/              # Primitives: Button, Badge, Card, Avatar, Skeleton
│   ├── features/        # Domain components: brackets, news cards, roster, etc.
│   └── layout/          # Header, Footer, AnnouncementBanner
├── lib/
│   ├── supabase/        # client.ts · server.ts · admin.ts
│   ├── tournament/      # Bracket generation and layout math
│   └── audit.ts         # Audit log helper
└── types/
    └── supabase.ts      # Auto-generated from schema
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Docker (for local Supabase)
- Supabase CLI

### Local setup

```bash
# 1. Install dependencies
npm install

# 2. Copy env and fill in your Supabase project values
cp .env.example .env.local

# 3. Start local Supabase (runs Postgres + Auth + Storage in Docker)
supabase start

# 4. Apply schema and seed data
supabase db reset

# 5. Generate TypeScript types from the local schema
supabase gen types typescript --local > src/types/supabase.ts

# 6. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=
```

`SUPABASE_SERVICE_ROLE_KEY` is server-side only — never expose it to the browser.

---

## Key Commands

```bash
npm run dev          # Dev server
npm run build        # Production build
npm run lint         # ESLint
npm run typecheck    # TypeScript check

supabase start       # Start local Supabase
supabase db reset    # Wipe + reapply migrations and seed
supabase db push     # Push local migrations to remote
```

---

## Database

Schema lives in `supabase/migrations/`. Core tables:

- `profiles` — extends `auth.users` (auto-created via trigger)
- `news_posts` — articles with category, game link, publish state
- `games` — supported games with slug, cover, patch info
- `tournaments` — event metadata, format, registration state
- `tournament_teams` — team registrations per tournament
- `matches` — individual bracket matches; Realtime-enabled for live score updates
- `player_stats` — per-game rank and stats per user
- `site_settings` — key/value store for all live-editable content
- `audit_log` — immutable record of every admin/mod action

Row Level Security is enabled on every table. Never disable it.

---

## Supabase Clients

Three clients — use the right one or you break RLS or cookie handling:

| File | Use when |
|---|---|
| `src/lib/supabase/client.ts` | Client Components (browser) |
| `src/lib/supabase/server.ts` | Server Components, Server Actions, Route Handlers |
| `src/lib/supabase/admin.ts` | Server-only ops that must bypass RLS |

---

## Deployment

Push to `main` → Vercel auto-deploys. For schema changes:

```bash
supabase db push   # Pushes new migrations to the remote Supabase project
```

After any schema change, regenerate types:

```bash
supabase gen types typescript --project-id <your-project-id> > src/types/supabase.ts
```

Full deployment notes in `docs/DEPLOYMENT.md`.

---

## Documentation

| File | Contents |
|---|---|
| `docs/DATABASE.md` | Full schema, RLS policies, triggers, indexes |
| `docs/FEATURES.md` | Feature specs for every page |
| `docs/PAGES.md` | Routing structure and data-fetching patterns |
| `docs/COMPONENTS.md` | UI system, CSS variables, third-party packages |
| `docs/ADMIN.md` | Admin panel, audit logging, bracket management |
| `docs/DEPLOYMENT.md` | Vercel + Supabase setup, git workflow |
| `docs/TOURNAMENT_MODULE.md` | Bracket generation architecture and usage |
| `PHASES.md` | Phased build plan |

---

## License

Private repository. All rights reserved.
