import type { Metadata } from 'next'
import Link from 'next/link'
import LoginForm from './LoginForm'

export const metadata: Metadata = { title: 'Login' }

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; next?: string }
}) {
  return (
    <div className="w-full max-w-md px-4">
      <div className="rounded-2xl border p-8" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-primary)' }}>
            Welcome Back
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Sign in to your account
          </p>
        </div>

        {searchParams.error && (
          <div className="mb-4 rounded-lg px-4 py-3 text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--accent-danger)', border: '1px solid rgba(239,68,68,0.3)' }}>
            {searchParams.error === 'auth_callback_failed'
              ? 'Authentication failed. Please try again.'
              : searchParams.error === 'oauth_failed'
              ? 'OAuth sign-in failed. Please try again.'
              : searchParams.error}
          </div>
        )}

        <LoginForm next={searchParams.next} />

        <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          Don&apos;t have an account?{' '}
          <Link href="/register" style={{ color: 'var(--accent-primary)' }} className="hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}
