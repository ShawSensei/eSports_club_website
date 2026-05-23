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

export async function updateSiteSettings(formData: FormData): Promise<ActionResult> {
  const { supabase, user } = await requireAdmin()

  const club_name = formData.get('club_name') as string
  const tagline = formData.get('tagline') as string
  const club_description = formData.get('club_description') as string
  const announcement_enabled = formData.get('announcement_enabled') === 'true'
  const announcement_text = formData.get('announcement_text') as string
  const discord_url = formData.get('discord_url') as string
  const twitter_url = formData.get('twitter_url') as string
  const youtube_url = formData.get('youtube_url') as string

  const now = new Date().toISOString()
  const updates = [
    { key: 'club_name', value: club_name },
    { key: 'tagline', value: tagline },
    { key: 'club_description', value: club_description },
    { key: 'announcement_banner', value: { enabled: announcement_enabled, text: announcement_text } },
    { key: 'social_links', value: { discord: discord_url, twitter: twitter_url, youtube: youtube_url } },
  ]

  log.db('settings', 'upsert site_settings', { keys: updates.map(u => u.key) })
  for (const u of updates) {
    const { error } = await (supabase as any)
      .from('site_settings')
      .upsert({ key: u.key, value: u.value, updated_by: user.id, updated_at: now })

    if (error) {
      log.error('settings', `upsert failed for key "${u.key}"`, { code: error.code, message: error.message })
      return { error: `Failed to update ${u.key}: ${error.message}` }
    }
  }

  log.success('settings', 'site settings updated')
  await logAudit(user.id, 'settings.update', 'site_settings', undefined)
  revalidatePath('/')
  revalidatePath('/admin/settings')
  return { success: true }
}
