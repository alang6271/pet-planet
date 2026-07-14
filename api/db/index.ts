import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Project root: api/db/ -> api/ -> root
const projectRoot = path.join(__dirname, '..', '..')
const dataDir = path.join(projectRoot, 'data')
const uploadsDir = path.join(projectRoot, 'uploads')

// Ensure directories exist
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

const dbPath = path.join(dataDir, 'pet-planet.db')
const db = new Database(dbPath)

// Enable WAL mode and foreign keys
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// Create tables on module load
db.exec(`
  CREATE TABLE IF NOT EXISTS pets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    species TEXT DEFAULT '',
    birth_date TEXT,
    death_date TEXT,
    avatar_path TEXT,
    epitaph TEXT,
    planet_config TEXT DEFAULT '{"color":"#ffcba0","texture":"smooth","hasRing":false,"decoration":"none"}',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS memories (
    id TEXT PRIMARY KEY,
    pet_id TEXT NOT NULL,
    content TEXT DEFAULT '',
    image_paths TEXT DEFAULT '[]',
    memory_date TEXT,
    category TEXT DEFAULT 'daily',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS candles (
    id TEXT PRIMARY KEY,
    pet_id TEXT NOT NULL,
    lighter_name TEXT,
    message TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
  );
`)

export default db
