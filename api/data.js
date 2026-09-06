import { ensureSchema, pool, sendError } from './_db.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed.' })
  }

  try {
    await ensureSchema()
    const [apps, hours, courses] = await Promise.all([
      pool.query('SELECT * FROM applications ORDER BY created_at DESC'),
      pool.query('SELECT * FROM work_hours ORDER BY date DESC, created_at DESC'),
      pool.query('SELECT * FROM learning_courses ORDER BY created_at DESC'),
    ])

    return res.json({
      applications: apps.rows,
      hours: hours.rows,
      courses: courses.rows,
    })
  } catch (error) {
    return sendError(res, error)
  }
}
