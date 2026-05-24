import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import log from '@/lib/logger'

export async function GET(request: NextRequest) {
  const { origin } = new URL(request.url)

  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const rawNext = searchParams.get('next') ?? '/'

    // Open-redirect guard: only allow same-origin relative paths
    const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/'

    if (code) {
      const supabase = createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error) {
        return NextResponse.redirect(`${origin}${next}`)
      }

      log.error('auth', 'exchangeCodeForSession failed', { status: error.status })
    }

    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
  } catch (err) {
    log.error('auth', 'callback handler threw', err instanceof Error ? err.message : 'unknown')
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
  }
}
