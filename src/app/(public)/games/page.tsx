import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'

export const metadata: Metadata = { title: 'Games' }

type Game = {
  id: string
  name: string
  slug: string
  logo_url: string | null
  cover_url: string | null
  current_patch: string | null
  is_supported: boolean
}

export default async function GamesPage() {
  const supabase = createClient()
  const { data } = await supabase
    .from('games')
    .select('id, name, slug, logo_url, cover_url, current_patch, is_supported')
    .eq('is_supported', true)
    .order('sort_order')

  const games = (data ?? []) as Game[]

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-black sm:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>
          Games
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Titles our club actively competes in
        </p>
      </div>

      {games.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-lg font-semibold" style={{ color: 'var(--text-secondary)' }}>No games listed yet</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <Link key={game.id} href={`/games/${game.slug}`} className="group block">
              <Card variant="hover" className="overflow-hidden p-0">
                {/* Cover */}
                <div className="relative h-40 w-full overflow-hidden bg-[var(--bg-elevated)]">
                  {game.cover_url ? (
                    <Image
                      src={game.cover_url}
                      alt={game.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-5xl opacity-20">🎮</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] to-transparent" />
                </div>

                <div className="flex items-center gap-4 p-5">
                  {/* Logo */}
                  {game.logo_url ? (
                    <Image
                      src={game.logo_url}
                      alt={`${game.name} logo`}
                      width={48}
                      height={48}
                      className="flex-shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-xl"
                      style={{ background: 'var(--bg-elevated)' }}
                    >
                      🎮
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="truncate font-bold transition-colors group-hover:text-[var(--accent-primary)]" style={{ color: 'var(--text-primary)' }}>
                      {game.name}
                    </p>
                    {game.current_patch && (
                      <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                        Patch {game.current_patch}
                      </p>
                    )}
                  </div>

                  <svg
                    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    className="ml-auto flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                    style={{ color: 'var(--accent-primary)' }}
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
