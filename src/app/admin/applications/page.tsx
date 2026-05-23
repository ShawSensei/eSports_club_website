import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

type AppRow = {
  id: string
  full_name: string
  email: string
  discord_tag: string | null
  preferred_games: string[] | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

const STATUS_TABS = ['all', 'pending', 'approved', 'rejected'] as const

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const supabase = createClient()
  const filter = searchParams.status ?? 'pending'

  let query = supabase
    .from('membership_applications')
    .select('id, full_name, email, discord_tag, preferred_games, status, created_at')
    .order('created_at', { ascending: false })

  if (filter !== 'all') {
    query = query.eq('status', filter)
  }

  const { data } = await query
  const apps = (data ?? []) as AppRow[]

  return (
    <div className="max-w-5xl">
      <h1 className="mb-6 text-2xl font-bold text-[var(--text-primary)]">Applications</h1>

      {/* Status filter */}
      <div className="mb-6 flex gap-2">
        {STATUS_TABS.map(s => (
          <Link
            key={s}
            href={s === 'all' ? '/admin/applications' : `/admin/applications?status=${s}`}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition ${
              filter === s || (s === 'all' && !searchParams.status)
                ? 'bg-[var(--accent-primary)] text-black'
                : 'border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      <Card className="overflow-hidden p-0">
        <div className="border-b border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3">
          <div className="grid grid-cols-[2fr_2fr_1fr_1fr_auto] gap-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            <span>Applicant</span>
            <span>Games</span>
            <span>Status</span>
            <span>Date</span>
            <span />
          </div>
        </div>
        {apps.length === 0 ? (
          <p className="p-6 text-sm text-[var(--text-muted)]">No applications found.</p>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {apps.map(app => (
              <div key={app.id} className="grid grid-cols-[2fr_2fr_1fr_1fr_auto] items-center gap-4 px-4 py-3 text-sm">
                <div>
                  <div className="font-medium text-[var(--text-primary)]">{app.full_name}</div>
                  <div className="text-xs text-[var(--text-muted)]">{app.email}</div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {(app.preferred_games ?? []).slice(0, 3).map(g => (
                    <span key={g} className="rounded bg-[var(--bg-elevated)] px-2 py-0.5 text-xs text-[var(--text-muted)]">{g}</span>
                  ))}
                </div>
                <Badge variant={app.status === 'pending' ? 'upcoming' : app.status === 'approved' ? 'registration' : 'cancelled'}>
                  {app.status}
                </Badge>
                <span className="text-xs text-[var(--text-muted)]">
                  {new Date(app.created_at).toLocaleDateString()}
                </span>
                <Link
                  href={`/admin/applications/${app.id}`}
                  className="text-xs text-[var(--accent-primary)] hover:underline"
                >
                  Review
                </Link>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
