import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

type AuditRow = {
  id: string
  action: string
  target_type: string | null
  created_at: string
  actor: { username: string; display_name: string | null } | null
}

export default async function AdminDashboardPage() {
  const supabase = createClient()

  const [
    { count: pendingApps },
    { count: draftPosts },
    { count: activeTournaments },
    { data: recentAudit },
  ] = await Promise.all([
    supabase.from('membership_applications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('news_posts').select('*', { count: 'exact', head: true }).eq('is_published', false),
    supabase.from('tournaments').select('*', { count: 'exact', head: true }).in('status', ['upcoming', 'registration', 'ongoing']),
    supabase.from('audit_log').select('id, action, target_type, created_at, actor:profiles(username, display_name)').order('created_at', { ascending: false }).limit(8),
  ])

  const auditRows = (recentAudit ?? []) as unknown as AuditRow[]

  const stats = [
    { label: 'Pending Applications', value: pendingApps ?? 0, href: '/admin/applications', color: 'text-yellow-400' },
    { label: 'Unpublished Drafts', value: draftPosts ?? 0, href: '/admin/news', color: 'text-blue-400' },
    { label: 'Active Tournaments', value: activeTournaments ?? 0, href: '/admin/tournaments', color: 'text-[var(--accent-primary)]' },
  ]

  return (
    <div className="max-w-5xl">
      <h1 className="mb-6 text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {stats.map(s => (
          <Link key={s.label} href={s.href}>
            <Card variant="hover" className="text-center">
              <div className={`mb-1 text-4xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-sm text-[var(--text-muted)]">{s.label}</div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-[var(--text-muted)]">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'New Post', href: '/admin/news/new' },
            { label: 'New Tournament', href: '/admin/tournaments/new' },
            { label: 'Review Applications', href: '/admin/applications' },
            { label: 'Manage Roster', href: '/admin/roster' },
          ].map(a => (
            <Link
              key={a.label}
              href={a.href}
              className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-2 text-sm text-[var(--text-secondary)] transition hover:border-[var(--accent-primary)] hover:text-[var(--text-primary)]"
            >
              {a.label}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[var(--text-muted)]">Recent Activity</h2>
          <Link href="/admin/audit" className="text-xs text-[var(--accent-primary)] hover:underline">View all</Link>
        </div>
        <Card className="overflow-hidden p-0">
          {auditRows.length === 0 ? (
            <p className="p-4 text-sm text-[var(--text-muted)]">No activity yet.</p>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {auditRows.map(row => (
                <div key={row.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                  <Badge variant="default" className="shrink-0 font-mono text-[10px]">{row.action}</Badge>
                  <span className="text-[var(--text-muted)]">
                    by <span className="text-[var(--text-secondary)]">{row.actor?.display_name ?? row.actor?.username ?? '—'}</span>
                  </span>
                  <span className="ml-auto shrink-0 text-xs text-[var(--text-muted)]">
                    {new Date(row.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
