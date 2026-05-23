'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/Button'
import { submitApplication } from './actions'

interface Game {
  id: string
  name: string
}

interface ApplyFormProps {
  games: Game[]
  prefill: {
    full_name: string
    email: string
    discord_tag: string
  }
}

const AVAILABILITY_OPTIONS = [
  'Less than 5 hours/week',
  '5–10 hours/week',
  '10–20 hours/week',
  '20+ hours/week',
]

export function ApplyForm({ games, prefill }: ApplyFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await submitApplication(fd)
      if (result && 'error' in result) {
        setError(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Info */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold uppercase tracking-widest text-[var(--accent-primary)]">
          Personal Info
        </legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="full_name" className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
              Full Name <span className="text-red-400">*</span>
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              required
              defaultValue={prefill.full_name}
              maxLength={100}
              placeholder="Your full name"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] transition focus:border-[var(--accent-primary)] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
              Email Address <span className="text-red-400">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              defaultValue={prefill.email}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] transition focus:border-[var(--accent-primary)] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="discord_tag" className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
            Discord Tag
          </label>
          <input
            id="discord_tag"
            name="discord_tag"
            type="text"
            defaultValue={prefill.discord_tag}
            maxLength={64}
            placeholder="username or username#0000"
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] transition focus:border-[var(--accent-primary)] focus:outline-none sm:max-w-sm"
          />
        </div>
      </fieldset>

      {/* Games */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold uppercase tracking-widest text-[var(--accent-primary)]">
          Preferred Games <span className="text-red-400">*</span>
        </legend>
        <p className="text-xs text-[var(--text-muted)]">Select all games you play or are interested in.</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {games.map(game => (
            <label
              key={game.id}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm transition hover:border-[var(--accent-primary)] has-[:checked]:border-[var(--accent-primary)] has-[:checked]:bg-[var(--accent-primary)]/10"
            >
              <input
                type="checkbox"
                name="preferred_games"
                value={game.name}
                className="accent-[var(--accent-primary)]"
              />
              <span className="text-[var(--text-secondary)]">{game.name}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Motivation */}
      <div>
        <label htmlFor="motivation" className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
          Why do you want to join? <span className="text-red-400">*</span>
        </label>
        <p className="mb-2 text-xs text-[var(--text-muted)]">Tell us about yourself and your motivation (min. 20 characters).</p>
        <textarea
          id="motivation"
          name="motivation"
          required
          rows={5}
          maxLength={2000}
          placeholder="I want to join because..."
          className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] transition focus:border-[var(--accent-primary)] focus:outline-none"
        />
      </div>

      {/* Experience */}
      <div>
        <label htmlFor="experience" className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
          Gaming Experience
        </label>
        <p className="mb-2 text-xs text-[var(--text-muted)]">Share your competitive history, ranks, teams you've been on, etc.</p>
        <textarea
          id="experience"
          name="experience"
          rows={4}
          maxLength={2000}
          placeholder="I've been playing competitively for..."
          className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] transition focus:border-[var(--accent-primary)] focus:outline-none"
        />
      </div>

      {/* Availability */}
      <div>
        <label htmlFor="availability" className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
          Weekly Availability
        </label>
        <select
          id="availability"
          name="availability"
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-2.5 text-sm text-[var(--text-primary)] transition focus:border-[var(--accent-primary)] focus:outline-none sm:max-w-xs"
        >
          <option value="">Prefer not to say</option>
          {AVAILABILITY_OPTIONS.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="flex items-center gap-4 border-t border-[var(--border)] pt-6">
        <Button type="submit" size="lg" loading={isPending}>
          Submit Application
        </Button>
        <p className="text-xs text-[var(--text-muted)]">
          We review all applications within 3–5 business days.
        </p>
      </div>
    </form>
  )
}
