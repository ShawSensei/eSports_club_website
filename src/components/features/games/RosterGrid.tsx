import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'

type RosterMember = {
  id: string
  in_game_name: string
  role: string | null
  is_captain: boolean
  joined_at: string
  profiles: { display_name: string | null; avatar_url: string | null; username: string }
}

export function RosterGrid({ members }: { members: RosterMember[] }) {
  if (members.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No roster members listed for this game.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {members.map((member) => (
        <Card key={member.id} variant="hover" className="flex items-center gap-4">
          <Avatar
            src={member.profiles.avatar_url}
            name={member.profiles.display_name ?? member.in_game_name}
            size="lg"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                {member.in_game_name}
              </p>
              {member.is_captain && (
                <span className="flex-shrink-0 text-xs" title="Captain" style={{ color: 'var(--accent-warning)' }}>©</span>
              )}
            </div>
            {member.profiles.display_name && (
              <p className="truncate text-xs" style={{ color: 'var(--text-muted)' }}>
                {member.profiles.display_name}
              </p>
            )}
            {member.role && (
              <div className="mt-1.5">
                <span
                  className="inline-block rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wide"
                  style={{ background: 'var(--bg-elevated)', color: 'var(--accent-primary)' }}
                >
                  {member.role}
                </span>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}
