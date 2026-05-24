import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { CustomCursor } from '@/components/ui/CustomCursor'
import { Preloader } from '@/components/ui/Preloader'
import { PageTransition } from '@/components/ui/PageTransition'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

// Fail loudly in production if the URL is missing or still set to localhost
if (process.env.NODE_ENV === 'production') {
  if (!process.env.NEXT_PUBLIC_SITE_URL) {
    throw new Error('[Config] NEXT_PUBLIC_SITE_URL is required in production')
  }
  if (process.env.NEXT_PUBLIC_SITE_URL.includes('localhost')) {
    throw new Error('[Config] NEXT_PUBLIC_SITE_URL must not be localhost in production')
  }
}

export const metadata: Metadata = {
  title: {
    default: 'Esports Club',
    template: '%s | Esports Club',
  },
  description: 'Official Esports Club — news, tournaments, roster, and leaderboards.',
  metadataBase: new URL(SITE_URL),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        <Preloader />
        <PageTransition />
        <CustomCursor />
        {children}
      </body>
    </html>
  )
}
