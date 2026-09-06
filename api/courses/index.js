import { ensureSchema, pool, safe, sendError } from '../_db.js'

const courseFields = ['title', 'total', 'completed', 'progress', 'notes']

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed.' })
  }

  try {
    await ensureSchema()

    if (!req.body.title) {
      return res.status(400).json({ error: 'A course title is required.' })
    }

    const values = courseFields.map((key) => safe(req.body[key]))
    const placeholders = courseFields.map((_, index) => `$${index + 1}`).join(', ')
    const result = await pool.query(
      `INSERT INTO learning_courses (${courseFields.join(', ')}) VALUES (${placeholders}) RETURNING *`,
      values,
    )

    return res.status(201).json(result.rows[0])
  } catch (error) {
    return sendError(res, error)
  }
}
