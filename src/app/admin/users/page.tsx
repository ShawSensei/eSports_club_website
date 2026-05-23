import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { UserRoleSelect } from './UserRoleSelect'

type UserRow = {
  id: string
  username: string
  display_name: string | null
  role: 'member' | 'moderator' | 'admin'
  is_active: boolean
  created_at: string
}

export default async function AdminUsersPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single<{ role: string }>()
  if (profile?.role !== 'admin') redirect('/admin')

  const { data } = await supabase
    .from('profiles')
    .select('id, username, display_name, role, is_active, created_at')
    .order('created_at', { ascending: false })

  const users = (data ?? []) as UserRow[]

  return (
    <div className="max-w-5xl">
      <h1 className="mb-6 text-2xl font-bold text-[var(--text-primary)]">User Manager</h1>

      <Card className="overflow-hidden p-0">
        <div className="border-b border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            <span>User</span>
            <span>Role</span>
            <span>Status</span>
            <span>Joined</span>
          </div>
        </div>
        {users.length === 0 ? (
          <p className="p-6 text-sm text-[var(--text-muted)]">No users found.</p>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {users.map(u => (
              <div key={u.id} className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center gap-4 px-4 py-3">
                <div>
                  <div className="font-medium text-[var(--text-primary)]">{u.display_name ?? u.username}</div>
                  <div className="text-xs text-[var(--text-muted)]">@{u.username}</div>
                </div>
                <UserRoleSelect
                  userId={u.id}
                  currentRole={u.role}
                  isSelf={u.id === user.id}
                />
                <Badge variant={u.is_active ? 'registration' : 'cancelled'}>
                  {u.is_active ? 'Active' : 'Inactive'}
                </Badge>
                <span className="text-xs text-[var(--text-muted)]">
                  {new Date(u.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
