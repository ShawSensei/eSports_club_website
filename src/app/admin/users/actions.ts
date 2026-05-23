'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/audit'
import log from '@/lib/logger'

export type ActionResult = { error: string } | { success: true }

async function requireAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single<{ role: string }>()
  if (profile?.role !== 'admin') redirect('/admin')
  return { supabase, user }
}

export async function changeRole(
  targetUserId: string,
  role: 'member' | 'moderator' | 'admin'
): Promise<ActionResult> {
  const { supabase, user } = await requireAdmin()

  if (targetUserId === user.id) return { error: 'You cannot change your own role.' }

  log.db('users', 'changeRole', { targetUserId, role })
  const { error } = await (supabase as any)
    .from('profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', targetUserId)

  if (error) {
    log.error('users', 'changeRole db error', { code: error.code, message: error.message })
    return { error: error.message }
  }

  log.success('users', 'role changed', { targetUserId, role })
  await logAudit(user.id, 'user.role_change', 'profile', targetUserId, { role })
  revalidatePath('/admin/users')
  return { success: true }
}

export async function toggleUserActive(targetUserId: string, current: boolean): Promise<ActionResult> {
  const { supabase, user } = await requireAdmin()

  if (targetUserId === user.id) return { error: 'You cannot deactivate your own account.' }

  const next = !current
  log.db('users', 'toggleActive', { targetUserId, is_active: next })
  const { error } = await (supabase as any)
    .from('profiles')
    .update({ is_active: next, updated_at: new Date().toISOString() })
    .eq('id', targetUserId)

  if (error) {
    log.error('users', 'toggleActive db error', { code: error.code, message: error.message })
    return { error: error.message }
  }

  log.success('users', `user ${next ? 'activated' : 'deactivated'}`, { targetUserId })
  await logAudit(user.id, 'user.deactivate', 'profile', targetUserId, { is_active: next })
  revalidatePath('/admin/users')
  return { success: true }
}
