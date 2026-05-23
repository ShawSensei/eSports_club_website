import type { Metadata } from 'next'
import Link from 'next/link'
import RegisterForm from './RegisterForm'

export const metadata: Metadata = { title: 'Register' }

export default function RegisterPage() {
  return (
    <div className="w-full max-w-md px-4">
      <div className="rounded-2xl border p-8" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-primary)' }}>
            Join the Club
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Create your account to get started
          </p>
        </div>

        <RegisterForm />

        <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--accent-primary)' }} className="hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
