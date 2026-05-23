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

const addSchema = z.object({
  user_id: z.string().uuid(),
  game_id: z.string().uuid(),
  in_game_role: z.string().max(64).nullable(),
  jersey_number: z.coerce.number().int().min(1).max(999).nullable(),
  is_captain: z.boolean(),
})

export async function addRosterMember(formData: FormData): Promise<ActionResult> {
  const { supabase, user } = await requireMod()

  const parsed = addSchema.safeParse({
    user_id: formData.get('user_id'),
    game_id: formData.get('game_id'),
    in_game_role: formData.get('in_game_role') || null,
    jersey_number: formData.get('jersey_number') || null,
    is_captain: formData.get('is_captain') === 'true',
  })
  if (!parsed.success) {
    log.warn('roster', 'addRosterMember validation failed', parsed.error.errors)
    return { error: parsed.error.errors[0].message }
  }

  log.db('roster', 'insert member', { user_id: parsed.data.user_id, game_id: parsed.data.game_id })
  const { error } = await (supabase as any)
    .from('team_roster')
    .insert({ ...parsed.data, is_active: true })

  if (error) {
    log.error('roster', 'addRosterMember db error', { code: error.code, message: error.message })
    if (error.code === '23505') return { error: 'This player is already on the roster for this game.' }
    return { error: error.message }
  }

  log.success('roster', 'member added', { user_id: parsed.data.user_id })
  await logAudit(user.id, 'roster.add', 'team_roster', parsed.data.user_id)
  revalidatePath('/admin/roster')
  revalidatePath('/roster')
  return { success: true }
}

export async function removeRosterMember(id: string): Promise<ActionResult> {
  const { supabase, user } = await requireMod()

  const { error } = await supabase.from('team_roster').delete().eq('id', id)
  if (error) return { error: error.message }

  await logAudit(user.id, 'roster.remove', 'team_roster', id)
  revalidatePath('/admin/roster')
  revalidatePath('/roster')
  return { success: true }
}

export async function updateRosterMember(id: string, formData: FormData): Promise<ActionResult> {
  const { supabase, user } = await requireMod()

  const { error } = await (supabase as any)
    .from('team_roster')
    .update({
      in_game_role: (formData.get('in_game_role') as string) || null,
      jersey_number: formData.get('jersey_number') ? Number(formData.get('jersey_number')) : null,
      is_captain: formData.get('is_captain') === 'true',
      is_active: formData.get('is_active') === 'true',
    })
    .eq('id', id)

  if (error) return { error: error.message }

  await logAudit(user.id, 'roster.update', 'team_roster', id)
  revalidatePath('/admin/roster')
  revalidatePath('/roster')
  return { success: true }
}
