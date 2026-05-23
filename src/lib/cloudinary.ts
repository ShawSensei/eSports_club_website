import { createHash } from 'crypto'

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!
const KEY   = process.env.CLOUDINARY_API_KEY!
const SEC   = process.env.CLOUDINARY_API_SECRET!

function sign(params: Record<string, string | number>): string {
  const str = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&')
  return createHash('sha1').update(str + SEC).digest('hex')
}

export async function cloudinaryUpload(
  file: File,
  folder = 'esports'
): Promise<{ url: string } | { error: string }> {
  const timestamp = Math.floor(Date.now() / 1000)
  const signature = sign({ folder, timestamp })

  const fd = new FormData()
  fd.append('file', file)
  fd.append('api_key', KEY)
  fd.append('timestamp', String(timestamp))
  fd.append('signature', signature)
  fd.append('folder', folder)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, {
    method: 'POST',
    body: fd,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    return { error: body.error?.message ?? 'Cloudinary upload failed' }
  }

  const data = await res.json()
  // Inject f_auto,q_auto for automatic format + compression
  const url = data.secure_url.replace('/upload/', '/upload/f_auto,q_auto/')
  return { url }
}

export async function cloudinaryDelete(url: string): Promise<void> {
  if (!url?.includes('cloudinary.com')) return

  // Extract public_id — strip transform segments and extension
  const match = url.match(/\/upload\/(?:[^/]+\/)*([^.]+)/)
  if (!match) return
  // Remove any transformation prefixes like f_auto,q_auto
  const publicId = match[1].replace(/^[a-z_,]+\//, '')

  const timestamp = Math.floor(Date.now() / 1000)
  const signature = sign({ public_id: publicId, timestamp })

  await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/destroy`, {
    method: 'POST',
    body: new URLSearchParams({
      public_id: publicId,
      api_key: KEY,
      timestamp: String(timestamp),
      signature,
    }),
  }).catch(() => {}) // non-fatal — image removal best-effort
}
