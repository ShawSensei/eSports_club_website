'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import log from '@/lib/logger'

const registerSchema = z.object({
  tournamentId: z.string().uuid(),
  teamName: z.string().min(2, 'Team name must be at least 2 characters').max(50, 'Max 50 characters'),
  memberUsernames: z.array(z.string()).min(1, 'Add at least one team member'),
})

export type RegisterResult = { error: string } | { success: true; teamId: string }

export async function registerTeam(formData: FormData): Promise<RegisterResult> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'You must be signed in to register.' }

  const parsed = registerSchema.safeParse({
    tournamentId: formData.get('tournamentId'),
    teamName: formData.get('teamName'),
    memberUsernames: formData.getAll('memberUsernames'),
  })

  if (!parsed.success) {
    log.warn('tournaments', 'registerTeam validation failed', parsed.error.errors)
    return { error: parsed.error.errors[0].message }
  }

  log.info('tournaments', 'registerTeam attempt', { tournamentId: parsed.data.tournamentId, teamName: parsed.data.teamName })

  const { tournamentId, teamName, memberUsernames } = parsed.data

  // Verify tournament is open for registration
  const { data: tournament } = await supabase
    .from('tournaments')
    .select('registration_open, status')
    .eq('id', tournamentId)
    .single<{ registration_open: boolean; status: string }>()

  if (!tournament?.registration_open) {
    return { error: 'Registration is not open for this tournament.' }
  }

  // Check captain hasn't already registered
  const { data: existing } = await supabase
    .from('tournament_teams')
    .select('id')
    .eq('tournament_id', tournamentId)
    .eq('captain_id', user.id)
    .maybeSingle()

  if (existing) return { error: 'You have already registered a team for this tournament.' }

  // Resolve member usernames → profile ids
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username')
    .in('username', memberUsernames)

  if (!profiles || profiles.length !== memberUsernames.length) {
    return { error: 'One or more usernames could not be found.' }
  }

  // Create team — cast needed due to hand-written types
  const supabaseAny = supabase as any
  const { data: team, error: teamError } = await supabaseAny
    .from('tournament_teams')
    .insert({ tournament_id: tournamentId, team_name: teamName, captain_id: user.id })
    .select('id')
    .single()

  if (teamError || !team) {
    log.error('tournaments', 'registerTeam — team insert failed', { code: teamError?.code, message: teamError?.message })
    if (teamError?.code === '23505') return { error: 'A team with that name already exists in this tournament.' }
    return { error: 'Failed to create team. Please try again.' }
  }
  log.db('tournaments', 'team created', { teamId: team.id })

  // Add captain + members
  const memberRows = [
    { team_id: team.id, user_id: user.id },
    ...profiles
      .filter((p: any) => p.id !== user.id)
      .map((p: any) => ({ team_id: team.id, user_id: p.id })),
  ]

  const { error: membersError } = await supabaseAny
    .from('tournament_team_members')
    .insert(memberRows)

  if (membersError) {
    log.error('tournaments', 'registerTeam — members insert failed, rolling back', { code: membersError.code, message: membersError.message })
    await supabase.from('tournament_teams').delete().eq('id', team.id)
    return { error: 'Failed to add team members. Please try again.' }
  }

  log.success('tournaments', 'team registered', { teamId: team.id, members: memberRows.length })
  revalidatePath(`/tournaments/${tournamentId}`)
  return { success: true, teamId: team.id }
}
