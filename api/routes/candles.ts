import { Router, type Request, type Response } from 'express'
import { randomUUID } from 'crypto'
import db from '../db/index.js'
import type { Candle, ApiResponse } from '../../shared/types.js'

const router = Router()

// GET /api/pets/:petId/candles - 获取某宠物的所有蜡烛
router.get('/pets/:petId/candles', (req: Request, res: Response): void => {
  try {
    const rows = db
      .prepare('SELECT * FROM candles WHERE pet_id = ? ORDER BY created_at DESC')
      .all(req.params.petId)
    const candles = rows as Candle[]
    const response: ApiResponse<Candle[]> = { success: true, data: candles }
    res.json(response)
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message })
  }
})

// POST /api/pets/:petId/candles - 点亮新蜡烛
router.post('/pets/:petId/candles', (req: Request, res: Response): void => {
  try {
    const { lighter_name, message } = req.body
    const petId = req.params.petId
    const pet = db.prepare('SELECT id FROM pets WHERE id = ?').get(petId)
    if (!pet) {
      res.status(404).json({ success: false, error: 'Pet not found' })
      return
    }
    const id = randomUUID()
    db.prepare(
      `INSERT INTO candles (id, pet_id, lighter_name, message)
       VALUES (?, ?, ?, ?)`,
    ).run(id, petId, lighter_name ?? null, message ?? null)

    const row = db.prepare('SELECT * FROM candles WHERE id = ?').get(id) as Candle
    const response: ApiResponse<Candle> = { success: true, data: row }
    res.status(201).json(response)
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message })
  }
})

export default router
