import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'

type Member = {
  user_id: string
  profiles: { display_name: string | null; avatar_url: string | null; username: string }
}

type TournamentTeam = {
  id: string
  team_name: string
  status: string
  registered_at: string
  captain: { display_name: string | null; username: string } | null
  members: Member[]
}

export function TournamentTeamsList({ teams }: { teams: TournamentTeam[] }) {
  const approved = teams.filter(t => t.status === 'approved')
  const pending = teams.filter(t => t.status === 'pending')

  if (teams.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No teams registered yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {approved.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            Confirmed Teams <span className="text-sm font-normal" style={{ color: 'var(--text-muted)' }}>({approved.length})</span>
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {approved.map(team => <TeamCard key={team.id} team={team} />)}
          </div>
        </section>
      )}

      {pending.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            Pending Approval <span className="text-sm font-normal" style={{ color: 'var(--text-muted)' }}>({pending.length})</span>
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pending.map(team => <TeamCard key={team.id} team={team} />)}
          </div>
        </section>
      )}
    </div>
  )
}

function TeamCard({ team }: { team: TournamentTeam }) {
  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{team.team_name}</p>
        <Badge variant={team.status === 'approved' ? 'registration' : team.status === 'pending' ? 'upcoming' : 'cancelled'}>
          {team.status}
        </Badge>
      </div>
      {team.captain && (
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Captain: <span style={{ color: 'var(--text-secondary)' }}>{team.captain.display_name ?? team.captain.username}</span>
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {team.members.map(m => (
          <div key={m.user_id} title={m.profiles.display_name ?? m.profiles.username}>
            <Avatar src={m.profiles.avatar_url} name={m.profiles.display_name} size="sm" />
          </div>
        ))}
      </div>
    </Card>
  )
}
