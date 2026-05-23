import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { ApplyForm } from './ApplyForm'

export const metadata: Metadata = {
  title: 'Apply for Membership',
  description: 'Join our esports club. Fill out the membership application form and our team will review your submission.',
}

type GameRow = { id: string; name: string }

type ProfilePrefill = {
  full_name: string
  email: string
  discord_tag: string
}

export default async function ApplyPage() {
  const supabase = createClient()

  const [{ data: { user } }, { data: games }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('games').select('id, name').eq('is_supported', true).order('sort_order'),
  ])

  let prefill: ProfilePrefill = { full_name: '', email: '', discord_tag: '' }

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, discord_tag')
      .eq('id', user.id)
      .single<{ display_name: string | null; discord_tag: string | null }>()

    prefill = {
      full_name: profile?.display_name ?? '',
      email: user.email ?? '',
      discord_tag: profile?.discord_tag ?? '',
    }
  }

  const gameList = (games ?? []) as GameRow[]

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10">
        <h1 className="mb-3 text-4xl font-bold text-[var(--text-primary)]">
          Apply for Membership
        </h1>
        <p className="text-[var(--text-secondary)]">
          Join our competitive gaming community. We welcome players of all skill levels who share
          a passion for esports and teamwork.
        </p>
      </div>

      {/* What to expect */}
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
        <ApplyForm games={gameList} prefill={prefill} />
      </Card>
    </div>
  )
}
