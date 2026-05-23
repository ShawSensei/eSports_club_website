import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Application Submitted',
}

export default function ApplySuccessPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
      <div className="mb-6 flex justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--accent-primary)]/15 ring-1 ring-[var(--accent-primary)]/30">
          <svg
            className="h-10 w-10 text-[var(--accent-primary)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      <h1 className="mb-3 text-3xl font-bold text-[var(--text-primary)]">
        Application Submitted!
      </h1>
      <p className="mb-2 text-[var(--text-secondary)]">
        Thanks for applying to join the club. We&apos;ve received your application and our team will
        review it within <strong className="text-[var(--text-primary)]">3–5 business days</strong>.
      </p>
      <p className="mb-10 text-sm text-[var(--text-muted)]">
        Keep an eye on your email and Discord for updates from us.
      </p>

      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link href="/">
          <Button variant="primary" size="md">Back to Home</Button>
        </Link>
        <Link href="/tournaments">
          <Button variant="outline" size="md">Browse Tournaments</Button>
        </Link>
      </div>
    </div>
  )
}
