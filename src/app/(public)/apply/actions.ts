'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import log from '@/lib/logger'

const applySchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  discord_tag: z.string().max(64).nullable(),
  motivation: z.string().min(20, 'Please write at least 20 characters').max(2000),
  preferred_games: z.array(z.string()).min(1, 'Please select at least one game'),
  experience: z.string().max(2000).nullable(),
  availability: z.string().max(200).nullable(),
})

export type ApplyActionResult = { error: string; field?: string } | { success: true }

export async function submitApplication(formData: FormData): Promise<ApplyActionResult> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    log.warn('apply', 'logged-in user attempted to submit application', { userId: user.id })
    return { error: 'You already have an account. Membership applications are for new members only.' }
  }

  const parsed = applySchema.safeParse({
    full_name: formData.get('full_name'),
    email: formData.get('email'),
    discord_tag: formData.get('discord_tag') || null,
    motivation: formData.get('motivation'),
    preferred_games: formData.getAll('preferred_games'),
    experience: formData.get('experience') || null,
    availability: formData.get('availability') || null,
  })

  if (!parsed.success) {
    log.warn('apply', 'submitApplication validation failed', parsed.error.errors)
    return { error: parsed.error.errors[0].message }
  }

  log.db('apply', 'insert membership_application', { email: parsed.data.email })
  const { error } = await (supabase as any)
    .from('membership_applications')
    .insert({ ...parsed.data, user_id: null })

  if (error) {
    log.error('apply', 'submitApplication db error', { code: error.code, message: error.message })
    if (error.code === '23505') {
      return { error: 'An application with this email has already been submitted.' }
    }
    return { error: error.message }
  }

  log.success('apply', 'application submitted', { email: parsed.data.email })
  redirect('/apply/success')
}
