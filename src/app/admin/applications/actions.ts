'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/audit'
import log from '@/lib/logger'

export type ActionResult = { error: string } | { success: true }

async function requireMod() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single<{ role: string }>()
  if (!profile || !['admin', 'moderator'].includes(profile.role)) redirect('/403')
  return { supabase, user }
}

export async function reviewApplication(
  id: string,
  status: 'approved' | 'rejected',
  notes?: string
): Promise<ActionResult> {
  const { supabase, user } = await requireMod()

  log.db('applications', `review → ${status}`, { id })
  const { error } = await (supabase as any)
    .from('membership_applications')
    .update({
      status,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      notes: notes ?? null,
    })
    .eq('id', id)

  if (error) {
    log.error('applications', 'reviewApplication db error', { code: error.code, message: error.message })
    return { error: error.message }
  }

  log.success('applications', `application ${status}`, { id })
  const action = status === 'approved' ? 'application.approve' : 'application.reject'
  await logAudit(user.id, action, 'membership_application', id, notes ? { notes } : undefined)
  revalidatePath('/admin/applications')
  revalidatePath(`/admin/applications/${id}`)
  return { success: true }
}
