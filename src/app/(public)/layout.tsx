import { createClient } from '@/lib/supabase/server'
import { PublicNav } from '@/components/layout/PublicNav'
import { SmoothScroll } from '@/components/layout/SmoothScroll'
import AnnouncementBanner from '@/components/layout/AnnouncementBanner'
import type { SiteSettingsData } from '@/types'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()

  const [
    { data: { user } },
    { data: settings },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('site_settings').select('key, value').eq('key', 'announcement_banner').single<{ key: string; value: SiteSettingsData['announcement_banner'] }>(),
  ])

  let profile: { display_name: string | null; avatar_url: string | null; role: string } | null = null
  if (user) {
    const { data } = await supabase.from('profiles').select('display_name, avatar_url, role').eq('id', user.id).single()
    profile = data
  }

  const banner = settings?.value
  const showBanner = banner?.enabled === true && !!banner?.text

  return (
    <SmoothScroll>
      {/* Announcement banner — positioned above everything */}
      {showBanner && (
        <div className="fixed inset-x-0 top-0 z-[60]">
          <AnnouncementBanner text={banner!.text} />
        </div>
      )}

      {/* Left sidebar */}
      <PublicNav user={user} profile={profile} />

      {/* Main content — offset by sidebar width on desktop */}
      <main
        className="min-h-screen"
        style={{
          paddingLeft: 'var(--sidebar-w)',
          paddingTop: showBanner ? '36px' : '0',
        }}
      >
        {/* Mobile top bar offset */}
        <div className="h-14 md:hidden" />
        {children}
      </main>
    </SmoothScroll>
  )
}
