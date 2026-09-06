import { ensureSchema, pool, safe, sendError } from '../_db.js'

const courseFields = ['title', 'total', 'completed', 'progress', 'notes']

export default async function handler(req, res) {
  try {
    await ensureSchema()

    if (req.method === 'PATCH') {
      const values = courseFields.map((key) => safe(req.body[key]))
      const set = courseFields.map((key, index) => `${key} = $${index + 1}`).join(', ')
      const result = await pool.query(
        `UPDATE learning_courses SET ${set} WHERE id = $${values.length + 1} RETURNING *`,
        [...values, req.query.id],
      )

      if (!result.rowCount) return res.status(404).json({ error: 'Course not found.' })
      return res.json(result.rows[0])
    }

    if (req.method === 'DELETE') {
      await pool.query('DELETE FROM learning_courses WHERE id = $1', [req.query.id])
      return res.status(204).end()
    }

    res.setHeader('Allow', 'PATCH, DELETE')
    return res.status(405).json({ error: 'Method not allowed.' })
  } catch (error) {
    return sendError(res, error)
  }
}
