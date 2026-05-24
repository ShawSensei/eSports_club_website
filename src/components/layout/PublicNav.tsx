'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cloneElement, isValidElement, useState, useTransition } from 'react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import { logout } from '@/app/(auth)/actions'
import type { User } from '@supabase/supabase-js'

type Profile = { display_name: string | null; avatar_url: string | null; role: string } | null

const NAV = [
  {
    href: '/news',
    label: 'News',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ),
  },
  {
    href: '/games',
    label: 'Games',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
      </svg>
    ),
  },
  {
    href: '/roster',
    label: 'Roster',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    href: '/tournaments',
    label: 'Tournaments',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
  {
    href: '/leaderboard',
    label: 'Leaderboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    href: '/members',
    label: 'Members',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
]

interface PublicNavProps {
  user: User | null
  profile: Profile
}

export function PublicNav({ user, profile }: PublicNavProps) {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const displayName = profile?.display_name ?? user?.email?.split('@')[0] ?? 'User'
  const isAdmin = profile?.role === 'admin' || profile?.role === 'moderator'

  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href)
  const rowLayoutClassName = expanded ? 'gap-3 px-[14px]' : 'justify-center px-0'
  const renderNavIcon = (icon: React.ReactNode, active: boolean) => {
    if (!isValidElement(icon)) return icon

    return cloneElement(icon, {
      fill: active ? 'var(--accent-primary)' : 'none',
      stroke: active ? '#000' : 'currentColor',
      strokeWidth: active ? 1.2 : icon.props.strokeWidth,
    })
  }

  return (
    <>
      {/* ── Desktop Vertical Sidebar ── */}
      <nav
        className="fixed inset-y-0 left-0 z-50 hidden flex-col border-r md:flex"
        style={{
          width: expanded ? 'var(--sidebar-w-open)' : 'var(--sidebar-w)',
          background: 'rgba(0,0,0,0.92)',
          backdropFilter: 'blur(16px)',
          borderColor: 'var(--border)',
          transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
          overflow: 'hidden',
        }}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => { setExpanded(false); setUserMenuOpen(false) }}
      >
        {/* Logo */}
        <Link href="/" className={cn('flex h-16 shrink-0 items-center border-b', expanded ? 'gap-3 px-[18px]' : 'justify-center px-0')} style={{ borderColor: 'var(--border)' }}>
          {/* Logo icon */}
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-xs font-black"
            style={{ background: 'var(--accent-primary)', color: '#000', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
          >
            EC
          </div>
          <span
            className="whitespace-nowrap text-sm font-black uppercase tracking-widest"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--text-primary)',
              opacity: expanded ? 1 : 0,
              maxWidth: expanded ? '140px' : '0px',
              overflow: 'hidden',
              transition: 'opacity 0.2s 0.05s, max-width 0.25s ease',
            }}
          >
            Esports Club
          </span>
        </Link>

        {/* Nav items */}
        <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
          {NAV.map(item => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn('group relative flex items-center rounded-lg py-2.5 text-xs font-semibold uppercase tracking-widest transition-colors duration-150', rowLayoutClassName)}
                style={{
                  color: active ? 'var(--accent-primary)' : 'rgba(255,255,255,0.35)',
                  background: active ? 'rgba(0,212,255,0.07)' : 'transparent',
                  borderLeft: active ? '2px solid var(--accent-primary)' : '2px solid transparent',
                  fontFamily: 'var(--font-display)',
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = '#fff'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)' }}
                onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)'; (e.currentTarget as HTMLElement).style.background = 'transparent' } }}
              >
                <span className="shrink-0" style={{ color: 'currentColor' }}>{renderNavIcon(item.icon, active)}</span>
                <span
                  className="whitespace-nowrap"
                  style={{
                    opacity: expanded ? 1 : 0,
                    maxWidth: expanded ? '140px' : '0px',
                    overflow: 'hidden',
                    transition: 'opacity 0.2s 0.05s, max-width 0.25s ease',
                    letterSpacing: '0.1em',
                  }}
                >
                  {item.label}
                </span>

                {/* Tooltip when collapsed */}
                {!expanded && (
                  <span
                    className="pointer-events-none absolute left-full ml-3 rounded-md px-2 py-1 text-xs font-semibold opacity-0 group-hover:opacity-100"
                    style={{
                      background: 'var(--bg-elevated)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border)',
                      whiteSpace: 'nowrap',
                      fontFamily: 'var(--font-display)',
                      letterSpacing: '0.08em',
                      transition: 'opacity 0.15s 0.1s',
                    }}
                  >
                    {item.label}
                  </span>
                )}
              </Link>
            )
          })}
        </div>

        {/* Divider + Apply CTA */}
        <div className="shrink-0 border-t p-2" style={{ borderColor: 'var(--border)' }}>
          <Link
            href="/apply"
            className={cn('flex items-center rounded-lg py-2.5 text-xs font-black uppercase tracking-widest transition-all duration-150', rowLayoutClassName)}
            style={{
              fontFamily: 'var(--font-display)',
              background: 'rgba(0,212,255,0.1)',
              color: 'var(--accent-primary)',
              border: '1px solid rgba(0,212,255,0.2)',
              letterSpacing: '0.1em',
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span
              className="whitespace-nowrap"
              style={{
                opacity: expanded ? 1 : 0,
                maxWidth: expanded ? '140px' : '0px',
                overflow: 'hidden',
                transition: 'opacity 0.2s 0.05s, max-width 0.25s ease',
              }}
            >
              Join Club
            </span>
          </Link>
        </div>

        {/* User section */}
        <div className="shrink-0 border-t p-2" style={{ borderColor: 'var(--border)' }}>
          {!user ? (
            <Link
              href="/login"
              className={cn('flex items-center rounded-lg py-2.5 text-xs font-semibold uppercase tracking-widest transition-colors', rowLayoutClassName)}
              style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }}
            >
              <span className="shrink-0">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-[18px] w-[18px] shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </span>
              <span
                className="whitespace-nowrap"
                style={{
                  opacity: expanded ? 1 : 0,
                  maxWidth: expanded ? '140px' : '0px',
                  overflow: 'hidden',
                  transition: 'opacity 0.2s 0.05s, max-width 0.25s ease',
                }}
              >
                Sign In
              </span>
            </Link>
          ) : (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(o => !o)}
                className={cn('flex w-full items-center rounded-lg py-2.5 transition-colors hover:bg-white/5', rowLayoutClassName)}
              >
                <Avatar src={profile?.avatar_url} name={displayName} size="sm" className="shrink-0" />
                <span
                  className="whitespace-nowrap text-left text-xs font-medium"
                  style={{
                    color: 'var(--text-secondary)',
                    opacity: expanded ? 1 : 0,
                    maxWidth: expanded ? '140px' : '0px',
                    overflow: 'hidden',
                    transition: 'opacity 0.2s 0.05s, max-width 0.25s ease',
                  }}
                >
                  {displayName}
                </span>
              </button>
              {userMenuOpen && expanded && (
                <div
                  className="absolute bottom-full left-0 mb-1 w-48 rounded-xl border py-1 shadow-2xl"
                  style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
                >
                  <Link href="/profile" className="flex px-4 py-2 text-xs font-medium hover:bg-white/5 transition-colors" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '0.06em' }}>
                    My Profile
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" className="flex px-4 py-2 text-xs font-medium hover:bg-white/5 transition-colors" style={{ color: 'var(--accent-primary)', fontFamily: 'var(--font-display)', letterSpacing: '0.06em' }}>
                      Admin Panel
                    </Link>
                  )}
                  <div className="my-1 border-t" style={{ borderColor: 'var(--border)' }} />
                  <button
                    onClick={() => startTransition(() => logout())}
                    disabled={isPending}
                    className="flex w-full px-4 py-2 text-xs font-medium hover:bg-white/5 transition-colors disabled:opacity-50"
                    style={{ color: 'var(--accent-danger)', fontFamily: 'var(--font-display)', letterSpacing: '0.06em' }}
                  >
                    {isPending ? 'Signing out…' : 'Sign Out'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* ── Mobile Top Bar ── */}
      <header
        className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between border-b px-4 md:hidden"
        style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(12px)', borderColor: 'var(--border)' }}
      >
        <Link href="/" className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded text-xs font-black"
            style={{ background: 'var(--accent-primary)', color: '#000', fontFamily: 'var(--font-display)' }}
          >
            EC
          </div>
          <span className="text-sm font-black uppercase tracking-widest" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-primary)' }}>
            Esports Club
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(o => !o)}
          className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white/5"
        >
          {mobileOpen
            ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
            : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
          }
        </button>
      </header>

      {/* ── Mobile Drawer ── */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/70 md:hidden" onClick={() => setMobileOpen(false)} />
          <div
            className="fixed inset-y-0 right-0 z-50 flex w-72 flex-col border-l p-6 shadow-2xl md:hidden"
            style={{ background: '#000', borderColor: 'var(--border)' }}
          >
            <div className="mb-6 flex items-center justify-between">
              <span className="text-sm font-black uppercase tracking-widest" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-primary)' }}>
                Navigation
              </span>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 hover:bg-white/5 rounded-lg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>

            <nav className="flex flex-1 flex-col gap-0.5">
              {NAV.map(item => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold uppercase tracking-widest transition-colors"
                    style={{
                      color: active ? 'var(--accent-primary)' : 'rgba(255,255,255,0.5)',
                      background: active ? 'rgba(0,212,255,0.07)' : 'transparent',
                      fontFamily: 'var(--font-display)',
                      borderLeft: active ? '2px solid var(--accent-primary)' : '2px solid transparent',
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            <div className="border-t pt-4" style={{ borderColor: 'var(--border)' }}>
              {!user ? (
                <div className="flex flex-col gap-2">
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="rounded-lg border px-4 py-2.5 text-center text-sm font-bold uppercase transition hover:bg-white/5" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                    Sign In
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)} className="rounded-lg px-4 py-2.5 text-center text-sm font-black uppercase hover:opacity-90" style={{ background: 'var(--accent-primary)', color: '#000', fontFamily: 'var(--font-display)' }}>
                    Join the Club
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <div className="mb-3 flex items-center gap-3 rounded-lg px-3 py-2" style={{ background: 'var(--bg-elevated)' }}>
                    <Avatar src={profile?.avatar_url} name={displayName} size="sm" />
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{displayName}</span>
                  </div>
                  <Link href="/profile" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-white/5 transition-colors" style={{ color: 'var(--text-primary)' }}>My Profile</Link>
                  {isAdmin && <Link href="/admin" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-white/5 transition-colors" style={{ color: 'var(--accent-primary)' }}>Admin Panel</Link>}
                  <button
                    onClick={() => { setMobileOpen(false); startTransition(() => logout()) }}
                    disabled={isPending}
                    className="rounded-lg px-3 py-2.5 text-left text-sm font-medium hover:bg-white/5 transition-colors disabled:opacity-50"
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
