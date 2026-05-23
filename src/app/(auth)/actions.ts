'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import log from '@/lib/logger'

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
    log.warn('auth', 'login validation failed', parsed.error.errors)
    return { error: 'Invalid email or password format.' }
  }

  log.info('auth', 'login attempt', { email: parsed.data.email })
  const supabase = createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    log.error('auth', 'login failed', { message: error.message, status: error.status })
    return { error: error.message }
  }

  log.success('auth', 'login ok', { email: parsed.data.email })
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
    log.warn('auth', 'register validation failed', parsed.error.errors)
    const first = parsed.error.errors[0]
    return { error: first.message }
  }

  log.info('auth', 'register attempt', { email: parsed.data.email, displayName: parsed.data.displayName })
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
    log.error('auth', 'register failed — supabase.auth.signUp error', {
      message: error.message,
      status: error.status,
      code: (error as any).code,
    })
    return { error: error.message }
  }

  log.success('auth', 'register ok', { userId: data.user?.id, email: parsed.data.email })
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
    redirect('/login?error=oauth_failed')
  }

  redirect(data.url)
}
