import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ApplicationActions } from './ApplicationActions'

type AppRow = {
  id: string
  full_name: string
  email: string
  discord_tag: string | null
  motivation: string
  preferred_games: string[] | null
  experience: string | null
  availability: string | null
  status: 'pending' | 'approved' | 'rejected'
  notes: string | null
  created_at: string
  reviewed_at: string | null
}

export default async function AdminApplicationDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data } = await supabase
    .from('membership_applications')
    .select('*')
    .eq('id', params.id)
    .single<AppRow>()

  if (!data) notFound()

  const statusBadge = data.status === 'pending' ? 'upcoming' : data.status === 'approved' ? 'registration' : 'cancelled'

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Application Review</h1>
        <Badge variant={statusBadge}>{data.status}</Badge>
      </div>

      <div className="space-y-4">
        <Card>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[var(--text-muted)]">Applicant Info</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Full Name" value={data.full_name} />
            <Field label="Email" value={data.email} />
            <Field label="Discord" value={data.discord_tag} />
            <Field label="Availability" value={data.availability} />
          </div>
          <div className="mt-3">
            <span className="text-xs text-[var(--text-muted)]">Preferred Games</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {(data.preferred_games ?? []).map(g => (
                <span key={g} className="rounded bg-[var(--bg-elevated)] px-2 py-0.5 text-xs text-[var(--text-secondary)]">{g}</span>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-[var(--text-muted)]">Motivation</h2>
          <p className="whitespace-pre-wrap text-sm text-[var(--text-secondary)]">{data.motivation}</p>
        </Card>

        {data.experience && (
          <Card>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-[var(--text-muted)]">Experience</h2>
            <p className="whitespace-pre-wrap text-sm text-[var(--text-secondary)]">{data.experience}</p>
          </Card>
        )}

        {data.notes && (
          <Card>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-[var(--text-muted)]">Review Notes</h2>
            <p className="text-sm text-[var(--text-secondary)]">{data.notes}</p>
          </Card>
        )}

        {data.status === 'pending' && (
          <ApplicationActions id={data.id} />
        )}

        <p className="text-xs text-[var(--text-muted)]">
          Submitted {new Date(data.created_at).toLocaleString()}
          {data.reviewed_at && ` · Reviewed ${new Date(data.reviewed_at).toLocaleString()}`}
        </p>
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <span className="text-xs text-[var(--text-muted)]">{label}</span>
      <p className="mt-0.5 text-sm text-[var(--text-primary)]">{value ?? '—'}</p>
    </div>
  )
}
