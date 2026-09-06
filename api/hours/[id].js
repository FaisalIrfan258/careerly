import { ensureSchema, pool, sendError } from '../_db.js'

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', 'DELETE')
    return res.status(405).json({ error: 'Method not allowed.' })
  }

  try {
    await ensureSchema()
    await pool.query('DELETE FROM work_hours WHERE id = $1', [req.query.id])
    return res.status(204).end()
  } catch (error) {
    return sendError(res, error)
  }
}
