'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import log from '@/lib/logger'

const isDev = process.env.NODE_ENV === 'development'

// Mask email for logs — show domain only in production
const maskEmail = (email: string) =>
  isDev ? email : `***@${email.split('@')[1] ?? '***'}`

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(2).max(32),
})

export type AuthActionResult = { error: string } | { success: true }

export async function login(formData: FormData): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    log.warn('auth', 'login validation failed')
    return { error: 'Invalid email or password format.' }
  }

  log.info('auth', 'login attempt', { email: maskEmail(parsed.data.email) })
  const supabase = createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    // Don't expose internal Supabase error messages — they can contain email
    log.error('auth', 'login failed', { status: error.status })
    return { error: 'Invalid email or password.' }
  }

  log.success('auth', 'login ok', { email: maskEmail(parsed.data.email) })
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function register(formData: FormData): Promise<AuthActionResult> {
  const parsed = registerSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    displayName: formData.get('displayName'),
  })

  if (!parsed.success) {
    log.warn('auth', 'register validation failed')
    const first = parsed.error.errors[0]
    return { error: first.message }
  }

  log.info('auth', 'register attempt', { email: maskEmail(parsed.data.email) })
  const supabase = createClient()

  const { error, data } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { display_name: parsed.data.displayName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    log.error('auth', 'register failed', { status: error.status, code: (error as any).code })
    // Return a generic message — Supabase error.message can leak user existence
    return { error: 'Registration failed. Please try again or use a different email.' }
  }

  log.success('auth', 'register ok', { userId: data.user?.id })
  return { success: true }
}

export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function signInWithOAuth(provider: 'google' | 'discord') {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error || !data.url) {
    log.error('auth', 'OAuth initiation failed', { provider, status: error?.status })
    redirect('/login?error=oauth_failed')
  }

  redirect(data.url)
}
