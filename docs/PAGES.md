# Page Structure & Routing

## App Router Layout Hierarchy

```
app/
├── layout.tsx                    # Root layout (fonts, providers, global CSS)
├── globals.css                   # Tailwind + CSS variables (dark gaming theme)
│
├── (public)/                     # No auth required
│   ├── layout.tsx                # Public layout: Header + Footer
│   ├── page.tsx                  # / → Home
│   ├── news/
│   │   ├── page.tsx              # /news → News feed
│   │   └── [slug]/page.tsx       # /news/[slug] → Post detail
│   ├── games/
│   │   ├── page.tsx              # /games → Games hub
│   │   └── [slug]/page.tsx       # /games/[slug] → Game detail
│   ├── tournaments/
│   │   ├── page.tsx              # /tournaments → Tournament list
│   │   └── [id]/page.tsx         # /tournaments/[id] → Tournament detail
│   ├── roster/
│   │   └── page.tsx              # /roster → Team roster
│   ├── members/
│   │   └── page.tsx              # /members → Club members + founders
│   ├── leaderboard/
│   │   └── page.tsx              # /leaderboard → Rankings
│   └── apply/
│       └── page.tsx              # /apply → Membership application form
│
├── (auth)/                       # Auth pages (redirect to / if already logged in)
│   ├── layout.tsx                # Minimal layout (no nav)
│   ├── login/page.tsx            # /login
│   ├── register/page.tsx         # /register
│   └── auth/callback/route.ts   # Supabase OAuth callback handler
│
├── (protected)/                  # Requires any authenticated user
│   ├── layout.tsx                # Shared layout with auth check
│   └── profile/
│       ├── page.tsx              # /profile → Own profile (redirect to /profile/[username])
│       └── [username]/page.tsx   # /profile/[username] → User profile
│
├── admin/                        # Requires role = 'admin' OR 'moderator'
│   ├── layout.tsx                # Admin layout (sidebar nav, role check)
│   ├── page.tsx                  # /admin → Dashboard
│   ├── news/
│   │   ├── page.tsx              # /admin/news → Post list
│   │   ├── new/page.tsx          # /admin/news/new → Create post
│   │   └── [id]/page.tsx         # /admin/news/[id] → Edit post
│   ├── roster/page.tsx           # /admin/roster
│   ├── tournaments/
│   │   ├── page.tsx              # /admin/tournaments
│   │   ├── new/page.tsx          # /admin/tournaments/new
│   │   └── [id]/page.tsx         # /admin/tournaments/[id] → Edit + bracket
│   ├── users/page.tsx            # /admin/users (admin only)
│   ├── applications/
│   │   ├── page.tsx              # /admin/applications
│   │   └── [id]/page.tsx         # /admin/applications/[id]
│   ├── games/page.tsx            # /admin/games
│   ├── settings/page.tsx         # /admin/settings (admin only)
│   └── audit/page.tsx            # /admin/audit (admin only)
│
└── api/                          # Next.js API routes (use sparingly, prefer Server Actions)
    └── og/route.tsx              # Open Graph image generation
```

---

## Middleware (`src/middleware.ts`)

```typescript
// Protected paths and role requirements
const PROTECTED_PATHS = {
  '/profile': 'member',          // any logged-in user
  '/admin': 'moderator',         // mod or admin
  '/admin/users': 'admin',       // admin only
  '/admin/settings': 'admin',    // admin only
  '/admin/audit': 'admin',       // admin only
}
// Redirects unauthenticated users to /login?next=[path]
// Redirects unauthorized roles to /403
```

---

## Key Data Fetching Patterns

### Server Components (preferred)
```typescript
// In any page.tsx or layout.tsx
import { createServerClient } from '@/lib/supabase/server'

export default async function NewsPage() {
  const supabase = createServerClient()
  const { data: posts } = await supabase
    .from('news_posts')
    .select('*, author:profiles(username, avatar_url), game:games(name, slug)')
    .eq('is_published', true)
    .order('is_pinned', { ascending: false })
    .order('published_at', { ascending: false })
    .limit(12)
  return <NewsFeed posts={posts} />
}
```

### Server Actions (for mutations)
```typescript
// src/app/(public)/apply/actions.ts
'use server'
import { createServerClient } from '@/lib/supabase/server'
import { applicationSchema } from '@/lib/validations/application'

export async function submitApplication(formData: FormData) {
  const parsed = applicationSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.flatten() }
  const supabase = createServerClient()
  const { error } = await supabase.from('membership_applications').insert(parsed.data)
  if (error) return { error: 'Submission failed' }
  return { success: true }
}
```

### Realtime (Client Components)
```typescript
'use client'
// Subscribe to leaderboard changes
useEffect(() => {
  const channel = supabase
    .channel('leaderboard')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'player_stats',
    }, (payload) => {
      // update local state
    })
    .subscribe()
  return () => supabase.removeChannel(channel)
}, [])
```

---

## Page Metadata
Each public page exports a `generateMetadata` function:
```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  return {
    title: `${pageName} | Club Name`,
    description: '...',
    openGraph: { images: ['/api/og?...'] }
  }
}
```

---

## Error & Loading States
- `loading.tsx` — skeleton UI alongside every page that fetches data
- `error.tsx` — error boundary with "Try again" button alongside every route segment
- `not-found.tsx` — custom 404 page
- Global error page at `app/global-error.tsx`
