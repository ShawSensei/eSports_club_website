# Quick Start Reference

## First Time Setup

```bash
# 1. Install Claude Code
npm install -g @anthropic-ai/claude-code

# 2. Create your project folder
mkdir esports-club && cd esports-club

# 3. Copy all docs into this folder
# Place CLAUDE.md at the ROOT of the project
# Place all docs/ files in a /docs subfolder

# 4. Start Claude Code
claude

# 5. First command in Claude Code:
# "Read CLAUDE.md and PHASES.md. We are starting Phase 1."
```

## Folder Layout (before coding starts)
```
esports-club/
├── CLAUDE.md          ← Claude Code reads this automatically every session
├── PHASES.md          ← Your build roadmap
└── docs/
    ├── DATABASE.md    ← Full schema + RLS policies
    ├── FEATURES.md    ← Every feature spec
    ├── PAGES.md       ← Routing + data fetching patterns
    ├── COMPONENTS.md  ← UI system + naming conventions
    ├── ADMIN.md       ← Admin/mod panel + dynamic content guide
    └── DEPLOYMENT.md  ← Free hosting setup
```

## Claude Code Cheat Sheet

| Action | Command |
|---|---|
| Start a session | `claude` in project root |
| Enable Plan Mode (think before code) | Shift + Tab (twice) |
| Compact context (long session) | `/compact` |
| Undo last change | `/rewind` |
| Run a bash command | Just ask Claude to run it |
| Generate Supabase types | `supabase gen types typescript --local > src/types/supabase.ts` |

## Phase Prompt Template
```
We are working on Phase [N]: [Phase Name].
Read CLAUDE.md first, then docs/[RELEVANT_DOC].md.
Use Plan Mode to show me your plan before writing any code.
[paste the Claude Code Prompt from PHASES.md]
```

## After Each Phase
```bash
git add -A
git commit -m "feat: phase [N] — [short description]"
git push origin main   # triggers Vercel auto-deploy
```
