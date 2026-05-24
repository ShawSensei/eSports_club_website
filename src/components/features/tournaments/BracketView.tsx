'use client'

import { useMemo } from 'react'
import {
  CARD_W, CARD_H, BASE_GAP, ARM_W, COL_W, ROUND_HDR,
  computeLayouts, bracketBodyHeight, getRoundLabel,
} from '@/lib/tournament/bracket'

// ─── Types ────────────────────────────────────────────────────────────────────

export type BracketMatch = {
  id: string
  round: number
  match_number: number
  team1_score: number | null
  team2_score: number | null
  status: string
  vod_url: string | null
  winner_id: string | null
  team1: { id: string; team_name: string } | null
  team2: { id: string; team_name: string } | null
}

interface BracketViewProps {
  matches: BracketMatch[]
}

const LINE  = 'rgba(255,255,255,0.1)'
const LINE_W = 1

// ─── Main component ───────────────────────────────────────────────────────────

export function BracketView({ matches }: BracketViewProps) {
  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <div style={{
          width: 52, height: 52, borderRadius: 12,
          background: 'rgba(150,138,223,0.1)',
          border: '1px solid rgba(150,138,223,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-purple)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
            <path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold" style={{ color: 'var(--text-sub)' }}>Bracket not yet generated</p>
          <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>The admin will generate the bracket once registration closes.</p>
        </div>
      </div>
    )
  }

  // Group + sort by round
  const rounds = useMemo(() => {
    const map: Record<number, BracketMatch[]> = {}
    for (const m of matches) {
      if (!map[m.round]) map[m.round] = []
      map[m.round].push(m)
    }
    Object.values(map).forEach(arr => arr.sort((a, b) => a.match_number - b.match_number))
    return map
  }, [matches])

  const roundNumbers = useMemo(
    () => Object.keys(rounds).map(Number).sort((a, b) => a - b),
    [rounds]
  )

  const totalRounds   = roundNumbers.length
  const layouts       = useMemo(() => computeLayouts(totalRounds), [totalRounds])
  const bodyH         = useMemo(() => bracketBodyHeight(totalRounds), [totalRounds])
  const totalW        = totalRounds * COL_W
  const totalH        = ROUND_HDR + bodyH

  return (
    <div className="overflow-x-auto pb-4 pt-2">
      <div style={{ position: 'relative', width: totalW, height: totalH, minWidth: totalW }}>

        {roundNumbers.map((roundNum, ri) => {
          const { offset, gap } = layouts[ri]
          const roundMatches    = rounds[roundNum]

          return (
            <div key={roundNum}>

              {/* ── Round header ── */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: ri * COL_W + ARM_W,
                width: CARD_W,
                height: ROUND_HDR,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: ri === totalRounds - 1 ? 'var(--accent)' : 'var(--text-muted)',
                }}>
                  {getRoundLabel(ri, totalRounds)}
                </span>
              </div>

              {/* ── Match cards ── */}
              {roundMatches.map((match, mi) => {
                const top  = ROUND_HDR + offset + mi * (CARD_H + gap)
                const left = ri * COL_W + ARM_W
                return (
                  <div key={match.id} style={{ position: 'absolute', top, left, width: CARD_W }}>
                    <MatchCard match={match} isFinal={ri === totalRounds - 1} />
                  </div>
                )
              })}

              {/* ── Connector lines to next round ── */}
              {ri < totalRounds - 1 && roundMatches.map((match, mi) => {
                if (mi % 2 !== 0) return null
                const below = roundMatches[mi + 1]
                if (!below) return null

                const y1   = ROUND_HDR + offset + mi * (CARD_H + gap) + CARD_H / 2
                const y2   = ROUND_HDR + offset + (mi + 1) * (CARD_H + gap) + CARD_H / 2
                const midY = (y1 + y2) / 2
                const xR   = ri * COL_W + ARM_W + CARD_W  // right edge of cards

                // Decide colour: highlight when a winner exists from this pair
                const hasAdvancer = match.winner_id !== null || below.winner_id !== null
                const lineColor = hasAdvancer ? 'rgba(192,251,80,0.35)' : LINE

                return (
                  <div key={`conn-${match.id}`} aria-hidden>
                    {/* Upper arm */}
                    <div style={{ position: 'absolute', left: xR,           top: y1,    width: ARM_W,     height: LINE_W, background: lineColor }} />
                    {/* Lower arm */}
                    <div style={{ position: 'absolute', left: xR,           top: y2,    width: ARM_W,     height: LINE_W, background: lineColor }} />
                    {/* Vertical joint */}
                    <div style={{ position: 'absolute', left: xR + ARM_W,   top: y1,    width: LINE_W,    height: y2 - y1, background: lineColor }} />
                    {/* Output arm */}
                    <div style={{ position: 'absolute', left: xR + ARM_W,   top: midY,  width: ARM_W,     height: LINE_W, background: lineColor }} />
                  </div>
                )
              })}
            </div>
          )
        })}

      </div>
    </div>
  )
}

