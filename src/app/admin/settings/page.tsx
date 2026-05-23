import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { SettingsForm } from './SettingsForm'

type SettingsRow = { key: string; value: unknown }

export default async function AdminSettingsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single<{ role: string }>()
  if (profile?.role !== 'admin') redirect('/admin')

  const { data } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', ['club_name', 'tagline', 'club_description', 'announcement_banner', 'social_links'])

  const rows = (data ?? []) as SettingsRow[]
  const settings = Object.fromEntries(rows.map(r => [r.key, r.value])) as Record<string, unknown>

  const announcement = settings.announcement_banner as { enabled?: boolean; text?: string } | undefined
  const social = settings.social_links as { discord?: string; twitter?: string; youtube?: string } | undefined

  const defaults = {
    club_name: (settings.club_name as string) ?? '',
    tagline: (settings.tagline as string) ?? '',
    club_description: (settings.club_description as string) ?? '',
    announcement_enabled: announcement?.enabled ?? false,
    announcement_text: announcement?.text ?? '',
    discord_url: social?.discord ?? '',
    twitter_url: social?.twitter ?? '',
    youtube_url: social?.youtube ?? '',
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-[var(--text-primary)]">Site Settings</h1>
      <Card>
        <SettingsForm defaults={defaults} />
      </Card>
    </div>
  )
}
