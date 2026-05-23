'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import log from '@/lib/logger'

const profileSchema = z.object({
  display_name: z.string().min(2).max(32).nullable(),
  bio: z.string().max(500).nullable(),
  discord_tag: z.string().max(64).nullable(),
})

export type ActionResult = { error: string } | { success: true }

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const parsed = profileSchema.safeParse({
    display_name: formData.get('display_name') || null,
    bio: formData.get('bio') || null,
    discord_tag: formData.get('discord_tag') || null,
  })
  if (!parsed.success) {
    log.warn('profile', 'updateProfile validation failed', parsed.error.errors)
    return { error: parsed.error.errors[0].message }
  }

  log.db('profile', 'update profile', { userId: user.id })
  const { error } = await (supabase as any)
    .from('profiles')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) {
    log.error('profile', 'updateProfile db error', { code: error.code, message: error.message })
    return { error: error.message }
  }
  log.success('profile', 'profile updated', { userId: user.id })

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single<{ username: string }>()

  revalidatePath(`/profile/${profile?.username}`)
  revalidatePath('/profile')
  return { success: true }
}

export async function uploadAvatar(formData: FormData): Promise<ActionResult & { url?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const file = formData.get('avatar') as File | null
  if (!file || file.size === 0) return { error: 'No file selected.' }
  if (file.size > 2 * 1024 * 1024) return { error: 'File must be under 2MB.' }
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    return { error: 'Only JPEG, PNG, and WebP images are allowed.' }
  }

  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${user.id}/avatar.${ext}`
  const bytes = await file.arrayBuffer()

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, bytes, { contentType: file.type, upsert: true })

  if (uploadError) return { error: uploadError.message }

  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)

  const { error: updateError } = await (supabase as any)
    .from('profiles')
    .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (updateError) return { error: updateError.message }

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single<{ username: string }>()

  revalidatePath(`/profile/${profile?.username}`)
  revalidatePath('/profile')
  return { success: true, url: publicUrl }
}

const gameAccountSchema = z.object({
  game_id: z.string().uuid(),
  in_game_name: z.string().min(1).max(64).nullable(),
  current_rank: z.string().max(64).nullable(),
  peak_rank: z.string().max(64).nullable(),
})

export async function upsertGameAccount(formData: FormData): Promise<ActionResult> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const parsed = gameAccountSchema.safeParse({
    game_id: formData.get('game_id'),
    in_game_name: formData.get('in_game_name') || null,
    current_rank: formData.get('current_rank') || null,
    peak_rank: formData.get('peak_rank') || null,
  })
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  const supabaseAny = supabase as any
  const { error } = await supabaseAny
    .from('user_games')
    .upsert({ user_id: user.id, ...parsed.data }, { onConflict: 'user_id,game_id' })

  if (error) return { error: error.message }

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single<{ username: string }>()

  revalidatePath(`/profile/${profile?.username}`)
  return { success: true }
}

export async function removeGameAccount(gameId: string): Promise<ActionResult> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const { error } = await supabase
    .from('user_games')
    .delete()
    .eq('user_id', user.id)
    .eq('game_id', gameId)

  if (error) return { error: error.message }

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single<{ username: string }>()

  revalidatePath(`/profile/${profile?.username}`)
  return { success: true }
}
