# Complete UI Redesign — Next Level Esports

## Design Direction
Award-winning esports aesthetic: pure black base, single electric cyan accent (#00D4FF),
noise grain texture everywhere, vertical icon sidebar on public pages, GSAP scroll reveals,
custom dual-layer cursor, GSAP preloader with curtain wipe.

## Stack additions
- lenis — smooth scroll (replaces native scroll jitter)
- gsap + @gsap/react — scroll animations, text splits, magnetic buttons, preloader
- split-type — character/word-level text reveal

Framer Motion stays for admin dashboard only (lighter context).

## Implementation phases

### 1. Global foundation (globals.css + fonts + vars)
- Import Barlow Condensed 700/800/900 + Inter from Google Fonts
- Replace current CSS vars with tighter dark palette
- Add: noise grain ::before on body, dot-grid overlay, scanline sweep
- Add: --font-display, neon glow utility classes

### 2. Custom Cursor (desktop only, hidden on touch)
- `src/components/ui/CustomCursor.tsx` — dot + lagging ring, GSAP quickTo
- Ring expands + turns accent on hover over links/buttons
- Text cursor state on form inputs
- Excluded on mobile (pointer: coarse)

### 3. Preloader / Intro screen
- `src/components/ui/Preloader.tsx` — GSAP counter 0→100, then curtain slides up
- Shown only on first visit (sessionStorage flag)
- Emits onComplete → triggers page entrance animations

### 4. Smooth scroll
- `src/components/layout/SmoothScroll.tsx` — ReactLenis wrapper
- Wrap public layout only (admin stays native for form usability)

### 5. Public navigation — left vertical sidebar
- `src/components/layout/PublicNav.tsx` — replaces current top nav
- Collapsed: 72px, icon + tooltip
- Expanded: 220px on hover
- Logo at top, nav items with left-border active indicator
- Bottom: socials, theme hint
- `src/app/(public)/layout.tsx` — full-width flex layout

### 6. Home page — full rebuild
- Hero: full-viewport, video-ready background (gradient fallback), Barlow Condensed
  massive title with GSAP SplitType char reveal, magnetic CTA button
- Noise + grid overlay on hero
- Stats bar: animated count-up with GSAP
- News section: staggered cards with 3D tilt + glow border
- Games section (new): horizontal scroll pinned section
- CTA banner: glitch text effect, gradient border

### 7. Cards — 3D tilt + glow
- `src/components/ui/TiltCard.tsx` — wraps any card with perspective tilt + shine layer
- Used on: news cards, tournament cards, game cards

### 8. Magnetic buttons
- `src/components/ui/MagneticButton.tsx` — GSAP quickTo magnetic effect
- Used on: primary CTAs (Join Club, Apply, Register)

### 9. Text reveal animations
- `src/hooks/useGSAPReveal.ts` — custom hook, SplitType + ScrollTrigger
- Applied to all `<h1>`, `<h2>` elements on public pages

### 10. Admin — keep Framer Motion, add polish
- Stat card micro-interactions (glow on hover, count-up already done)
- No cursor, no preloader in admin

## Files changed/created (complete list)
- globals.css — complete rewrite
- src/app/layout.tsx — add Cursor, Preloader
- src/components/ui/CustomCursor.tsx
- src/components/ui/Preloader.tsx
- src/components/ui/TiltCard.tsx
- src/components/ui/MagneticButton.tsx
- src/components/layout/SmoothScroll.tsx
- src/components/layout/PublicNav.tsx (new — replaces Navbar.tsx)
- src/app/(public)/layout.tsx — left sidebar layout
- src/app/(public)/page.tsx — complete hero rebuild
