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
# Place .claude/ folder at the ROOT (contains settings, hooks, commands)

# 4. Start Claude Code
claude

# 5. First command in Claude Code:
# "Read CLAUDE.md and PHASES.md. We are starting Phase 1. Use plan mode."
```

## Folder Layout (before coding starts)
```
esports-club/
├── CLAUDE.md          ← Claude Code reads this automatically every session
├── PHASES.md          ← Your build roadmap
├── .claude/
│   ├── settings.json  ← Permissions + hooks (pre-configured)
│   ├── hooks/
│   │   └── post-write-migration.ps1  ← Auto-reminds to regenerate types
│   └── commands/
│       ├── gen-types.md    ← /gen-types slash command
│       ├── phase-check.md  ← /phase-check slash command
│       └── db-reset.md     ← /db-reset slash command
└── docs/
    ├── DATABASE.md    ← Full schema + RLS policies
    ├── FEATURES.md    ← Every feature spec
    ├── PAGES.md       ← Routing + data fetching patterns
    ├── COMPONENTS.md  ← UI system + naming conventions
    ├── ADMIN.md       ← Admin/mod panel + dynamic content guide
    └── DEPLOYMENT.md  ← Free hosting setup
```

## Claude Code Cheat Sheet

| Action | How |
|---|---|
| Start a session | `claude` in project root |
| Enter Plan Mode | Shift+Tab at the prompt (or type "use plan mode") |
| Run a shell command directly | Prefix with `!` — e.g. `! npm run dev` |
| Reference a file in your message | `@src/lib/supabase/server.ts` |
| Compact context (long session) | `/compact keep focus on Phase [N]` |
| Undo last change | `/rewind` |
| Regenerate Supabase types | `/gen-types` |
| Run quality gate (lint + typecheck + build) | `/phase-check` |
| Reset local DB | `/db-reset` |
| Code review of current branch | `/review` |
| Security review before shipping | `/security-review` |

## Phase Prompt Template
```
We are working on Phase [N]: [Phase Name].
Read CLAUDE.md first, then docs/[RELEVANT_DOC].md.
Use plan mode — show me the plan before writing any code.
```

## After Each Phase
```bash
# Run the quality gate first
/phase-check

# Then commit
git add -A
git commit -m "feat: phase [N] — [short description]"
git push origin main   # triggers Vercel auto-deploy
```

## Supabase Type Generation
Run this every time you write or modify a migration file:
```bash
supabase gen types typescript --local > src/types/supabase.ts
```
The `post-write-migration` hook will remind you automatically when a migration is written.
