'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/audit'
import log from '@/lib/logger'
import { z } from 'zod'

export type ActionResult = { error: string } | { success: true }

async function requireMod() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single<{ role: string }>()
  if (!profile || !['admin', 'moderator'].includes(profile.role)) redirect('/403')
  return { supabase, user }
}

const tournamentSchema = z.object({
  game_id: z.string().uuid(),
  name: z.string().min(3).max(200),
  description: z.string().max(2000).nullable(),
  format: z.enum(['single_elimination', 'double_elimination', 'round_robin', 'swiss']),
  max_teams: z.coerce.number().int().min(2).max(256).nullable(),
  prize_pool: z.string().max(100).nullable(),
  rules_url: z.string().url().nullable(),
  stream_url: z.string().url().nullable(),
  start_date: z.string().nullable(),
  end_date: z.string().nullable(),
  cover_url: z.string().url().nullable(),
})

export async function createTournament(formData: FormData): Promise<ActionResult> {
  const { supabase, user } = await requireMod()

  const parsed = tournamentSchema.safeParse({
    game_id: formData.get('game_id'),
    name: formData.get('name'),
    description: formData.get('description') || null,
    format: formData.get('format'),
    max_teams: formData.get('max_teams') || null,
    prize_pool: formData.get('prize_pool') || null,
    rules_url: formData.get('rules_url') || null,
    stream_url: formData.get('stream_url') || null,
    start_date: formData.get('start_date') || null,
    end_date: formData.get('end_date') || null,
    cover_url: (formData.get('cover_url') as string) || null,
  })
  if (!parsed.success) {
    log.warn('tournaments', 'createTournament validation failed', parsed.error.errors)
    return { error: parsed.error.errors[0].message }
  }

  log.db('tournaments', 'insert tournament', { name: parsed.data.name, format: parsed.data.format })
  const { data, error } = await (supabase as any)
    .from('tournaments')
    .insert({ ...parsed.data, created_by: user.id, status: 'upcoming', registration_open: false })
    .select('id')
    .single()

  if (error) {
    log.error('tournaments', 'createTournament db error', { code: error.code, message: error.message })
    return { error: error.message }
  }

  log.success('tournaments', 'tournament created', { id: data.id, name: parsed.data.name })
  await logAudit(user.id, 'tournament.create', 'tournament', data.id)
  revalidatePath('/admin/tournaments')
  revalidatePath('/tournaments')
  redirect(`/admin/tournaments/${data.id}`)
}

export async function updateTournament(id: string, formData: FormData): Promise<ActionResult> {
  const { supabase, user } = await requireMod()

  const parsed = tournamentSchema.safeParse({
    game_id: formData.get('game_id'),
    name: formData.get('name'),
    description: formData.get('description') || null,
    format: formData.get('format'),
    max_teams: formData.get('max_teams') || null,
    prize_pool: formData.get('prize_pool') || null,
    rules_url: formData.get('rules_url') || null,
    stream_url: formData.get('stream_url') || null,
    start_date: formData.get('start_date') || null,
    end_date: formData.get('end_date') || null,
    cover_url: (formData.get('cover_url') as string) || null,
  })
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  const { error } = await (supabase as any)
    .from('tournaments')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }

  await logAudit(user.id, 'tournament.update', 'tournament', id)
  revalidatePath('/admin/tournaments')
  revalidatePath(`/tournaments/${id}`)
  revalidatePath('/tournaments')
  return { success: true }
}

export async function updateTournamentStatus(
  id: string,
  status: 'upcoming' | 'registration' | 'ongoing' | 'completed' | 'cancelled'
): Promise<ActionResult> {
  const { supabase, user } = await requireMod()

  const { error } = await (supabase as any)
    .from('tournaments')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }

  await logAudit(user.id, 'tournament.status_change', 'tournament', id, { status })
  revalidatePath('/admin/tournaments')
  revalidatePath(`/tournaments/${id}`)
  revalidatePath('/tournaments')
  return { success: true }
}

export async function toggleRegistration(id: string, open: boolean): Promise<ActionResult> {
  const { supabase, user } = await requireMod()

  const { error } = await (supabase as any)
    .from('tournaments')
    .update({ registration_open: !open, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }

  await logAudit(user.id, 'tournament.registration_toggle', 'tournament', id)
  revalidatePath(`/admin/tournaments/${id}`)
  revalidatePath(`/tournaments/${id}`)
  return { success: true }
}

export async function reviewTeam(
  teamId: string,
  tournamentId: string,
  status: 'approved' | 'rejected'
): Promise<ActionResult> {
  const { supabase, user } = await requireMod()

  const { error } = await (supabase as any)
    .from('tournament_teams')
    .update({ status })
    .eq('id', teamId)

  if (error) return { error: error.message }

  await logAudit(user.id, `tournament.team_${status}`, 'tournament_team', teamId)
  revalidatePath(`/admin/tournaments/${tournamentId}`)
  revalidatePath(`/tournaments/${tournamentId}`)
  return { success: true }
}

export async function updateMatchScore(matchId: string, tournamentId: string, formData: FormData): Promise<ActionResult> {
  const { supabase, user } = await requireMod()

  const team1Score = Number(formData.get('team1_score'))
  const team2Score = Number(formData.get('team2_score'))
  const winnerId = (formData.get('winner_id') as string) || null

  const { error } = await (supabase as any)
    .from('matches')
    .update({
      team1_score: team1Score,
      team2_score: team2Score,
      winner_id: winnerId,
      status: 'completed',
      played_at: new Date().toISOString(),
    })
    .eq('id', matchId)

  if (error) return { error: error.message }

  await logAudit(user.id, 'tournament.scores_update', 'match', matchId)
  revalidatePath(`/admin/tournaments/${tournamentId}`)
  revalidatePath(`/tournaments/${tournamentId}`)
  return { success: true }
}
