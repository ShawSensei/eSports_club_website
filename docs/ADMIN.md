# Admin Panel & Mod Channel Guide

## Access Control Summary

| Section | Admin | Moderator | Member |
|---|:---:|:---:|:---:|
| Dashboard | ✅ | ✅ | ❌ |
| News Manager | ✅ | ✅ | ❌ |
| Roster Manager | ✅ | ✅ | ❌ |
| Tournament Manager | ✅ | ✅ | ❌ |
| Match Score Entry | ✅ | ✅ | ❌ |
| Application Review | ✅ | ✅ | ❌ |
| Games Manager | ✅ | ❌ | ❌ |
| User Manager | ✅ | ❌ | ❌ |
| Site Settings | ✅ | ❌ | ❌ |
| Audit Log | ✅ | ❌ | ❌ |

Role check: **Always enforce server-side** in `admin/layout.tsx` using Supabase server client.
Never rely on client-side role checks alone.

---

## Server-Side Role Guard Pattern

```typescript
// app/admin/layout.tsx
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/admin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'moderator'].includes(profile.role)) {
    redirect('/403')
  }

  return <AdminLayoutUI role={profile.role}>{children}</AdminLayoutUI>
}
```

For admin-only sections (users, settings, audit), add a second check:
```typescript
if (profile.role !== 'admin') redirect('/admin') // redirect to dashboard
```

---

## Dynamic Content — How It Works Without Redeployment

All content is stored in Supabase (PostgreSQL). The Next.js frontend fetches it on every request (or via revalidation). There is no static content in the codebase that requires a redeploy to change.

### What admins/mods can change through the panel:

| Content | Table | How |
|---|---|---|
| News articles | `news_posts` | Create/edit/publish via Markdown editor |
| Announcements | `site_settings` | Toggle banner on/off, edit text |
| Team roster | `team_roster` | Add/remove/update players |
| Tournament info | `tournaments` | Create/edit tournaments, open registration |
| Match scores | `matches` | Enter scores in bracket view |
| Game list | `games` | Add games, update patch, toggle support |
| Club tagline | `site_settings` | Edit key-value |
| Social links | `site_settings` | Edit Discord/Twitter/YouTube URLs |
| Player stats | `player_stats` | Update via match result (auto or manual) |

### Revalidation Strategy
- News posts: `revalidatePath('/news')` + `revalidatePath('/news/[slug]')` on publish
- Roster changes: `revalidatePath('/roster')` + `revalidatePath('/games/[slug]')`
- Tournament changes: `revalidatePath('/tournaments')` + `revalidatePath('/tournaments/[id]')`
- Site settings: `revalidatePath('/')` on update
- Use `revalidateTag('news')` etc. for tag-based revalidation with `unstable_cache`

---

## News Post Workflow

1. Mod navigates to `/admin/news/new`
2. Fills: title (auto-generates slug), category, game (optional), cover image upload, body (Markdown editor with live preview), tags, excerpt
3. Saves as **Draft** — not visible publicly
4. Optionally previews at `/news/[slug]?preview=true` (requires auth)
5. Clicks **Publish** → `is_published = true`, `published_at = NOW()`
6. Post immediately visible on `/news` (Supabase Realtime triggers update)
7. Can be **pinned** (floats to top of feed) or **unpublished** (reverts to draft)

---

## Audit Logging

Every significant admin/mod action must be logged. Use the `logAudit()` helper:

```typescript
// src/lib/audit.ts
import { createAdminClient } from '@/lib/supabase/admin'

export async function logAudit(
  actorId: string,
  action: string,        // e.g. 'news.publish', 'user.role_change', 'tournament.create'
  targetType?: string,   // e.g. 'news_post', 'profile', 'tournament'
  targetId?: string,
  metadata?: Record<string, unknown>
) {
  const supabase = createAdminClient()
  await supabase.from('audit_log').insert({
    actor_id: actorId,
    action,
    target_type: targetType,
    target_id: targetId,
    metadata,
  })
}
```

Actions to log:
- `news.create`, `news.publish`, `news.unpublish`, `news.delete`
- `roster.add`, `roster.remove`, `roster.update`
- `tournament.create`, `tournament.status_change`, `tournament.scores_update`
- `user.role_change`, `user.deactivate`
- `application.approve`, `application.reject`
- `game.add`, `game.toggle`
- `settings.update`

---

## Tournament Bracket Management

Bracket data is stored as individual `matches` rows (not a JSON blob). This allows:
- Row-level score updates without rewriting the whole bracket
- Realtime subscriptions on individual match updates
- Proper relational integrity with `tournament_teams`

### Creating Brackets
When tournament status changes to `ongoing`, call a Server Action that generates match rows:
```typescript
// For single elimination with N teams:
// Round 1: N/2 matches
// Round 2: N/4 matches ... etc.
// Auto-assign team1/team2 from approved tournament_teams
```

### Score Entry (Mod)
1. Mod clicks match in bracket view → modal opens
2. Enters team1_score, team2_score
3. Selects winner
4. Server Action updates `matches` row + potentially auto-advances winner to next round
5. Realtime subscription updates bracket view for all viewers

---

## Site Settings Pattern

```typescript
// Reading settings (Server Component)
const { data } = await supabase
  .from('site_settings')
  .select('key, value')
  .in('key', ['club_name', 'announcement_banner', 'social_links'])

const settings = Object.fromEntries(data.map(r => [r.key, r.value]))

// Updating settings (Server Action, admin only)
export async function updateSetting(key: string, value: unknown) {
  // verify admin role first
  await supabase.from('site_settings')
    .upsert({ key, value, updated_by: userId, updated_at: new Date() })
  revalidatePath('/')
  logAudit(userId, 'settings.update', 'site_settings', key, { value })
}
```
