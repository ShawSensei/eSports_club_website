'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { cloudinaryUpload, cloudinaryDelete } from '@/lib/cloudinary'
import log from '@/lib/logger'

async function requireMod() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single<{ role: string }>()
  if (!profile || !['admin', 'moderator'].includes(profile.role)) redirect('/admin')
}

export async function uploadImage(
  formData: FormData,
  folder = 'esports'
): Promise<{ url: string } | { error: string }> {
  await requireMod()

  const file = formData.get('file') as File | null
  if (!file || file.size === 0) return { error: 'No file selected.' }
  if (file.size > 5 * 1024 * 1024) return { error: 'File must be under 5 MB.' }
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
    return { error: 'Only JPEG, PNG, and WebP images are allowed.' }

  log.db('cloudinary', 'upload', { folder, bytes: file.size })
  const result = await cloudinaryUpload(file, folder)

  if ('error' in result) {
    log.error('cloudinary', 'upload failed', result.error)
  } else {
    log.success('cloudinary', 'uploaded', { url: result.url })
  }
  return result
}

export async function deleteImage(url: string): Promise<void> {
  await requireMod()
  if (!url) return
  log.db('cloudinary', 'delete', { url })
  await cloudinaryDelete(url)
}
