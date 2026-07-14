import { Router, type Request, type Response } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { randomUUID } from 'crypto'
import { fileURLToPath } from 'url'
import db from '../db/index.js'
import type { Memory, ApiResponse } from '../../shared/types.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const projectRoot = path.join(__dirname, '..', '..')
const uploadsRoot = path.join(projectRoot, 'uploads')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const memoryId = req.params.id
    if (!memoryId) {
      cb(new Error('Memory ID is required'), '')
      return
    }
    const memory = db.prepare('SELECT pet_id FROM memories WHERE id = ?').get(memoryId) as
      | { pet_id: string }
      | undefined
    if (!memory) {
      cb(new Error('Memory not found'), '')
      return
    }
    const dir = path.join(uploadsRoot, 'pets', memory.pet_id, 'memories')
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

function parseMemory(row: any): Memory {
  return {
    id: row.id,
    pet_id: row.pet_id,
    content: row.content ?? '',
    image_paths: JSON.parse(row.image_paths ?? '[]'),
    memory_date: row.memory_date ?? '',
    category: row.category ?? 'daily',
    created_at: row.created_at,
  }
}

// GET /api/pets/:petId/memories - 获取某宠物的所有记忆
router.get('/pets/:petId/memories', (req: Request, res: Response): void => {
  try {
    const rows = db
      .prepare('SELECT * FROM memories WHERE pet_id = ? ORDER BY memory_date DESC, created_at DESC')
      .all(req.params.petId)
    const memories = rows.map(parseMemory)
    const response: ApiResponse<Memory[]> = { success: true, data: memories }
    res.json(response)
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message })
  }
})

// POST /api/pets/:petId/memories - 创建新记忆
router.post('/pets/:petId/memories', (req: Request, res: Response): void => {
  try {
    const { content, image_paths, memory_date, category } = req.body
    const petId = req.params.petId
    const pet = db.prepare('SELECT id FROM pets WHERE id = ?').get(petId)
    if (!pet) {
      res.status(404).json({ success: false, error: 'Pet not found' })
      return
    }
    const id = randomUUID()
    db.prepare(
      `INSERT INTO memories (id, pet_id, content, image_paths, memory_date, category)
       VALUES (?, ?, ?, ?, ?, ?)`,
    ).run(
      id,
      petId,
      content ?? '',
      JSON.stringify(image_paths ?? []),
      memory_date ?? null,
      category ?? 'daily',
    )

    const row = db.prepare('SELECT * FROM memories WHERE id = ?').get(id)
    const response: ApiResponse<Memory> = { success: true, data: parseMemory(row) }
    res.status(201).json(response)
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message })
  }
})

// PUT /api/memories/:id - 更新记忆
router.put('/memories/:id', (req: Request, res: Response): void => {
  try {
    const { content, image_paths, memory_date, category } = req.body
    const existing = db.prepare('SELECT * FROM memories WHERE id = ?').get(req.params.id) as any
    if (!existing) {
      res.status(404).json({ success: false, error: 'Memory not found' })
      return
    }
    db.prepare(
      `UPDATE memories
       SET content = ?, image_paths = ?, memory_date = ?, category = ?
       WHERE id = ?`,
    ).run(
      content ?? existing.content,
      image_paths !== undefined ? JSON.stringify(image_paths) : existing.image_paths,
      memory_date ?? existing.memory_date,
      category ?? existing.category,
      req.params.id,
    )

    const row = db.prepare('SELECT * FROM memories WHERE id = ?').get(req.params.id)
    const response: ApiResponse<Memory> = { success: true, data: parseMemory(row) }
    res.json(response)
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message })
  }
})

// DELETE /api/memories/:id - 删除记忆
router.delete('/memories/:id', (req: Request, res: Response): void => {
  try {
    const result = db.prepare('DELETE FROM memories WHERE id = ?').run(req.params.id)
    if (result.changes === 0) {
      res.status(404).json({ success: false, error: 'Memory not found' })
      return
    }
    const response: ApiResponse = { success: true }
    res.json(response)
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message })
  }
})

// POST /api/memories/:id/upload - 上传记忆照片
router.post('/memories/:id/upload', upload.array('images', 10), (req: Request, res: Response): void => {
  try {
    const files = req.files as Express.Multer.File[]
    if (!files || files.length === 0) {
      res.status(400).json({ success: false, error: 'No files uploaded' })
      return
    }
    const existing = db.prepare('SELECT * FROM memories WHERE id = ?').get(req.params.id) as any
    if (!existing) {
      res.status(404).json({ success: false, error: 'Memory not found' })
      return
    }
    const newPaths = files.map(
      (f) => `/uploads/pets/${existing.pet_id}/memories/${f.filename}`,
    )
    const existingPaths: string[] = JSON.parse(existing.image_paths ?? '[]')
    const updatedPaths = [...existingPaths, ...newPaths]
    db.prepare('UPDATE memories SET image_paths = ? WHERE id = ?').run(
      JSON.stringify(updatedPaths),
      req.params.id,
    )
    const response: ApiResponse<{ image_paths: string[] }> = {
      success: true,
      data: { image_paths: updatedPaths },
    }
    res.json(response)
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message })
  }
})

export default router
