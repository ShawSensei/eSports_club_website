import crypto from 'crypto'

const CLOUD_NAME = 'djbpgdtn7'
const API_KEY    = '473561813891437'
const API_SECRET = 'xClQMwp9SyTYo5ZbFoQ-zx3-Gn0'

const SUPABASE_URL     = 'https://bzdciswoqmodlhklcent.supabase.co'
const SUPABASE_SERVICE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6ZGNpc3dvcW1vZGxoa2xjZW50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTI3MjA1MSwiZXhwIjoyMDk0ODQ4MDUxfQ.nN2HKfkNFLr3KUBY3JEwKXwudEY0JFQoTPJK6XSXNUE'

const GAMES = [
  {
    id:    'aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa',
    name:  'VALORANT',
    logo:  'https://www.riotgames.com/darkroom/350/10ff840f188f48f5ff651cd7d5adfb7e:8b53c2387dc0e60232af20e07dad71b9/val-homepagecarousellogo.png',
    cover: 'https://cdn.akamai.steamstatic.com/steam/apps/1547060/capsule_616x353.jpg',
  },
  {
    id:    'aaaaaaaa-0002-0002-0002-aaaaaaaaaaaa',
    name:  'Counter-Strike 2',
    logo:  'https://cdn.akamai.steamstatic.com/steam/apps/730/logo.png',
    cover: 'https://cdn.akamai.steamstatic.com/steam/apps/730/capsule_616x353.jpg',
  },
  {
    id:    'aaaaaaaa-0003-0003-0003-aaaaaaaaaaaa',
    name:  'League of Legends',
    logo:  'https://www.riotgames.com/darkroom/350/f2d4898883bd23a03a47251b5c033325:03d0021b0dedf3e04d62cad99f9e6869/lol-homepagecarousellogo.png',
    cover: 'https://cdn.akamai.steamstatic.com/steam/apps/1328820/capsule_616x353.jpg',
  },
  {
    id:    'c00ebd77-ef5c-4371-aa9b-e19cf3cb1d45',
    name:  'eFootball',
    logo:  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/EFootball_logo.svg/960px-EFootball_logo.svg.png',
    cover: 'https://cdn.akamai.steamstatic.com/steam/apps/1665460/capsule_616x353.jpg',
  },
]

function sign(params) {
  const str = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&')
  return crypto.createHash('sha1').update(str + API_SECRET).digest('hex')
}

async function uploadToCloudinary(fileUrl, publicId) {
  const timestamp = Math.floor(Date.now() / 1000)
  const params    = { folder: 'esports/games', public_id: publicId, timestamp }
  const signature = sign(params)

  const body = new URLSearchParams({
    file:       fileUrl,
    api_key:    API_KEY,
    timestamp:  String(timestamp),
    folder:     'esports/games',
    public_id:  publicId,
    signature,
  })

  const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method:  'POST',
    body,
  })
  const data = await res.json()
  if (data.error) throw new Error(`Cloudinary error for ${publicId}: ${data.error.message}`)
  return data.secure_url
}

async function updateGame(id, logo_url, cover_url) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/games?id=eq.${id}`, {
    method:  'PATCH',
    headers: {
      apikey:         SUPABASE_SERVICE,
      Authorization:  `Bearer ${SUPABASE_SERVICE}`,
      'Content-Type': 'application/json',
      Prefer:         'return=minimal',
    },
    body: JSON.stringify({ logo_url, cover_url }),
  })
  if (!res.ok) throw new Error(`Supabase update failed for ${id}: ${res.status}`)
}

async function main() {
  for (const game of GAMES) {
    console.log(`\n── ${game.name} ──`)
    const slug = game.name.toLowerCase().replace(/[^a-z0-9]/g, '-')

    console.log('  uploading logo...')
    const logoUrl  = await uploadToCloudinary(game.logo,  `${slug}-logo`)
    console.log(`  logo  → ${logoUrl}`)

    console.log('  uploading cover...')
    const coverUrl = await uploadToCloudinary(game.cover, `${slug}-cover`)
    console.log(`  cover → ${coverUrl}`)

    console.log('  updating database...')
    await updateGame(game.id, logoUrl, coverUrl)
    console.log('  ✓ done')
  }
  console.log('\n✓ All games updated.')
}

main().catch(err => { console.error(err); process.exit(1) })
