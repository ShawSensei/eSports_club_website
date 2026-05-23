// One-time migration runner — delete after use.
import pg from 'pg'
import { readFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const { Client } = pg
const __dirname = dirname(fileURLToPath(import.meta.url))

const client = new Client({
  host: process.env.DB_HOST,
  port: 5432,
  database: 'postgres',
  user: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASS,
  ssl: { rejectUnauthorized: false },
})

const migrationsDir = join(__dirname, '..', 'supabase', 'migrations')
const seedFile = join(__dirname, '..', 'supabase', 'seed.sql')

async function run() {
  console.log('Connecting to Supabase...')
  await client.connect()
  console.log('Connected.')

  const files = readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort()

  for (const file of files) {
    const sql = readFileSync(join(migrationsDir, file), 'utf8')
    console.log(`Running migration: ${file}`)
    try {
      await client.query(sql)
      console.log(`  ✓ ${file}`)
    } catch (err) {
      console.error(`  ✗ ${file}: ${err.message}`)
      // Continue — some objects may already exist on re-run
    }
  }

  const seed = readFileSync(seedFile, 'utf8')
  console.log('Running seed.sql...')
  try {
    await client.query(seed)
    console.log('  ✓ seed.sql')
  } catch (err) {
    console.error(`  ✗ seed.sql: ${err.message}`)
  }

  await client.end()
  console.log('Done.')
}

run().catch(err => { console.error(err); process.exit(1) })
