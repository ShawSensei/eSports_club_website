'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/audit'
import log from '@/lib/logger'
import { z } from 'zod'

export type ActionResult = { error: string } | { success: true }

async function requireAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single<{ role: string }>()
  if (profile?.role !== 'admin') redirect('/admin')
  return { supabase, user }
}

const gameSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  current_patch: z.string().max(32).nullable(),
  sort_order: z.coerce.number().int().min(0),
  logo_url: z.string().url().nullable(),
  cover_url: z.string().url().nullable(),
})

export async function addGame(formData: FormData): Promise<ActionResult> {
  const { supabase, user } = await requireAdmin()

  const parsed = gameSchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    current_patch: formData.get('current_patch') || null,
    sort_order: formData.get('sort_order') || 0,
    logo_url: (formData.get('logo_url') as string) || null,
    cover_url: (formData.get('cover_url') as string) || null,
  })
  if (!parsed.success) {
    log.warn('games', 'addGame validation failed', parsed.error.errors)
    return { error: parsed.error.errors[0].message }
  }

  log.db('games', 'insert game', { name: parsed.data.name, slug: parsed.data.slug })
  const { data, error } = await (supabase as any)
    .from('games')
    .insert({
      name: parsed.data.name,
      slug: parsed.data.slug,
      current_patch: parsed.data.current_patch,
      sort_order: parsed.data.sort_order,
      logo_url: parsed.data.logo_url,
      cover_url: parsed.data.cover_url,
      is_supported: true,
    })
    .select('id')
    .single()

  if (error) {
    log.error('games', 'addGame db error', { code: error.code, message: error.message })
    if (error.code === '23505') return { error: 'A game with this slug already exists.' }
    return { error: error.message }
  }

  log.success('games', 'game added', { id: data.id, slug: parsed.data.slug })
  await logAudit(user.id, 'game.add', 'game', data.id)
  revalidatePath('/admin/games')
  revalidatePath('/games')
  return { success: true }
}

export async function updateGame(id: string, formData: FormData): Promise<ActionResult> {
  const { supabase, user } = await requireAdmin()

  const logoUrl = formData.get('logo_url') as string | null
  const coverUrl = formData.get('cover_url') as string | null

  log.db('games', 'updateGame', { id })
  const { error } = await (supabase as any)
    .from('games')
    .update({
      name: formData.get('name'),
      current_patch: (formData.get('current_patch') as string) || null,
      sort_order: Number(formData.get('sort_order')) || 0,
      ...(logoUrl !== null && { logo_url: logoUrl || null }),
      ...(coverUrl !== null && { cover_url: coverUrl || null }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    log.error('games', 'updateGame db error', { code: error.code, message: error.message })
    return { error: error.message }
  }

  log.success('games', 'game updated', { id })
  await logAudit(user.id, 'game.update', 'game', id)
  revalidatePath('/admin/games')
  revalidatePath('/games')
  return { success: true }
}

export async function toggleGameSupport(id: string, current: boolean): Promise<ActionResult> {
  const { supabase, user } = await requireAdmin()

  const { error } = await (supabase as any)
    .from('games')
    .update({ is_supported: !current, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }

  await logAudit(user.id, 'game.toggle', 'game', id, { is_supported: !current })
  revalidatePath('/admin/games')
  revalidatePath('/games')
  return { success: true }
}
