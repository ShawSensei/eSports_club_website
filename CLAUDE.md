# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Full-stack esports club website — Next.js 14 App Router + Supabase (DB/Auth/Storage) + Tailwind CSS, deployed on Vercel. All content is managed via an admin panel; no redeployment needed for content changes.

## Key Commands
```bash
pnpm dev          # Start dev server (localhost:3000)
pnpm build        # Production build
pnpm lint         # ESLint check
pnpm typecheck    # TypeScript check
supabase start    # Start local Supabase (requires Docker)
supabase db push  # Push schema migrations to remote
supabase db reset # Wipe local DB, reapply migrations + seed.sql
supabase gen types typescript --local > src/types/supabase.ts  # Regenerate DB types after schema changes
```

## Architecture Rules (Never Violate)
- All DB access goes through `src/lib/supabase/` — never call Supabase directly in components
- Server Components fetch data; Client Components handle interactivity only
- RLS is ALWAYS enabled on every table — never disable it
- Admin routes under `/admin/**` must verify `role = 'admin'` or `role = 'moderator'` server-side in `admin/layout.tsx`
- Admin-only routes (users, settings, audit) need a second role check: `if (profile.role !== 'admin') redirect('/admin')`
- Use `@/` path alias for all imports

## The Three Supabase Clients

This is the most important architectural pattern — pick the wrong client and you either break RLS or can't read cookies.

| File | Use When |
|---|---|
| `src/lib/supabase/client.ts` | Client Components (browser) — uses `createBrowserClient` |
| `src/lib/supabase/server.ts` | Server Components, Server Actions, Route Handlers — uses `createServerClient` with cookies |
| `src/lib/supabase/admin.ts` | Admin-only server ops that must bypass RLS (e.g. `logAudit`, user role changes) — uses `SUPABASE_SERVICE_ROLE_KEY`, never expose client-side |

## Mutations: Two Required Steps

Every Server Action that writes data must do both:

1. **Revalidate** — call `revalidatePath()` or `revalidateTag()` so cached pages update without redeploy
2. **Audit log** — call `logAudit()` from `src/lib/audit.ts` for every admin/mod action

```typescript
// Pattern used in every Server Action that mutates
await supabase.from('news_posts').update({ is_published: true }).eq('id', id)
revalidatePath('/news')
revalidatePath(`/news/${slug}`)
await logAudit(userId, 'news.publish', 'news_post', id)
```

Revalidation targets by feature:
- News mutations → `revalidatePath('/news')`, `revalidatePath('/news/[slug]')`
- Roster changes → `revalidatePath('/roster')`, `revalidatePath('/games/[slug]')`
- Tournament changes → `revalidatePath('/tournaments')`, `revalidatePath('/tournaments/[id]')`
- Site settings → `revalidatePath('/')`

## Role System
```
member     → profile management, tournament registration
moderator  → news CRUD, roster updates, match scores, application review
admin      → everything + user role management + site settings + audit log
```
Roles live in `profiles.role`. Enforced by RLS policies **and** middleware **and** layout-level server checks — all three layers.

## Key Database Patterns

**`profiles` table** extends `auth.users` via a DB trigger (`handle_new_user`). Never insert into `profiles` manually — the trigger fires on `auth.users` insert and populates it from `raw_user_meta_data`.

**`site_settings` table** is a key-value store (`key TEXT PRIMARY KEY, value JSONB`). Read multiple keys at once and convert to an object:
```typescript
const { data } = await supabase.from('site_settings').select('key, value').in('key', [...])
const settings = Object.fromEntries(data.map(r => [r.key, r.value]))
```

**Tournament brackets** are stored as individual `matches` rows (not a JSON blob) so that Supabase Realtime can subscribe to individual match updates and mods can update scores without rewriting the whole bracket.

**`news_posts.slug`** must be unique. Auto-generate from title on create; never let the user enter it directly without sanitizing to URL-safe format.

## Supabase Storage Buckets
```
avatars/      → 2MB max, image/jpeg|png|webp, public read, auth write
covers/       → 5MB max, image/jpeg|png|webp, public read, mod write
game-assets/  → 5MB max, image/jpeg|png|webp, public read, admin write
```

## Real-time Subscriptions
Enable Realtime on: `news_posts`, `matches`, `player_stats`, `tournaments`. Subscribe in Client Components using `supabase.channel()` — always clean up with `supabase.removeChannel(channel)` in the effect cleanup.

## Code Style
- Functional components with hooks only
- `async/await` over `.then()` chains
- Server Components by default; `'use client'` only when needed for interactivity/hooks
- Named exports for components; default export only for page files
- Zod for all form validation and API input parsing
- Loading skeletons (not spinners) in `loading.tsx` files
- Error boundaries via `error.tsx` on all major route segments

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=    # server-side only, never expose to browser
NEXT_PUBLIC_SITE_URL=
```

## Detailed Docs
Read these before working on the corresponding feature:
- `docs/DATABASE.md` — full schema, RLS policies, triggers, indexes
- `docs/FEATURES.md` — feature specs for every page
- `docs/PAGES.md` — routing structure and data-fetching patterns
- `docs/COMPONENTS.md` — UI system, CSS variables, third-party packages
- `docs/ADMIN.md` — admin/mod panel, audit logging, bracket management
- `docs/DEPLOYMENT.md` — Vercel + Supabase setup, git workflow
- `PHASES.md` — phased build plan (one Claude Code session per phase)
