import { createClient, type Client } from '@libsql/client'

const isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production'

// 生产环境使用 Turso 云数据库，本地开发使用本地文件
const dbUrl = isVercel
  ? process.env.TURSO_DATABASE_URL!
  : 'file:./data/pet-planet.db'

const authToken = isVercel ? process.env.TURSO_AUTH_TOKEN : undefined

export const db: Client = createClient({ url: dbUrl, authToken })

// 懒加载初始化：确保表在首次查询前创建好
let initPromise: Promise<void> | null = null

export function ensureDB(): Promise<void> {
  if (!initPromise) {
    initPromise = initDB()
  }
  return initPromise
}

async function initDB(): Promise<void> {
  await db.batch([
    {
      sql: `CREATE TABLE IF NOT EXISTS pets (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        species TEXT DEFAULT '',
        birth_date TEXT,
        death_date TEXT,
        avatar_base64 TEXT,
        epitaph TEXT,
        planet_config TEXT DEFAULT '{"color":"#ffcba0","texture":"smooth","hasRing":false,"decoration":"none"}',
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS memories (
        id TEXT PRIMARY KEY,
        pet_id TEXT NOT NULL,
        content TEXT DEFAULT '',
        image_paths TEXT DEFAULT '[]',
        memory_date TEXT,
        category TEXT DEFAULT 'daily',
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
      )`,
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS candles (
        id TEXT PRIMARY KEY,
        pet_id TEXT NOT NULL,
        lighter_name TEXT,
        message TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
      )`,
    },
  ])
  try {
    await db.execute('ALTER TABLE memories ADD CONSTRAINT fk_memories_pet_id FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE')
  } catch {}
  try {
    await db.execute('ALTER TABLE candles ADD CONSTRAINT fk_candles_pet_id FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE')
  } catch {}
}
