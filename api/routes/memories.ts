import { Router, type Request, type Response } from 'express'
import multer from 'multer'
import { randomUUID } from 'crypto'
import { db, ensureDB } from '../db/index.js'
import type { Memory, ApiResponse } from '../../shared/types.js'

const storage = multer.memoryStorage()

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/i
    const extname = allowed.test(file.originalname.toLowerCase())
    const mimetype = allowed.test(file.mimetype)
    if (extname && mimetype) {
      cb(null, true)
    } else {
      cb(new Error('Only image files (jpeg, png, gif, webp) are allowed'))
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
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
router.get('/pets/:petId/memories', async (req: Request, res: Response): Promise<void> => {
  try {
    await ensureDB()
    const result = await db.execute({
      sql: 'SELECT * FROM memories WHERE pet_id = ? ORDER BY memory_date DESC, created_at DESC',
      args: [req.params.petId],
    })
    const memories = result.rows.map(parseMemory)
    const response: ApiResponse<Memory[]> = { success: true, data: memories }
    res.json(response)
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message })
  }
})

// POST /api/pets/:petId/memories - 创建新记忆
router.post('/pets/:petId/memories', async (req: Request, res: Response): Promise<void> => {
  try {
    await ensureDB()
    const { content, image_paths, memory_date, category } = req.body
    const petId = req.params.petId
    const petResult = await db.execute({ sql: 'SELECT id FROM pets WHERE id = ?', args: [petId] })
    if (petResult.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Pet not found' })
      return
    }
    const id = randomUUID()
    await db.execute({
      sql: `INSERT INTO memories (id, pet_id, content, image_paths, memory_date, category)
       VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        petId,
        content ?? '',
        JSON.stringify(image_paths ?? []),
        memory_date ?? null,
        category ?? 'daily',
      ],
    })

    const result = await db.execute({ sql: 'SELECT * FROM memories WHERE id = ?', args: [id] })
    const response: ApiResponse<Memory> = { success: true, data: parseMemory(result.rows[0]) }
    res.status(201).json(response)
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message })
  }
})

// PUT /api/memories/:id - 更新记忆
router.put('/memories/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    await ensureDB()
    const { content, image_paths, memory_date, category } = req.body
    const existingResult = await db.execute({
      sql: 'SELECT * FROM memories WHERE id = ?',
      args: [req.params.id],
    })
    if (existingResult.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Memory not found' })
      return
    }
    const existing = existingResult.rows[0] as any
    await db.execute({
      sql: `UPDATE memories
       SET content = ?, image_paths = ?, memory_date = ?, category = ?
       WHERE id = ?`,
      args: [
        content ?? existing.content,
        image_paths !== undefined ? JSON.stringify(image_paths) : existing.image_paths,
        memory_date ?? existing.memory_date,
        category ?? existing.category,
        req.params.id,
      ],
    })

    const result = await db.execute({ sql: 'SELECT * FROM memories WHERE id = ?', args: [req.params.id] })
    const response: ApiResponse<Memory> = { success: true, data: parseMemory(result.rows[0]) }
    res.json(response)
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message })
  }
})

// DELETE /api/memories/:id - 删除记忆
router.delete('/memories/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    await ensureDB()
    const result = await db.execute({ sql: 'DELETE FROM memories WHERE id = ?', args: [req.params.id] })
    if (result.rowsAffected === 0) {
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
router.post('/memories/:id/upload', upload.array('images', 10), async (req: Request, res: Response): Promise<void> => {
  try {
    await ensureDB()
    const files = req.files as Express.Multer.File[]
    if (!files || files.length === 0) {
      res.status(400).json({ success: false, error: 'No files uploaded' })
      return
    }
    const existingResult = await db.execute({
      sql: 'SELECT * FROM memories WHERE id = ?',
      args: [req.params.id],
    })
    if (existingResult.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Memory not found' })
      return
    }
    const existing = existingResult.rows[0] as any
    const newBase64s = files.map(
      (f) => `data:${f.mimetype};base64,${f.buffer.toString('base64')}`,
    )
    const existingPaths: string[] = JSON.parse(existing.image_paths ?? '[]')
    const updatedPaths = [...existingPaths, ...newBase64s]
    await db.execute({
      sql: 'UPDATE memories SET image_paths = ? WHERE id = ?',
      args: [JSON.stringify(updatedPaths), req.params.id],
    })
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
