import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Avatar } from '@/components/ui/Avatar'
import { Card } from '@/components/ui/Card'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Members' }

type ClubMember = {
  id: string
  panel_role: string | null
  is_founder: boolean
  joined_at: string
  sort_order: number
  profiles: { display_name: string | null; avatar_url: string | null; username: string; bio: string | null }
}

export default async function MembersPage() {
  const supabase = createClient()

  const { data } = await supabase
    .from('club_members')
    .select('id, panel_role, is_founder, joined_at, sort_order, profiles(display_name, avatar_url, username, bio)')
    .order('sort_order')
    .order('joined_at')

  const members = (data ?? []) as unknown as ClubMember[]

  const founders = members.filter(m => m.is_founder)
  const panel = members.filter(m => !m.is_founder && m.panel_role)
  const regular = members.filter(m => !m.is_founder && !m.panel_role)

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-12">
        <h1 className="text-3xl font-black sm:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>
          Members
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          The people behind the club
        </p>
      </div>

      {/* Founders */}
      {founders.length > 0 && (
        <section className="mb-14">
          <SectionHeader title="Founders" count={founders.length} accent />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {founders.map(m => <MemberCard key={m.id} member={m} featured />)}
          </div>
        </section>
      )}

      {/* Panel / Leadership */}
      {panel.length > 0 && (
        <section className="mb-14">
          <SectionHeader title="Leadership" count={panel.length} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {panel.map(m => <MemberCard key={m.id} member={m} />)}
          </div>
        </section>
      )}

      {/* All members */}
      {regular.length > 0 && (
        <section>
          <SectionHeader title="All Members" count={regular.length} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {regular.map(m => <MemberCard key={m.id} member={m} />)}
          </div>
        </section>
      )}

      {members.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-lg font-semibold" style={{ color: 'var(--text-secondary)' }}>No members listed yet</p>
        </div>
      )}
    </div>
  )
}

function SectionHeader({ title, count, accent }: { title: string; count: number; accent?: boolean }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <h2
        className="text-xl font-bold"
        style={{ fontFamily: 'var(--font-display)', color: accent ? 'var(--accent-primary)' : 'var(--text-primary)' }}
      >
        {title}
      </h2>
      <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
        {count}
      </span>
      <div className="flex-1 border-t" style={{ borderColor: 'var(--border)' }} />
    </div>
  )
}

function MemberCard({ member, featured }: { member: ClubMember; featured?: boolean }) {
  return (
    <Link href={`/profile/${member.profiles.username}`} className="group block">
      <Card
        variant="hover"
        className={featured ? 'text-center py-8' : 'flex items-center gap-4'}
        style={featured ? { border: '1px solid var(--accent-primary)', background: 'linear-gradient(135deg, rgba(0,212,255,0.05) 0%, var(--bg-card) 100%)' } : undefined}
      >
        {featured ? (
          <>
            <div className="mb-4 flex justify-center">
              <div className="relative">
                <Avatar src={member.profiles.avatar_url} name={member.profiles.display_name} size="xl" />
                <span
                  className="absolute -right-1 -top-1 rounded-full px-2 py-0.5 text-xs font-bold"
                  style={{ background: 'var(--accent-primary)', color: '#000' }}
                >
                  ★
                </span>
              </div>
            </div>
            <p className="font-bold transition-colors group-hover:text-[var(--accent-primary)]" style={{ color: 'var(--text-primary)' }}>
              {member.profiles.display_name ?? member.profiles.username}
            </p>
            <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--accent-primary)' }}>
              Founder
            </p>
            {member.profiles.bio && (
              <p className="mt-3 line-clamp-2 text-sm" style={{ color: 'var(--text-secondary)' }}>{member.profiles.bio}</p>
            )}
            <p className="mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>Since {formatDate(member.joined_at)}</p>
          </>
        ) : (
          <>
            <Avatar src={member.profiles.avatar_url} name={member.profiles.display_name} size="md" className="flex-shrink-0" />
            <div className="min-w-0">
              <p className="truncate font-semibold text-sm transition-colors group-hover:text-[var(--accent-primary)]" style={{ color: 'var(--text-primary)' }}>
                {member.profiles.display_name ?? member.profiles.username}
              </p>
              {member.panel_role ? (
                <p className="truncate text-xs font-medium" style={{ color: 'var(--accent-secondary)' }}>{member.panel_role}</p>
              ) : (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Member since {formatDate(member.joined_at)}</p>
              )}
            </div>
          </>
        )}
      </Card>
    </Link>
  )
}
