import { ensureSchema, pool, safe, sendError } from '../_db.js'

const applicationFields = ['company', 'role', 'type', 'status', 'location', 'link', 'notes']

export default async function handler(req, res) {
  try {
    await ensureSchema()

    if (req.method === 'PATCH') {
      const values = applicationFields.map((key) => safe(req.body[key]))
      const set = applicationFields.map((key, index) => `${key} = $${index + 1}`).join(', ')
      const result = await pool.query(
        `UPDATE applications SET ${set} WHERE id = $${values.length + 1} RETURNING *`,
        [...values, req.query.id],
      )

      if (!result.rowCount) return res.status(404).json({ error: 'Application not found.' })
      return res.json(result.rows[0])
    }

    if (req.method === 'DELETE') {
      await pool.query('DELETE FROM applications WHERE id = $1', [req.query.id])
      return res.status(204).end()
    }

    res.setHeader('Allow', 'PATCH, DELETE')
    return res.status(405).json({ error: 'Method not allowed.' })
  } catch (error) {
    return sendError(res, error)
  }
}
