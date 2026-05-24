# Tournament Module

Complete reference for the tournament system — formats, bracket logic, admin workflow, and data model.

---

## Formats Supported

| Format | Use-case | Bracket type |
|---|---|---|
| `single_elimination` | Knockouts, LAN finals | Tree bracket with connector lines |
| `round_robin` | League / group stage | Standings table + fixtures grid |
| `double_elimination` | Majors-style (future) | Winners + Losers bracket |
| `swiss` | Group-stage qualifier (future) | Round-by-round pairings |

Currently fully implemented: **single_elimination** and **round_robin**.

---

## Single Elimination — How It Works

### Seeding algorithm

For `n` teams, we find the next power-of-2 slot count (`slots`).  
Standard bracket seeding is generated recursively:

```
getSeedings(1) → [1]
getSeedings(n) → for each s in getSeedings(n/2): [s, n+1-s]
```

| Slots | Seedings | Pairs |
|---|---|---|
| 4 | [1,4,2,3] | (1v4), (2v3) |
| 8 | [1,8,4,5,2,7,3,6] | (1v8), (4v5), (2v7), (3v6) |
| 16 | [1,16,8,9,4,13,5,12,2,15,7,10,3,14,6,11] | etc. |

Top seeds face the weakest opponents in round 1. If `n` is not a power of 2, teams beyond the slot count are **BYEs** (null team_id). A BYE match auto-advances the present team.

### Match generation

Round 1 matches are generated with real team IDs from seedings.  
Rounds 2..N are created as empty placeholder rows (`team1_id = NULL, team2_id = NULL`).  
As admins enter scores and set `winner_id`, the winning team's ID is written into the next round's placeholder match.  
Future: automatic advancement can be triggered server-side when a score is saved.

### Round labels

| Distance from final | Label |
|---|---|
| 0 | Final |
| 1 | Semi-Final |
| 2 | Quarter-Final |
| ≥3 | Round N |

---

## Round Robin — How It Works

Uses the **Circle Method** for even team counts:
- Fix team[0], rotate the rest clockwise each round
- Round r has `n/2` matches; total `n-1` rounds
- For odd `n`: add a phantom BYE team, then remove BYE-matches

Displayed as a **standings table** (W/L/Pts/GD) + a full **fixtures grid**.

---

## Visual Bracket Layout

All measurements in pixels.

```
CARD_W  = 224   card width
CARD_H  = 90    card height (LIVE banner + 2 team rows)
BASE_GAP = 12   gap between match cards in round 1
ARM_W   = 32    half-width of connector (arm to joint, joint to next card)
COL_W   = CARD_W + ARM_W * 2   (= 288)  total width per bracket column
```

### Round layout formula

```typescript
function computeLayouts(totalRounds: number) {
  let gap = BASE_GAP, offset = 0
  return Array.from({ length: totalRounds }, () => {
    const layout = { offset, gap }
    offset = offset + (CARD_H + gap) / 2
    gap    = CARD_H + 2 * gap
    return layout
  })
}
```

### Connector lines

For each adjacent match pair `(A, B)` in round `r` feeding into match `C` in round `r+1`:

```
A  ─────┐
        |  ←── vertical joint at x = r * COL_W + CARD_W + ARM_W
B  ─────┘
           ────►  C  (output arm to C left edge)
```

- Upper arm: horizontal from `x_card_right` → `x_card_right + ARM_W`, at `center_A`
- Lower arm: same, at `center_B`
- Vertical: from `center_A` to `center_B` at `x = x_card_right + ARM_W`
- Output arm: from vertical joint midpoint → next column card left edge

---

## Database Schema

```
tournaments
  id, game_id, name, description, cover_url
  format: single_elimination | double_elimination | round_robin | swiss
  status: upcoming | registration | ongoing | completed | cancelled
  max_teams, prize_pool, rules_url, stream_url
  registration_open (bool)
  start_date, end_date, created_by

tournament_teams
  id, tournament_id, team_name, captain_id
  status: pending | approved | rejected | disqualified
  registered_at

tournament_team_members
  id, team_id, user_id

matches
  id, tournament_id, round, match_number
  team1_id, team2_id         — FKs to tournament_teams (nullable = BYE/TBD)
  team1_score, team2_score   — null until played
  winner_id                  — FK to tournament_teams
  vod_url, played_at
  status: scheduled | live | completed | forfeit

player_stats
  user_id, game_id, season
  wins, losses, draws, rank_points
```

---

## Admin Workflow

```
1. Create tournament (name, game, format, dates, max_teams)
2. Open registration → teams submit via public form
3. Review & approve/reject teams
4. Close registration
5. GENERATE BRACKET   ← triggers bracket.ts algorithm, inserts match rows
6. Advance status → ongoing
7. Per match:
   a. Set Live       → status = 'live'   (realtime updates public view)
   b. Enter scores   → team1_score, team2_score, winner_id, status = 'completed'
   c. Add VOD URL    → optional link to stream/recording
8. Advance status → completed
```

---

## Realtime

Supabase Realtime is enabled on the `matches` table.  
The public bracket page subscribes via `supabase.channel()` to `postgres_changes` events on `matches` filtered by `tournament_id`.  
Score updates and status changes (especially `live`) push immediately to all watching clients with no page reload.

---

## Files

| Path | Purpose |
|---|---|
| `src/lib/tournament/bracket.ts` | Generation algorithms + layout math |
| `src/components/features/tournaments/BracketView.tsx` | Visual bracket with connector lines |
| `src/components/features/tournaments/RealTimeBracket.tsx` | Realtime subscription wrapper |
| `src/components/features/tournaments/RoundRobinView.tsx` | Standings + fixtures for round-robin |
| `src/app/admin/tournaments/[id]/GenerateBracket.tsx` | Admin bracket generation UI |
| `src/app/admin/tournaments/[id]/MatchControls.tsx` | Live/Scheduled status toggle per match |
| `src/app/admin/tournaments/actions.ts` | Server actions (generateBracket, setMatchStatus, updateVodUrl) |
