'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/audit'
import log from '@/lib/logger'
import { z } from 'zod'

export type ActionResult = { error: string } | { success: true }

async function requireMod() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single<{ role: string }>()
  if (!profile || !['admin', 'moderator'].includes(profile.role)) redirect('/403')
  return { supabase, user }
}

function generateSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80)
}

const postSchema = z.object({
  title: z.string().min(3).max(200),
  category: z.enum(['news', 'announcement', 'patch', 'strategy', 'event']),
  game_id: z.string().uuid().nullable(),
  excerpt: z.string().max(300).nullable(),
  body: z.string().min(10),
  tags: z.string().nullable(),
  cover_url: z.string().url().nullable(),
})

export async function createPost(formData: FormData): Promise<ActionResult> {
  const { supabase, user } = await requireMod()

  const raw = {
    title: formData.get('title') as string,
    category: formData.get('category') as string,
    game_id: (formData.get('game_id') as string) || null,
    excerpt: (formData.get('excerpt') as string) || null,
    body: formData.get('body') as string,
    tags: (formData.get('tags') as string) || null,
    cover_url: (formData.get('cover_url') as string) || null,
  }

  const parsed = postSchema.safeParse(raw)
  if (!parsed.success) {
    log.warn('news', 'createPost validation failed', parsed.error.errors)
    return { error: parsed.error.errors[0].message }
  }

  const slug = generateSlug(parsed.data.title)
  const tags = parsed.data.tags ? parsed.data.tags.split(',').map(t => t.trim()).filter(Boolean) : []

  log.db('news', 'insert post', { slug, category: parsed.data.category })
  const { data, error } = await (supabase as any)
    .from('news_posts')
    .insert({ ...parsed.data, tags, slug, author_id: user.id, is_published: false })
    .select('id')
    .single()

  if (error) {
    log.error('news', 'createPost db error', { code: error.code, message: error.message })
    if (error.code === '23505') return { error: 'A post with this title already exists.' }
    return { error: error.message }
  }

  log.success('news', 'post created', { id: data.id, slug })
  await logAudit(user.id, 'news.create', 'news_post', data.id)
  revalidatePath('/admin/news')
  redirect(`/admin/news/${data.id}`)
}

export async function updatePost(id: string, formData: FormData): Promise<ActionResult> {
  const { supabase, user } = await requireMod()

  const raw = {
    title: formData.get('title') as string,
    category: formData.get('category') as string,
    game_id: (formData.get('game_id') as string) || null,
    excerpt: (formData.get('excerpt') as string) || null,
    body: formData.get('body') as string,
    tags: (formData.get('tags') as string) || null,
    cover_url: (formData.get('cover_url') as string) || null,
  }

  const parsed = postSchema.safeParse(raw)
  if (!parsed.success) {
    log.warn('news', 'updatePost validation failed', parsed.error.errors)
    return { error: parsed.error.errors[0].message }
  }

  const tags = parsed.data.tags ? parsed.data.tags.split(',').map(t => t.trim()).filter(Boolean) : []

  log.db('news', 'update post', { id })
  const { error } = await (supabase as any)
    .from('news_posts')
    .update({ ...parsed.data, tags, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    log.error('news', 'updatePost db error', { code: error.code, message: error.message })
    return { error: error.message }
  }

  log.success('news', 'post updated', { id })
  await logAudit(user.id, 'news.update', 'news_post', id)
  revalidatePath('/admin/news')
  revalidatePath('/news')
  return { success: true }
}

export async function togglePublish(id: string, currentState: boolean): Promise<ActionResult> {
  const { supabase, user } = await requireMod()

  const isPublished = !currentState
  const { error } = await (supabase as any)
    .from('news_posts')
    .update({
      is_published: isPublished,
      published_at: isPublished ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return { error: error.message }

  const action = isPublished ? 'news.publish' : 'news.unpublish'
  await logAudit(user.id, action, 'news_post', id)
  revalidatePath('/admin/news')
  revalidatePath('/news')
  return { success: true }
}

export async function togglePin(id: string, currentState: boolean): Promise<ActionResult> {
  const { supabase, user } = await requireMod()

  const { error } = await (supabase as any)
    .from('news_posts')
    .update({ is_pinned: !currentState, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }

  await logAudit(user.id, 'news.pin', 'news_post', id)
  revalidatePath('/admin/news')
  revalidatePath('/news')
  return { success: true }
}

export async function deletePost(id: string): Promise<ActionResult> {
  const { supabase, user } = await requireMod()

  const { error } = await supabase.from('news_posts').delete().eq('id', id)
  if (error) return { error: error.message }

  await logAudit(user.id, 'news.delete', 'news_post', id)
  revalidatePath('/admin/news')
  revalidatePath('/news')
  return { success: true }
}

