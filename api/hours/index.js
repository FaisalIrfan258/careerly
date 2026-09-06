import { ensureSchema, pool, safe, sendError } from '../_db.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed.' })
  }

  try {
    await ensureSchema()
    const { date, hours, rate, note } = req.body

    if (!date || !hours || !rate) {
      return res.status(400).json({ error: 'Date, hours, and rate are required.' })
    }

    const result = await pool.query(
      'INSERT INTO work_hours (date, hours, rate, note) VALUES ($1, $2, $3, $4) RETURNING *',
      [date, hours, rate, safe(note)],
    )

    return res.status(201).json(result.rows[0])
  } catch (error) {
    return sendError(res, error)
  }
}
