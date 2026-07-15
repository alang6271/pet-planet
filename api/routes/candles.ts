import { Router, type Request, type Response } from 'express'
import { randomUUID } from 'crypto'
import { db, ensureDB } from '../db/index.js'
import type { Candle, ApiResponse } from '../../shared/types.js'

const router = Router()

// GET /api/pets/:petId/candles - 获取某宠物的所有蜡烛
router.get('/pets/:petId/candles', async (req: Request, res: Response): Promise<void> => {
  try {
    await ensureDB()
    const result = await db.execute({
      sql: 'SELECT * FROM candles WHERE pet_id = ? ORDER BY created_at DESC',
      args: [req.params.petId],
    })
    const candles = result.rows as unknown as Candle[]
    const response: ApiResponse<Candle[]> = { success: true, data: candles }
    res.json(response)
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message })
  }
})

// POST /api/pets/:petId/candles - 点亮新蜡烛
router.post('/pets/:petId/candles', async (req: Request, res: Response): Promise<void> => {
  try {
    await ensureDB()
    const { lighter_name, message } = req.body
    const petId = req.params.petId
    const petResult = await db.execute({ sql: 'SELECT id FROM pets WHERE id = ?', args: [petId] })
    if (petResult.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Pet not found' })
      return
    }
    const id = randomUUID()
    await db.execute({
      sql: `INSERT INTO candles (id, pet_id, lighter_name, message)
       VALUES (?, ?, ?, ?)`,
      args: [id, petId, lighter_name ?? null, message ?? null],
    })

    const result = await db.execute({ sql: 'SELECT * FROM candles WHERE id = ?', args: [id] })
    const response: ApiResponse<Candle> = { success: true, data: result.rows[0] as unknown as Candle }
    res.status(201).json(response)
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message })
  }
})

export default router
