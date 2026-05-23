import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t mt-auto" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <p className="text-sm font-bold tracking-wider" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-primary)' }}>
              ESPORTS CLUB
            </p>
            <p className="mt-2 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Competing at the highest level. Join us on our journey.
            </p>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Play</p>
            <ul className="space-y-2">
              {[['Games', '/games'], ['Roster', '/roster'], ['Tournaments', '/tournaments']].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-sm transition-colors hover:text-white" style={{ color: 'var(--text-secondary)' }}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Community</p>
            <ul className="space-y-2">
              {[['News', '/news'], ['Members', '/members'], ['Leaderboard', '/leaderboard']].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-sm transition-colors hover:text-white" style={{ color: 'var(--text-secondary)' }}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Join</p>
            <ul className="space-y-2">
              {[['Apply', '/apply'], ['Register', '/register'], ['Login', '/login']].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-sm transition-colors hover:text-white" style={{ color: 'var(--text-secondary)' }}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t pt-6 sm:flex-row" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            &copy; {new Date().getFullYear()} Esports Club. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
