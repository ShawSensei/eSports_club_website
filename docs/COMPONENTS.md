# Component Patterns & UI System

## Design Aesthetic
Dark gaming theme. Primary background: near-black (`#0a0a0f`). Accent: electric cyan/teal (`#00d4ff`). Secondary accent: neon purple (`#7c3aed`). All colors defined as CSS variables in `globals.css`.

## CSS Variables (`globals.css`)
```css
:root {
  --bg-primary: #0a0a0f;
  --bg-secondary: #111118;
  --bg-card: #16161f;
  --bg-elevated: #1e1e2a;
  --accent-primary: #00d4ff;
  --accent-secondary: #7c3aed;
  --accent-success: #10b981;
  --accent-danger: #ef4444;
  --accent-warning: #f59e0b;
  --text-primary: #f0f0f5;
  --text-secondary: #9090a8;
  --text-muted: #5a5a72;
  --border: #2a2a38;
  --border-hover: #3a3a50;
  --glow-cyan: 0 0 20px rgba(0, 212, 255, 0.3);
  --glow-purple: 0 0 20px rgba(124, 58, 237, 0.3);
  --font-display: 'Orbitron', sans-serif;   /* headers, game UI elements */
  --font-body: 'Inter', sans-serif;          /* body text */
}
```

---

## Component Directory: `src/components/`

### `/ui` — Primitive Components
Never import from here with barrel exports — import directly to keep bundle small.

**Button** (`ui/Button.tsx`)
```typescript
// Variants: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
// Sizes: 'sm' | 'md' | 'lg'
// Props: variant, size, loading, disabled, leftIcon, rightIcon
<Button variant="primary" size="md" loading={isLoading}>Register</Button>
```

**Badge** (`ui/Badge.tsx`)
```typescript
// Variants map to categories/statuses
// 'news' 'patch' 'strategy' 'event' 'announcement'
// 'upcoming' 'registration' 'ongoing' 'completed' 'cancelled'
// 'admin' 'moderator' 'member'
<Badge variant="ongoing">LIVE</Badge>
```

**Card** (`ui/Card.tsx`)
```typescript
// Variants: 'default' | 'hover' | 'highlighted'
// Hover variant gets border glow on hover
<Card variant="hover" className="...">...</Card>
```

**Avatar** (`ui/Avatar.tsx`)
```typescript
// Sizes: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
// Falls back to initials if no avatar_url
<Avatar src={user.avatar_url} name={user.display_name} size="md" />
```

**Skeleton** (`ui/Skeleton.tsx`)
```typescript
// Used in loading.tsx files
<Skeleton className="h-4 w-48" />
<SkeletonCard />  // pre-built news card skeleton
```

**Modal** (`ui/Modal.tsx`)
```typescript
// Accessible modal using Radix UI Dialog primitive
<Modal open={open} onClose={onClose} title="Register Team">
  <TeamRegistrationForm />
</Modal>
```

**Input / Textarea / Select** (`ui/forms/`)
```typescript
// All form elements wrap native elements with consistent dark theme styling
// Always pair with error message display
<Input label="Username" error={errors.username} {...register('username')} />
```

**Tabs** (`ui/Tabs.tsx`)
```typescript
// URL-sync tabs (updates searchParams) for pages, state-only for modals
<Tabs defaultValue="patch" syncUrl>
  <TabsList>
    <TabsTrigger value="patch">Patch Notes</TabsTrigger>
    <TabsTrigger value="strategy">Strategies</TabsTrigger>
  </TabsList>
  <TabsContent value="patch">...</TabsContent>
</Tabs>
```

---

### `/layout` — Structural Components

**Header** (`layout/Header.tsx`) — Client Component
- Logo + club name (from `site_settings` passed as prop)
- Nav links: Home, News, Games, Tournaments, Roster, Members, Leaderboard
- Right side: Auth state (login button OR user avatar + dropdown)
- Dropdown: Profile, Admin Panel (if mod/admin), Sign Out
- Mobile: hamburger menu with slide-out drawer
- Active link highlighting based on current path

**Footer** (`layout/Footer.tsx`)
- Club name, tagline, social links (Discord, Twitter, YouTube)
- Nav links grouped by section
- "Powered by Next.js + Supabase" attribution

**AdminSidebar** (`layout/AdminSidebar.tsx`)
- Icon + label nav links for all admin sections
- Role-gated: some links only visible to admin
- Collapsible on mobile

**AnnouncementBanner** (`layout/AnnouncementBanner.tsx`)
- Renders if `site_settings.announcement_banner.enabled`
- Dismissible per session (localStorage)
- Cyan gradient bar at top of page

---

### `/features` — Feature Components

**`features/news/`**
- `NewsCard.tsx` — grid card with cover, badges, title, excerpt, author, date
- `NewsFeed.tsx` — grid + pagination + filters
- `NewsDetail.tsx` — full post render (Markdown)
- `NewsFilters.tsx` — category + game filter bar

**`features/tournaments/`**
- `TournamentCard.tsx` — summary card
- `TournamentBracket.tsx` — visual bracket from `matches` data
- `TournamentRegistrationForm.tsx` — team sign-up form
- `MatchScoreEntry.tsx` — admin: enter score for a match

**`features/roster/`**
- `PlayerCard.tsx` — avatar, role, rank, captain badge
- `RosterGrid.tsx` — filterable grid by game

**`features/leaderboard/`**
- `LeaderboardTable.tsx` — ranked table, realtime-subscribed
- `LeaderboardFilters.tsx` — game + season selectors

**`features/profile/`**
- `ProfileHeader.tsx` — avatar, name, bio, discord, edit button (if own)
- `GameAccountCard.tsx` — linked game + rank display
- `ProfileStatsCard.tsx` — wins/losses/points

**`features/admin/`**
- `MarkdownEditor.tsx` — wraps `@uiw/react-md-editor`, dark theme
- `DataTable.tsx` — generic sortable/filterable admin table
- `ApplicationCard.tsx` — full application display + approve/reject actions
- `AuditLogTable.tsx` — formatted audit entries
- `StatCard.tsx` — dashboard stat box (number + label + trend)

---

## Naming Conventions
- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts` in `/hooks`
- Server actions: `camelCaseAction` in co-located `actions.ts`
- Types: `PascalCase` interfaces/types in `types/index.ts`
- Constants: `SCREAMING_SNAKE_CASE` in `constants/`
- Supabase query helpers: `getThingByParam()` in `lib/supabase/queries/`

## Import Order (enforced by ESLint)
1. React / Next.js
2. Third-party packages
3. Internal `@/lib`, `@/types`, `@/constants`
4. Internal `@/components`
5. Relative imports (`./`)
6. CSS modules (if any)

## Key Third-Party Packages
```json
{
  "@supabase/ssr": "latest",
  "@supabase/supabase-js": "latest",
  "react-markdown": "^9",
  "remark-gfm": "^4",
  "@uiw/react-md-editor": "^4",
  "zod": "^3",
  "react-hook-form": "^7",
  "@hookform/resolvers": "^3",
  "date-fns": "^3",
  "clsx": "^2",
  "tailwind-merge": "^2"
}
```
