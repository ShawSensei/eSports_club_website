import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import AnnouncementBanner from '@/components/layout/AnnouncementBanner'
import type { SiteSettingsData } from '@/types'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: settings } = await supabase
    .from('site_settings')
    .select('key, value')
    .eq('key', 'announcement_banner')
    .single<{ key: string; value: SiteSettingsData['announcement_banner'] }>()

  const banner = settings?.value
  const showBanner = banner?.enabled === true && !!banner?.text

  return (
    <div className="flex min-h-screen flex-col">
      {showBanner && <AnnouncementBanner text={banner!.text} />}
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
