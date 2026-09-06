import { ensureSchema, pool, safe, sendError } from '../_db.js'

const applicationFields = ['company', 'role', 'type', 'status', 'location', 'link', 'notes']

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed.' })
  }

  try {
    await ensureSchema()
    const { company, role, type, status } = req.body

    if (!company || !role || !type || !status) {
      return res.status(400).json({ error: 'Company, role, type, and status are required.' })
    }

    const values = applicationFields.map((key) => safe(req.body[key]))
    const placeholders = applicationFields.map((_, index) => `$${index + 1}`).join(', ')
    const result = await pool.query(
      `INSERT INTO applications (${applicationFields.join(', ')}) VALUES (${placeholders}) RETURNING *`,
      values,
    )

    return res.status(201).json(result.rows[0])
  } catch (error) {
    return sendError(res, error)
  }
}