// ─── Match card ───────────────────────────────────────────────────────────────

function MatchCard({ match, isFinal }: { match: BracketMatch; isFinal: boolean }) {
  const isLive      = match.status === 'live'
  const isCompleted = match.status === 'completed' || match.status === 'forfeit'

  return (
    <div
      className="overflow-hidden rounded-xl"
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${isLive ? 'var(--accent-fire)' : isFinal ? 'rgba(192,251,80,0.28)' : 'var(--border)'}`,
        boxShadow: isLive
          ? '0 0 14px rgba(255,72,32,0.22), inset 0 0 0 1px rgba(255,72,32,0.18)'
          : isFinal
          ? '0 0 18px rgba(192,251,80,0.08)'
          : 'none',
      }}
    >
      {/* LIVE banner */}
      {isLive && (
        <div className="flex items-center justify-center gap-1.5 px-3 py-1.5"
          style={{ background: 'rgba(255,72,32,0.15)', borderBottom: '1px solid rgba(255,72,32,0.28)' }}>
          <span style={{
            display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
            background: 'var(--accent-fire)',
            boxShadow: '0 0 6px rgba(255,72,32,0.9)',
            animation: 'live-dot 1.5s ease-in-out infinite',
            flexShrink: 0,
          }} />
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: '0.58rem', fontWeight: 700,
            letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--accent-fire)',
          }}>
            LIVE
          </span>
        </div>
      )}

      <TeamRow team={match.team1} score={match.team1_score} isWinner={match.winner_id === match.team1?.id} isCompleted={isCompleted} />
      <div style={{ height: 1, background: 'var(--border)' }} />
      <TeamRow team={match.team2} score={match.team2_score} isWinner={match.winner_id === match.team2?.id} isCompleted={isCompleted} />

      {/* VOD link */}
      {match.vod_url && isCompleted && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '4px 10px' }}>
          <a
            href={match.vod_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 transition-opacity hover:opacity-80"
            style={{ color: 'var(--accent-cyan)', fontSize: '0.6rem', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}
          >
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            Watch VOD
          </a>
        </div>
      )}
    </div>
  )
}

function TeamRow({
  team, score, isWinner, isCompleted,
}: {
  team: { id: string; team_name: string } | null
  score: number | null
  isWinner: boolean
  isCompleted: boolean
}) {
  const isTbd    = !team
  const textColor = isWinner
    ? 'var(--accent)'
    : isTbd
    ? 'var(--text-muted)'
    : isCompleted
    ? 'rgba(240,240,255,0.45)'
    : 'var(--text)'

  return (
    <div
      className="flex items-center justify-between px-3 py-2.5"
      style={{
        background: isWinner ? 'rgba(192,251,80,0.06)' : undefined,
        borderLeft: isWinner ? '2px solid var(--accent)' : '2px solid transparent',
      }}
    >
      <span
        className="truncate text-sm max-w-[148px]"
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: isWinner ? 800 : 500,
          color: textColor,
          letterSpacing: isTbd ? 0 : '-0.01em',
        }}
      >
        {team?.team_name ?? 'TBD'}
      </span>
      {isCompleted && score !== null && (
        <span
          className="ml-2 shrink-0 text-sm tabular-nums"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            color: isWinner ? 'var(--accent)' : 'rgba(240,240,255,0.3)',
          }}
        >
          {score}
        </span>
      )}
    </div>
  )
}
