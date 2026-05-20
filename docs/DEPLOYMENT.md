# Deployment Guide

## Everything Free — Zero Cost Stack

| Service | Usage | Free Tier Limits |
|---|---|---|
| **Vercel** | Next.js hosting | 100GB bandwidth, unlimited deployments |
| **Supabase** | DB + Auth + Storage | 500MB DB, 1GB storage, 50,000 monthly active users |
| **Cloudflare** (optional) | DNS + CDN | Free plan |

---

## Step 1: Supabase Setup

1. Create project at [supabase.com](https://supabase.com) → choose free tier
2. Note your **Project URL** and **anon key** from Settings → API
3. Note your **service_role key** (never expose this client-side)
4. Go to Settings → Auth → Providers → enable **Discord** OAuth:
   - Create Discord app at [discord.com/developers](https://discord.com/developers)
   - Copy Client ID + Secret into Supabase
   - Add redirect URL: `https://[your-project].supabase.co/auth/v1/callback`
5. Run migrations:
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   supabase login
   supabase link --project-ref [your-project-ref]
   supabase db push
   ```
6. Run seed: `supabase db reset` (applies migrations + seed in dev) or manually paste `supabase/seed.sql`

## Step 2: Local Development Setup

```bash
# Clone repo and install deps
git clone [your-repo]
cd esports-club
npm install

# Create .env.local (never commit this file)
cp .env.example .env.local
# Fill in your Supabase values

# Start dev server
npm run dev
```

**.env.example** (commit this, not .env.local):
```
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Step 3: Vercel Deployment

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
3. Framework: **Next.js** (auto-detected)
4. Add environment variables (same as .env.local but with production URL):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` → your Vercel URL e.g. `https://esports-club.vercel.app`
5. Deploy → Vercel auto-deploys on every push to `main`

## Step 4: Post-Deployment Checklist

- [ ] Add Vercel URL to Supabase Auth → URL Configuration → Site URL
- [ ] Add Vercel URL to Supabase Auth → Redirect URLs
- [ ] Update Discord OAuth redirect URL to production callback
- [ ] Create first admin user:
  1. Register via `/register`
  2. In Supabase dashboard → Table Editor → profiles → find your user → set `role = 'admin'`
- [ ] Add initial games via `/admin/games`
- [ ] Configure site settings at `/admin/settings`
- [ ] Test news publish flow end-to-end

---

## Git Workflow (Recommended)

```bash
# Never push directly to main
git checkout -b feature/news-feed
# ... make changes ...
git add -A
git commit -m "feat: implement news feed with pagination and filters"
git push origin feature/news-feed
# Create PR → merge to main → Vercel auto-deploys
```

Branch naming: `feature/`, `fix/`, `chore/`, `refactor/`

---

## Local Supabase (Optional, for offline dev)

```bash
# Requires Docker Desktop
supabase start           # Starts local Supabase (Postgres + Auth + Storage + Studio)
supabase stop            # Stop
# Local Studio: http://localhost:54323
# Local API: http://localhost:54321
```

Use separate `.env.local.docker` with local URLs for Docker-based dev.

---

## Performance Notes

- All public pages use Server Components → fast TTFB, SEO-friendly
- Images: use `next/image` with Supabase Storage URLs
- Font loading: use `next/font` for Orbitron + Inter (zero layout shift)
- Leaderboard + bracket: Supabase Realtime (WebSocket) — no polling
- News feed: `unstable_cache` with `revalidateTag` for ISR-like behavior
- Admin panel: no caching (always fresh data)
