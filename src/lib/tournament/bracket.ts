// Bracket generation + layout math for the tournament module.

export const CARD_W    = 224
export const CARD_H    = 90
export const BASE_GAP  = 12
export const ARM_W     = 32
export const COL_W     = CARD_W + ARM_W * 2   // 288
export const ROUND_HDR = 40                    // px reserved above bracket for round labels

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BracketTeam {
  id: string
  team_name: string
}

export interface GeneratedMatch {
  round: number
  match_number: number
  team1_id: string | null  // null = BYE / TBD
  team2_id: string | null
}

export interface RoundLayout {
  offset: number  // px from top of bracket body to first match in this round
  gap: number     // px between consecutive matches in this round
}

// ─── Seeding ──────────────────────────────────────────────────────────────────

// Standard tournament seeding: 1v(n), (n/2)v(n/2+1), etc.
// Recursive: getSeedings(8) = [1,8,4,5,2,7,3,6]
function getSeedings(n: number): number[] {
  if (n === 1) return [1]
  const half = getSeedings(n / 2)
  const result: number[] = []
  for (const s of half) {
    result.push(s)
    result.push(n + 1 - s)
  }
  return result
}

// ─── Single Elimination ───────────────────────────────────────────────────────

export function generateSingleElim(teams: BracketTeam[]): GeneratedMatch[] {
  const n = teams.length
  if (n < 2) throw new Error('Need at least 2 teams')

  // Pad to next power of 2 (extra slots become BYEs)
  const slots = Math.pow(2, Math.ceil(Math.log2(n)))
  const totalRounds = Math.log2(slots)
  const seedings = getSeedings(slots)

  const matches: GeneratedMatch[] = []

  // Round 1: pair up by seeded position
  for (let i = 0; i < slots; i += 2) {
    const s1 = seedings[i]
    const s2 = seedings[i + 1]
    matches.push({
      round: 1,
      match_number: i / 2 + 1,
      team1_id: s1 <= n ? teams[s1 - 1].id : null,
      team2_id: s2 <= n ? teams[s2 - 1].id : null,
    })
  }

  // Rounds 2..N: placeholder rows — filled in as winners advance
  for (let r = 2; r <= totalRounds; r++) {
    const count = slots / Math.pow(2, r)
    for (let m = 1; m <= count; m++) {
      matches.push({ round: r, match_number: m, team1_id: null, team2_id: null })
    }
  }

  return matches
}

// ─── Round Robin (Circle Method) ─────────────────────────────────────────────

export function generateRoundRobin(teams: BracketTeam[]): GeneratedMatch[] {
  const n = teams.length
  if (n < 2) throw new Error('Need at least 2 teams')

  // Add phantom BYE for odd counts
  const list = n % 2 === 0 ? [...teams] : [...teams, { id: 'BYE', team_name: 'BYE' }]
  const size = list.length
  const rounds = size - 1
  const matchesPerRound = size / 2

  const matches: GeneratedMatch[] = []
  let matchNum = 1

  for (let r = 0; r < rounds; r++) {
    for (let m = 0; m < matchesPerRound; m++) {
      const t1 = list[m]
      const t2 = list[size - 1 - m]
      if (t1.id !== 'BYE' && t2.id !== 'BYE') {
        matches.push({
          round: r + 1,
          match_number: matchNum++,
          team1_id: t1.id,
          team2_id: t2.id,
        })
      }
    }
    // Rotate: keep [0] fixed, rotate rest clockwise
    const fixed = list[0]
    const rest = list.slice(1)
    rest.unshift(rest.pop()!)
    list.splice(0, size, fixed, ...rest)
  }

  return matches
}

// ─── Layout Math ──────────────────────────────────────────────────────────────

// Returns per-round { offset, gap } so match cards can be absolutely positioned.
// offset = px from top of bracket body to first match in this round
// gap    = px between consecutive match cards in this round
export function computeLayouts(totalRounds: number): RoundLayout[] {
  let gap    = BASE_GAP
  let offset = 0
  return Array.from({ length: totalRounds }, () => {
    const layout = { offset, gap }
    offset = offset + (CARD_H + gap) / 2
    gap    = CARD_H + 2 * gap
    return layout
  })
}

// Total bracket body height (px) — driven by round-1 match count
export function bracketBodyHeight(totalRounds: number): number {
  const firstRoundMatches = Math.pow(2, totalRounds - 1)
  return firstRoundMatches * CARD_H + (firstRoundMatches - 1) * BASE_GAP
}

// ─── Round labels ─────────────────────────────────────────────────────────────

export function getRoundLabel(roundIndex: number, totalRounds: number): string {
  const fromEnd = totalRounds - 1 - roundIndex
  if (fromEnd === 0) return 'Final'
  if (fromEnd === 1) return 'Semi-Final'
  if (fromEnd === 2) return 'Quarter-Final'
  return `Round ${roundIndex + 1}`
}
