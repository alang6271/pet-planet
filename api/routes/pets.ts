import { Router, type Request, type Response } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { randomUUID } from 'crypto'
import { fileURLToPath } from 'url'
import { db, ensureDB } from '../db/index.js'
import type { Pet, PlanetConfig, ApiResponse } from '../../shared/types.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production'
const projectRoot = path.join(__dirname, '..', '..')
const uploadsRoot = isVercel ? '/tmp/uploads' : path.join(projectRoot, 'uploads')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const petId = req.params.id
    if (!petId) {
      cb(new Error('Pet ID is required'), '')
      return
    }
    const dir = path.join(uploadsRoot, 'pets', petId)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const base = path.basename(file.originalname, ext)
    cb(null, `${Date.now()}-${base}${ext}`)
  },
})

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/i
    const extname = allowed.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowed.test(file.mimetype)
    if (extname && mimetype) {
      cb(null, true)
    } else {
      cb(new Error('Only image files (jpeg, png, gif, webp) are allowed'))
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 },
})

const router = Router()

function parsePet(row: any): Pet {
  return {
    id: row.id,
    name: row.name,
    species: row.species ?? '',
    birth_date: row.birth_date ?? null,
    death_date: row.death_date ?? null,
    avatar_path: row.avatar_path ?? null,
    epitaph: row.epitaph ?? null,
    planet_config: JSON.parse(row.planet_config),
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

// GET /api/pets - 获取所有宠物列表
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    await ensureDB()
    const result = await db.execute('SELECT * FROM pets ORDER BY created_at DESC')
    const pets = result.rows.map(parsePet)
    const response: ApiResponse<Pet[]> = { success: true, data: pets }
    res.json(response)
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message })
  }
})

// GET /api/pets/:id - 获取单个宠物详情
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    await ensureDB()
    const result = await db.execute({ sql: 'SELECT * FROM pets WHERE id = ?', args: [req.params.id] })
    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Pet not found' })
      return
    }
    const response: ApiResponse<Pet> = { success: true, data: parsePet(result.rows[0]) }
    res.json(response)
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message })
  }
})

// POST /api/pets - 创建新宠物
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    await ensureDB()
    const { name, species, birth_date, death_date, epitaph, planet_config } = req.body
    if (!name) {
      res.status(400).json({ success: false, error: 'Name is required' })
      return
    }
    const id = randomUUID()
    const config: PlanetConfig = planet_config ?? {
      color: '#ffcba0',
      texture: 'smooth',
      hasRing: false,
      decoration: 'none',
    }
    await db.execute({
      sql: `INSERT INTO pets (id, name, species, birth_date, death_date, epitaph, planet_config)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        name,
        species ?? '',
        birth_date ?? null,
        death_date ?? null,
        epitaph ?? null,
        JSON.stringify(config),
      ],
    })

    const result = await db.execute({ sql: 'SELECT * FROM pets WHERE id = ?', args: [id] })
    const response: ApiResponse<Pet> = { success: true, data: parsePet(result.rows[0]) }
    res.status(201).json(response)
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message })
  }
})

// PUT /api/pets/:id - 更新宠物信息
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    await ensureDB()
    const { name, species, birth_date, death_date, epitaph, planet_config, avatar_path } = req.body
    const existingResult = await db.execute({ sql: 'SELECT * FROM pets WHERE id = ?', args: [req.params.id] })
    if (existingResult.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Pet not found' })
      return
    }
    const existing = existingResult.rows[0] as any
    const config =
      planet_config !== undefined ? JSON.stringify(planet_config) : existing.planet_config
    await db.execute({
      sql: `UPDATE pets
       SET name = ?, species = ?, birth_date = ?, death_date = ?, epitaph = ?, planet_config = ?, avatar_path = ?, updated_at = datetime('now')
       WHERE id = ?`,
      args: [
        name ?? existing.name,
        species ?? existing.species,
        birth_date ?? existing.birth_date,
        death_date ?? existing.death_date,
        epitaph ?? existing.epitaph,
        config,
        avatar_path ?? existing.avatar_path,
        req.params.id,
      ],
    })

    const result = await db.execute({ sql: 'SELECT * FROM pets WHERE id = ?', args: [req.params.id] })
    const response: ApiResponse<Pet> = { success: true, data: parsePet(result.rows[0]) }
    res.json(response)
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message })
  }
})

// DELETE /api/pets/:id - 删除宠物
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    await ensureDB()
    const result = await db.execute({ sql: 'DELETE FROM pets WHERE id = ?', args: [req.params.id] })
    if (result.rowsAffected === 0) {
      res.status(404).json({ success: false, error: 'Pet not found' })
      return
    }
    const response: ApiResponse = { success: true }
    res.json(response)
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message })
  }
})

// POST /api/pets/:id/avatar - 上传宠物头像
router.post('/:id/avatar', upload.single('avatar'), async (req: Request, res: Response): Promise<void> => {
  try {
    await ensureDB()
    if (!req.file) {
      res.status(400).json({ success: false, error: 'No file uploaded' })
      return
    }
    const existingResult = await db.execute({ sql: 'SELECT id FROM pets WHERE id = ?', args: [req.params.id] })
    if (existingResult.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Pet not found' })
      return
    }
    const relativePath = `/uploads/pets/${req.params.id}/${req.file.filename}`
    await db.execute({
      sql: "UPDATE pets SET avatar_path = ?, updated_at = datetime('now') WHERE id = ?",
      args: [relativePath, req.params.id],
    })
    const response: ApiResponse<{ avatar_path: string }> = {
      success: true,
      data: { avatar_path: relativePath },
    }
    res.json(response)
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message })
  }
})

export default router
