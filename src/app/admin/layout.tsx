import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/layout/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/admin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, display_name, username')
    .eq('id', user.id)
    .single<{ role: string; display_name: string | null; username: string }>()

  if (!profile || !['admin', 'moderator'].includes(profile.role)) {
    redirect('/403')
  }

  const role = profile.role as 'admin' | 'moderator'

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <AdminSidebar role={role} />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--bg-card)] px-6">
          <div />
          <div className="flex items-center gap-3 text-sm">
            <span className="text-[var(--text-muted)]">{profile.display_name ?? profile.username}</span>
            <span className="rounded-md border border-[var(--border)] px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-[var(--accent-primary)]">
              {role}
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
