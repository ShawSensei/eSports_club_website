import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

type TournamentRow = {
  id: string
  name: string
  status: 'upcoming' | 'registration' | 'ongoing' | 'completed' | 'cancelled'
  format: string
  registration_open: boolean
  start_date: string | null
  game: { name: string } | null
}

export default async function AdminTournamentsPage() {
  const supabase = createClient()
  const { data } = await supabase
    .from('tournaments')
    .select('id, name, status, format, registration_open, start_date, game:games(name)')
    .order('created_at', { ascending: false })

  const tournaments = (data ?? []) as unknown as TournamentRow[]

  return (
    <div className="max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Tournaments</h1>
        <Link href="/admin/tournaments/new">
          <Button size="sm">+ New Tournament</Button>
        </Link>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="border-b border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3">
          <div className="grid grid-cols-[3fr_1fr_1fr_1fr_auto] gap-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            <span>Tournament</span>
            <span>Status</span>
            <span>Format</span>
            <span>Date</span>
            <span />
          </div>
        </div>
        {tournaments.length === 0 ? (
          <p className="p-6 text-sm text-[var(--text-muted)]">No tournaments yet.</p>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {tournaments.map(t => (
              <div key={t.id} className="grid grid-cols-[3fr_1fr_1fr_1fr_auto] items-center gap-4 px-4 py-3 text-sm">
                <div>
                  <div className="font-medium text-[var(--text-primary)]">{t.name}</div>
                  <div className="text-xs text-[var(--text-muted)]">{t.game?.name}</div>
                </div>
                <Badge variant={t.status}>{t.status}</Badge>
                <span className="text-xs capitalize text-[var(--text-muted)]">{t.format.replace(/_/g, ' ')}</span>
                <span className="text-xs text-[var(--text-muted)]">
                  {t.start_date ? new Date(t.start_date).toLocaleDateString() : '—'}
                </span>
                <Link href={`/admin/tournaments/${t.id}`} className="text-xs text-[var(--accent-primary)] hover:underline">
                  Manage
                </Link>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
