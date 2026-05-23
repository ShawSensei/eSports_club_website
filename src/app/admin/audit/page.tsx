import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

type AuditRow = {
  id: string
  action: string
  target_type: string | null
  target_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
  actor: { username: string; display_name: string | null } | null
}

export default async function AdminAuditPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single<{ role: string }>()
  if (profile?.role !== 'admin') redirect('/admin')

  const { data } = await supabase
    .from('audit_log')
    .select('id, action, target_type, target_id, metadata, created_at, actor:profiles(username, display_name)')
    .order('created_at', { ascending: false })
    .limit(100)

  const rows = (data ?? []) as unknown as AuditRow[]

  return (
    <div className="max-w-5xl">
      <h1 className="mb-6 text-2xl font-bold text-[var(--text-primary)]">Audit Log</h1>

      <Card className="overflow-hidden p-0">
        <div className="border-b border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3">
          <div className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            <span>Action</span>
            <span>Actor</span>
            <span>Target</span>
            <span>Time</span>
            <span />
          </div>
        </div>
        {rows.length === 0 ? (
          <p className="p-6 text-sm text-[var(--text-muted)]">No audit entries yet.</p>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {rows.map(row => (
              <div key={row.id} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] items-center gap-4 px-4 py-3 text-sm">
                <Badge variant="default" className="w-fit font-mono text-[10px]">{row.action}</Badge>
                <span className="text-[var(--text-secondary)]">
                  {row.actor?.display_name ?? row.actor?.username ?? '—'}
                </span>
                <span className="text-[var(--text-muted)]">
                  {row.target_type ?? '—'}
                  {row.target_id && <span className="ml-1 font-mono text-xs opacity-50">{row.target_id.slice(0, 8)}</span>}
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  {new Date(row.created_at).toLocaleString()}
                </span>
                <span />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
