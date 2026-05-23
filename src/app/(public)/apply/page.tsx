import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { ApplyForm } from './ApplyForm'

export const metadata: Metadata = {
  title: 'Apply for Membership',
  description: 'Join our esports club. Fill out the membership application form and our team will review your submission.',
}

type GameRow = { id: string; name: string }

export default async function ApplyPage() {
  const supabase = createClient()

  const [{ data: { user } }, { data: games }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('games').select('id, name').eq('is_supported', true).order('sort_order'),
  ])

  // Already have an account — no need to apply
  if (user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-10 text-center">
          <div className="mb-4 text-5xl">🎮</div>
          <h1 className="mb-3 text-2xl font-bold text-[var(--text-primary)]">
            You&apos;re already a member!
          </h1>
          <p className="mb-6 text-[var(--text-secondary)]">
            You already have an account. Head to your profile to manage your settings,
            or check out upcoming tournaments.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/profile"
              className="rounded-lg bg-[var(--accent-primary)] px-6 py-2 font-semibold text-black transition hover:opacity-90"
            >
              Go to Profile
            </Link>
            <Link
              href="/tournaments"
              className="rounded-lg border border-[var(--border)] px-6 py-2 font-semibold text-[var(--text-primary)] transition hover:bg-[var(--bg-card-hover)]"
            >
              View Tournaments
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const gameList = (games ?? []) as GameRow[]

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="mb-3 text-4xl font-bold text-[var(--text-primary)]">
          Apply for Membership
        </h1>
        <p className="text-[var(--text-secondary)]">
          Join our competitive gaming community. We welcome players of all skill levels who share
          a passion for esports and teamwork.
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          { icon: '📋', title: 'Apply', desc: 'Fill out the form below' },
          { icon: '🔍', title: 'Review', desc: 'We review within 3–5 days' },
          { icon: '🎮', title: 'Welcome', desc: 'Get access to all club features' },
        ].map(step => (
          <div
            key={step.title}
            className="flex flex-col items-center rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 text-center"
          >
            <span className="mb-2 text-2xl">{step.icon}</span>
            <span className="mb-1 font-semibold text-[var(--text-primary)]">{step.title}</span>
            <span className="text-xs text-[var(--text-muted)]">{step.desc}</span>
          </div>
        ))}
      </div>

      <Card>
        <ApplyForm games={gameList} prefill={{ full_name: '', email: '', discord_tag: '' }} />
      </Card>
    </div>
  )
}
