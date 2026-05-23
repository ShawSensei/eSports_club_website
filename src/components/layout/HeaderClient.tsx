'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { Avatar } from '@/components/ui/Avatar'
import { logout } from '@/app/(auth)/actions'

type Profile = { display_name: string | null; avatar_url: string | null; role: string } | null
type NavLink = { href: string; label: string }

export default function HeaderClient({
  user,
  profile,
  navLinks,
}: {
  user: User | null
  profile: Profile
  navLinks: NavLink[]
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const pathname = usePathname()

  const displayName = profile?.display_name ?? user?.email?.split('@')[0] ?? 'User'
  const isAdmin = profile?.role === 'admin' || profile?.role === 'moderator'

  return (
    <>
      {/* Desktop auth controls */}
      <div className="hidden items-center md:flex">
        {!user ? (
          <div className="flex items-center gap-3">
            <Link href="/login" className="rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:text-white" style={{ color: 'var(--text-secondary)' }}>
              Sign In
            </Link>
            <Link href="/register" className="rounded-lg px-4 py-2 text-sm font-semibold hover:opacity-90" style={{ background: 'var(--accent-primary)', color: '#000' }}>
              Join
            </Link>
          </div>
        ) : (
          <div className="relative">
            <button onClick={() => setDropdownOpen(o => !o)} className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-white/5">
              <Avatar src={profile?.avatar_url} name={displayName} size="sm" />
              <span className="hidden text-sm font-medium sm:block" style={{ color: 'var(--text-primary)' }}>{displayName}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)' }}>
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>
            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 top-12 z-20 w-48 rounded-xl border py-1 shadow-xl" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
                  <Link href="/profile" onClick={() => setDropdownOpen(false)} className="flex w-full items-center px-4 py-2 text-sm transition-colors hover:bg-white/5" style={{ color: 'var(--text-primary)' }}>My Profile</Link>
                  {isAdmin && (
                    <Link href="/admin" onClick={() => setDropdownOpen(false)} className="flex w-full items-center px-4 py-2 text-sm transition-colors hover:bg-white/5" style={{ color: 'var(--accent-primary)' }}>Admin Panel</Link>
                  )}
                  <div className="my-1 border-t" style={{ borderColor: 'var(--border)' }} />
                  <button
                    onClick={() => { setDropdownOpen(false); startTransition(() => logout()) }}
                    disabled={isPending}
                    className="flex w-full items-center px-4 py-2 text-sm transition-colors hover:bg-white/5 disabled:opacity-50"
                    style={{ color: 'var(--accent-danger)' }}
                  >
                    {isPending ? 'Signing out…' : 'Sign Out'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(o => !o)}
        className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-white/5 md:hidden"
        aria-label="Toggle menu"
      >
        {mobileOpen ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
        )}
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div
            className="fixed inset-y-0 right-0 z-50 flex w-72 flex-col border-l p-6 shadow-2xl"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            <div className="mb-6 flex items-center justify-between">
              <span className="font-bold tracking-wider" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-primary)' }}>ESPORTS CLUB</span>
              <button onClick={() => setMobileOpen(false)} className="rounded-lg p-1.5 hover:bg-white/5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>

            <nav className="flex flex-col gap-1">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-white/5"
                  style={{ color: pathname === href ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
                >
                  {label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto border-t pt-4" style={{ borderColor: 'var(--border)' }}>
              {!user ? (
                <div className="flex flex-col gap-2">
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="rounded-lg px-4 py-2.5 text-center text-sm font-medium border transition-colors hover:bg-white/5" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>Sign In</Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)} className="rounded-lg px-4 py-2.5 text-center text-sm font-bold hover:opacity-90" style={{ background: 'var(--accent-primary)', color: '#000' }}>Join the Club</Link>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <div className="mb-3 flex items-center gap-3 rounded-lg px-3 py-2" style={{ background: 'var(--bg-elevated)' }}>
                    <Avatar src={profile?.avatar_url} name={displayName} size="sm" />
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{displayName}</span>
                  </div>
                  <Link href="/profile" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-white/5" style={{ color: 'var(--text-primary)' }}>My Profile</Link>
                  {isAdmin && <Link href="/admin" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-white/5" style={{ color: 'var(--accent-primary)' }}>Admin Panel</Link>}
                  <button
                    onClick={() => { setMobileOpen(false); startTransition(() => logout()) }}
                    disabled={isPending}
                    className="rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-white/5 disabled:opacity-50"
                    style={{ color: 'var(--accent-danger)' }}
                  >
                    {isPending ? 'Signing out…' : 'Sign Out'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}
