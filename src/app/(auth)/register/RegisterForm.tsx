'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { register as registerAction } from '../actions'

const schema = z.object({
  displayName: z.string().min(2, 'At least 2 characters').max(32, 'Max 32 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'At least 8 characters'),
})

type FormValues = z.infer<typeof schema>

export default function RegisterForm() {
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const fd = new FormData()
      fd.append('email', values.email)
      fd.append('password', values.password)
      fd.append('displayName', values.displayName)

      const result = await registerAction(fd)
      if ('error' in result) {
        setError('root', { message: result.error })
      } else {
        setSuccess(true)
      }
    })
  }

  if (success) {
    return (
      <div className="rounded-lg px-4 py-6 text-center" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
        <p className="font-semibold" style={{ color: 'var(--accent-success)' }}>Check your email!</p>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          We sent a confirmation link to your address. Click it to activate your account.
        </p>
        <Link href="/login" className="mt-4 inline-block text-sm hover:underline" style={{ color: 'var(--accent-primary)' }}>
          Back to login
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {errors.root && (
        <p className="rounded-lg px-4 py-2 text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--accent-danger)', border: '1px solid rgba(239,68,68,0.3)' }}>
          {errors.root.message}
        </p>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          Display Name
        </label>
        <input
          {...register('displayName')}
          type="text"
          autoComplete="nickname"
          placeholder="YourGamerTag"
          className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          disabled={isPending}
        />
        {errors.displayName && <p className="mt-1 text-xs" style={{ color: 'var(--accent-danger)' }}>{errors.displayName.message}</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          Email
        </label>
        <input
          {...register('email')}
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          disabled={isPending}
        />
        {errors.email && <p className="mt-1 text-xs" style={{ color: 'var(--accent-danger)' }}>{errors.email.message}</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          Password
        </label>
        <input
          {...register('password')}
          type="password"
          autoComplete="new-password"
          placeholder="Min. 8 characters"
          className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          disabled={isPending}
        />
        {errors.password && <p className="mt-1 text-xs" style={{ color: 'var(--accent-danger)' }}>{errors.password.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg py-2.5 text-sm font-semibold transition-opacity disabled:opacity-60"
        style={{ background: 'var(--accent-primary)', color: '#000' }}
      >
        {isPending ? 'Creating account…' : 'Create Account'}
      </button>
    </form>
  )
}
