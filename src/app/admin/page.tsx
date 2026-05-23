import { createClient } from '@/lib/supabase/server'
import { DashboardClient } from './DashboardClient'

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
    {
      label: 'Pending Applications',
      value: pendingApps ?? 0,
      href: '/admin/applications',
      accent: '#facc15',
      glowColor: 'rgba(250,204,21,0.25)',
      bg: 'linear-gradient(135deg, rgba(250,204,21,0.07) 0%, rgba(10,10,10,0.9) 100%)',
      icon: '📋',
    },
    {
      label: 'Unpublished Drafts',
      value: draftPosts ?? 0,
      href: '/admin/news',
      accent: '#60a5fa',
      glowColor: 'rgba(96,165,250,0.25)',
      bg: 'linear-gradient(135deg, rgba(96,165,250,0.07) 0%, rgba(10,10,10,0.9) 100%)',
      icon: '📝',
    },
    {
      label: 'Active Tournaments',
      value: activeTournaments ?? 0,
      href: '/admin/tournaments',
      accent: '#00d4ff',
      glowColor: 'rgba(0,212,255,0.25)',
      bg: 'linear-gradient(135deg, rgba(0,212,255,0.07) 0%, rgba(10,10,10,0.9) 100%)',
      icon: '🏆',
    },
  ]

  const quickActions = [
    { label: 'New Post',            href: '/admin/news/new',       icon: '✏️' },
    { label: 'New Tournament',      href: '/admin/tournaments/new', icon: '🎮' },
    { label: 'Review Applications', href: '/admin/applications',    icon: '👥' },
    { label: 'Manage Roster',       href: '/admin/roster',          icon: '⚔️' },
  ]

  return <DashboardClient stats={stats} quickActions={quickActions} auditRows={auditRows} />
}
