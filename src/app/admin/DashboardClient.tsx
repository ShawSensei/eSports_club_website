'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/Badge'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { staggerContainer, fadeUp } from '@/lib/motion'

type AuditRow = {
  id: string
  action: string
  target_type: string | null
  created_at: string
  actor: { username: string; display_name: string | null } | null
}

interface StatCard {
  label: string
  value: number
  href: string
  accent: string       // CSS color value
  glowColor: string    // rgba for glow
  bg: string           // card background gradient
  icon: string
}

interface DashboardClientProps {
  stats: StatCard[]
  quickActions: { label: string; href: string; icon: string }[]
  auditRows: AuditRow[]
}

export function DashboardClient({ stats, quickActions, auditRows }: DashboardClientProps) {
  return (
    <div className="max-w-5xl space-y-8">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="text-2xl font-black uppercase tracking-wide" style={{ fontFamily: 'var(--font-display)', color: '#fff' }}>
          Dashboard
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          Welcome back — here&apos;s what needs your attention.
        </p>
      </motion.div>

      {/* Stat cards */}
      <motion.div
        className="grid gap-4 sm:grid-cols-3"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {stats.map(s => (
          <motion.div key={s.label} variants={fadeUp}>
            <Link href={s.href} className="group block">
              <div
                className="relative overflow-hidden rounded-2xl p-6 text-center transition-all duration-300 group-hover:-translate-y-0.5"
                style={{
                  background: s.bg,
                  border: `1px solid ${s.accent}33`,
                  boxShadow: `0 0 0 ${s.glowColor}`,
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = `0 0 24px ${s.glowColor}`}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 ${s.glowColor}`}
              >
                {/* Top glow strip */}
                <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${s.accent}, transparent)` }} />

                {/* Background icon watermark */}
                <div className="absolute right-3 top-3 text-4xl opacity-10 select-none">{s.icon}</div>

                <div className="mb-1 text-3xl">{s.icon}</div>
                <div className="mb-1 text-4xl font-black tabular-nums" style={{ fontFamily: 'var(--font-display)', color: s.accent, letterSpacing: '-0.02em' }}>
                  <AnimatedCounter value={s.value} />
                </div>
                <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.12em' }}>
                  {s.label}
                </div>

                {/* Bottom glow strip */}
                <div className="absolute inset-x-0 bottom-0 h-px opacity-40" style={{ background: `linear-gradient(90deg, transparent, ${s.accent}, transparent)` }} />
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05, delayChildren: 0.25 } } }}
      >
        <motion.p variants={fadeUp} className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.15em' }}>
          Quick Actions
        </motion.p>
        <div className="flex flex-wrap gap-3">
          {quickActions.map(a => (
            <motion.div key={a.label} variants={fadeUp}>
              <Link
                href={a.href}
                className="group inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-200"
                style={{
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.03)',
                  color: 'rgba(255,255,255,0.5)',
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '0.1em',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.borderColor = 'rgba(0,212,255,0.4)'
                  el.style.background  = 'rgba(0,212,255,0.06)'
                  el.style.color       = '#fff'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.borderColor = 'rgba(255,255,255,0.08)'
                  el.style.background  = 'rgba(255,255,255,0.03)'
                  el.style.color       = 'rgba(255,255,255,0.5)'
                }}
              >
                <span className="text-base">{a.icon}</span>
                {a.label}
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.15em' }}>
            Recent Activity
          </p>
          <Link href="/admin/audit" className="text-xs font-semibold transition-colors hover:text-white" style={{ color: 'var(--accent-primary)', fontFamily: 'var(--font-display)' }}>
            View all →
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl" style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(10,10,10,0.8)' }}>
          {auditRows.length === 0 ? (
            <p className="p-5 text-sm" style={{ color: 'var(--text-muted)' }}>No activity yet.</p>
          ) : (
            <motion.div
              className="divide-y"
              style={{ borderColor: 'rgba(255,255,255,0.05)' }}
              initial="hidden"
              animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04, delayChildren: 0.4 } } }}
            >
              {auditRows.map(row => (
                <motion.div
                  key={row.id}
                  variants={fadeUp}
                  className="flex items-center gap-3 px-5 py-3.5 text-sm transition-colors hover:bg-white/[0.02]"
                  style={{ borderColor: 'rgba(255,255,255,0.05)' }}
                >
                  <Badge variant="default" className="shrink-0 font-mono text-[10px]">{row.action}</Badge>
                  <span style={{ color: 'var(--text-muted)' }}>
                    by <span style={{ color: 'rgba(255,255,255,0.6)' }}>{row.actor?.display_name ?? row.actor?.username ?? '—'}</span>
                  </span>
                  <span className="ml-auto shrink-0 text-xs" style={{ color: 'var(--text-muted)' }}>
                    {new Date(row.created_at).toLocaleString()}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
