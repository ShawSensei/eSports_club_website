<div align="center">

# Esports Club

**A full-stack platform for competitive gaming communities.**  
News · Rosters · Tournaments · Real-time Brackets · Admin Panel

![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=flat&logo=nextdotjs&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)

</div>

---

## Overview

A production-ready esports club website where all content — news, rosters, tournaments, site copy — is managed through an admin panel with no redeployment required. Built on Next.js 14 App Router with Supabase for database, auth, storage, and real-time updates.

---

## Features

**Public-facing**
- News feed with categories, game filters, Markdown rendering, and view counts
- Games hub with per-game patch notes, strategies, rosters, and leaderboards
- Tournament listings with status filters and team registration
- Real-time bracket viewer — scores update live without a page refresh
- Public user profiles with linked games, rank stats, and tournament history

**Authentication**
- Email/password and Discord OAuth via Supabase Auth
- Profile auto-created on first sign-in via database trigger
- Role system: `member` · `moderator` · `admin` — enforced at RLS, middleware, and layout levels

**Admin Panel**
- Full CRUD for news, games, tournaments, and team applications
- Bracket generation from approved teams — single-elimination, auto-seeded
- Live match score entry with VOD link support
- User role management and immutable audit log
- Site-wide settings (announcement banner, hero copy) — live edits, no redeploy

---

## Tech Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 14 (App Router, Server Components) |
| Database / Auth / Storage | Supabase (Postgres + RLS + Realtime) |
| Styling | Tailwind CSS + CSS custom properties |
| Animation | GSAP · Framer Motion · Lenis |
| Forms & Validation | React Hook Form + Zod |
| Deployment | Vercel |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, register
│   ├── (public)/        # Home, news, games, tournaments, profile
│   └── admin/           # Admin panel — role-gated
├── components/
│   ├── ui/              # Button, Badge, Card, Avatar, Skeleton
│   ├── features/        # Domain components: brackets, news, roster, etc.
│   └── layout/          # Header, Footer, AnnouncementBanner
├── lib/
│   ├── supabase/        # client.ts · server.ts · admin.ts
│   ├── tournament/      # Bracket generation and layout math
│   └── audit.ts         # Audit log helper
└── types/
    └── supabase.ts      # Auto-generated from Supabase schema
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Docker (required for local Supabase)
- [Supabase CLI](https://supabase.com/docs/guides/cli)

### Setup

```bash
# Clone and install
git clone https://github.com/ShawSensei/eSports_club_website.git
cd eSports_club_website
npm install

# Configure environment
cp .env.example .env.local
# Fill in your Supabase project values in .env.local

# Start local Supabase (Postgres + Auth + Storage via Docker)
supabase start

# Apply schema and seed sample data
supabase db reset

# Generate TypeScript types from the local schema
supabase gen types typescript --local > src/types/supabase.ts

# Start the dev server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # server-side only
NEXT_PUBLIC_SITE_URL=
```

---

## Commands

```bash
npm run dev           # Dev server
npm run build         # Production build
npm run lint          # ESLint
npm run typecheck     # TypeScript check

supabase start        # Start local Supabase
supabase db reset     # Wipe + reapply migrations and seed
supabase db push      # Push migrations to remote project
```

---

## Database

Schema in `supabase/migrations/`. Core tables:

| Table | Purpose |
|---|---|
| `profiles` | Extends `auth.users` — auto-created on signup via trigger |
| `news_posts` | Articles with category, game link, and publish state |
| `games` | Supported games with slug, cover, and patch info |
| `tournaments` | Event metadata, format, registration state |
| `tournament_teams` | Team registrations per tournament |
| `matches` | Bracket matches — Realtime-enabled for live score updates |
| `player_stats` | Per-game rank and stats per user |
| `site_settings` | Key/value store for all live-editable content |
| `audit_log` | Immutable record of every admin and moderator action |

Row Level Security is enabled on every table.

---

## Documentation

| File | Contents |
|---|---|
| `docs/DATABASE.md` | Schema, RLS policies, triggers, indexes |
| `docs/FEATURES.md` | Feature specs for every page |
| `docs/PAGES.md` | Routing and data-fetching patterns |
| `docs/COMPONENTS.md` | UI system, CSS variables, packages |
| `docs/ADMIN.md` | Admin panel, audit logging, bracket management |
| `docs/DEPLOYMENT.md` | Vercel + Supabase setup and git workflow |
| `docs/TOURNAMENT_MODULE.md` | Bracket generation architecture |

---

## License

Private repository. All rights reserved.
