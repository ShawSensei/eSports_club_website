import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import HeaderClient from './HeaderClient'

export const NAV_LINKS = [
  { href: '/news', label: 'News' },
  { href: '/games', label: 'Games' },
  { href: '/roster', label: 'Roster' },
  { href: '/tournaments', label: 'Tournaments' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/members', label: 'Members' },
]

export default async function Header() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile: { display_name: string | null; avatar_url: string | null; role: string } | null = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('display_name, avatar_url, role')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{ background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(12px)', borderColor: 'var(--border)' }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-lg font-bold tracking-wider"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-primary)' }}
        >
          ESPORTS CLUB
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium transition-colors hover:text-white"
              style={{ color: 'var(--text-secondary)' }}
            >
              {label}
            </Link>
          ))}
        </nav>

        <HeaderClient user={user} profile={profile} navLinks={NAV_LINKS} />
      </div>
    </header>
  )
}
