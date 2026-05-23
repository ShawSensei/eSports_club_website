import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { CustomCursor } from '@/components/ui/CustomCursor'
import { Preloader } from '@/components/ui/Preloader'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Esports Club',
    template: '%s | Esports Club',
  },
  description: 'Official Esports Club — news, tournaments, roster, and leaderboards.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        <Preloader />
        <CustomCursor />
        {children}
      </body>
    </html>
  )
}
