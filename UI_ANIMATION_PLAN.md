# UI Animation & Polish Plan

## Library Choice: Framer Motion + AutoAnimate

**Framer Motion** — primary animation engine.
- Page/section entrance animations (fade-up stagger)
- Animated stat counters (count-up on viewport entry)
- Micro-interactions (hover lifts, icon motion)
- Admin dashboard card reveals

**@formkit/auto-animate** — zero-config list animations.
- News card lists, audit log entries, tournament lists automatically animate
- No wrapper changes needed — one hook call

Both are React-native, SSR-safe, and tree-shakeable.

---

## Target Areas (Priority Order)

### 1. Admin Dashboard (`/admin`)
- **Stat cards**: count-up number animation on mount, subtle glow pulse on hover
- **Quick action links**: stagger reveal (each link fades in 50ms apart)
- **Audit log rows**: fade-in stagger as list renders
- **Page header**: slide-down entrance

### 2. Home Page (`/`)
- **Hero badge**: scale-in + fade on load
- **Hero headline**: word-by-word or line-by-line reveal
- **CTA buttons**: fade-up with slight spring
- **Stats bar**: count-up numbers when section enters viewport
- **News cards**: stagger fade-up on scroll into view
- **Tournament cards**: same stagger pattern
- **CTA banner**: fade-in + subtle border glow pulse

### 3. Public Cards (News, Tournaments, Games)
- Hover: slight Y-lift (`-translate-y-1`) with shadow expansion — already partially there via CSS, deepen with Framer
- Image zoom on hover already exists in CSS — keep it

### 4. Admin Sidebar
- Active nav item: animated left-border indicator (layoutId shared animation)
- Nav items: stagger on first mount

### 5. Shared UI Components
- **Card** component: wrap with `motion.div` when `variant="hover"` for spring-based hover
- **Badge**: pop-in scale animation on first render (useful for status badges)

---

## Animation Tokens (consistent across app)

```ts
// Reused in all motion components
export const fadeUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
}

export const stagger = {
  visible: { transition: { staggerChildren: 0.07 } },
}

export const scaleIn = {
  hidden:  { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}
```

---

## Implementation Files

| File | Change |
|---|---|
| `src/lib/motion.ts` | Animation variant tokens (shared) |
| `src/components/ui/AnimatedSection.tsx` | Viewport-triggered fade-up wrapper |
| `src/components/ui/AnimatedCounter.tsx` | Count-up number (Framer useMotionValue) |
| `src/app/(public)/page.tsx` | Hero + stats + cards entrance |
| `src/app/admin/page.tsx` → `DashboardClient.tsx` | Animated stat cards + audit stagger |
| `src/components/layout/AdminSidebar.tsx` | Active indicator layoutId |

---

## What We Are NOT Doing
- No page transitions (Next.js App Router layout transitions are experimental and fragile)
- No heavy GSAP (overkill, bundle size)
- No animations on form inputs (distracting in admin)
- No animations that block interaction (no loading spinners added)
