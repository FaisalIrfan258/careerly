import { ensureSchema, pool, sendError } from './_db.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed.' })
  }

  try {
    await ensureSchema()
    await pool.query('SELECT 1')
    return res.json({ ok: true })
  } catch (error) {
    return sendError(res, error)
  }
}
