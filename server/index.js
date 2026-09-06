import 'dotenv/config'
import express from 'express'
import { Pool } from 'pg'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required. Add it to your .env file.')
const app = express()
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const port = process.env.PORT || 3001
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
app.use(express.json())

async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS applications (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company text NOT NULL, role text NOT NULL, type text NOT NULL, status text NOT NULL, location text, link text, notes text, created_at timestamptz NOT NULL DEFAULT now());
    CREATE TABLE IF NOT EXISTS work_hours (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), date date NOT NULL, hours numeric(6,2) NOT NULL, rate numeric(10,2) NOT NULL, note text, created_at timestamptz NOT NULL DEFAULT now());
    CREATE TABLE IF NOT EXISTS learning_courses (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), title text NOT NULL, total integer, completed integer NOT NULL DEFAULT 0, progress integer NOT NULL DEFAULT 0, notes text, created_at timestamptz NOT NULL DEFAULT now());
  `)
}
const safe = (value) => value ?? null
const applicationFields = ['company', 'role', 'type', 'status', 'location', 'link', 'notes']
const courseFields = ['title', 'total', 'completed', 'progress', 'notes']

app.get('/api/health', async (_req, res, next) => { try { await pool.query('SELECT 1'); res.json({ ok: true }) } catch (error) { next(error) } })
app.get('/api/data', async (_req, res, next) => { try { const [apps, hours, courses] = await Promise.all([pool.query('SELECT * FROM applications ORDER BY created_at DESC'), pool.query('SELECT * FROM work_hours ORDER BY date DESC, created_at DESC'), pool.query('SELECT * FROM learning_courses ORDER BY created_at DESC')]); res.json({ applications: apps.rows, hours: hours.rows, courses: courses.rows }) } catch (error) { next(error) } })

app.post('/api/applications', async (req, res, next) => { try { const { company, role, type, status } = req.body; if (!company || !role || !type || !status) return res.status(400).json({ error: 'Company, role, type, and status are required.' }); const values = applicationFields.map((key) => safe(req.body[key])); const result = await pool.query(`INSERT INTO applications (${applicationFields.join(', ')}) VALUES (${applicationFields.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING *`, values); res.status(201).json(result.rows[0]) } catch (error) { next(error) } })
app.patch('/api/applications/:id', async (req, res, next) => { try { const values = applicationFields.map((key) => safe(req.body[key])); const set = applicationFields.map((key, i) => `${key} = $${i + 1}`).join(', '); const result = await pool.query(`UPDATE applications SET ${set} WHERE id = $${values.length + 1} RETURNING *`, [...values, req.params.id]); if (!result.rowCount) return res.sendStatus(404); res.json(result.rows[0]) } catch (error) { next(error) } })
app.delete('/api/applications/:id', async (req, res, next) => { try { await pool.query('DELETE FROM applications WHERE id = $1', [req.params.id]); res.sendStatus(204) } catch (error) { next(error) } })

app.post('/api/hours', async (req, res, next) => { try { const { date, hours, rate, note } = req.body; if (!date || !hours || !rate) return res.status(400).json({ error: 'Date, hours, and rate are required.' }); const result = await pool.query('INSERT INTO work_hours (date, hours, rate, note) VALUES ($1, $2, $3, $4) RETURNING *', [date, hours, rate, safe(note)]); res.status(201).json(result.rows[0]) } catch (error) { next(error) } })
app.delete('/api/hours/:id', async (req, res, next) => { try { await pool.query('DELETE FROM work_hours WHERE id = $1', [req.params.id]); res.sendStatus(204) } catch (error) { next(error) } })

app.post('/api/courses', async (req, res, next) => { try { if (!req.body.title) return res.status(400).json({ error: 'A course title is required.' }); const values = courseFields.map((key) => safe(req.body[key])); const result = await pool.query(`INSERT INTO learning_courses (${courseFields.join(', ')}) VALUES (${courseFields.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING *`, values); res.status(201).json(result.rows[0]) } catch (error) { next(error) } })
app.patch('/api/courses/:id', async (req, res, next) => { try { const values = courseFields.map((key) => safe(req.body[key])); const set = courseFields.map((key, i) => `${key} = $${i + 1}`).join(', '); const result = await pool.query(`UPDATE learning_courses SET ${set} WHERE id = $${values.length + 1} RETURNING *`, [...values, req.params.id]); if (!result.rowCount) return res.sendStatus(404); res.json(result.rows[0]) } catch (error) { next(error) } })
app.delete('/api/courses/:id', async (req, res, next) => { try { await pool.query('DELETE FROM learning_courses WHERE id = $1', [req.params.id]); res.sendStatus(204) } catch (error) { next(error) } })

app.use(express.static(path.join(rootDir, 'dist')))
app.get('{*splat}', (_req, res) => res.sendFile(path.join(rootDir, 'dist', 'index.html')))
app.use((error, _req, res, _next) => { console.error(error); res.status(500).json({ error: 'The server could not complete that request.' }) })
ensureSchema().then(() => app.listen(port, () => console.log(`Careerly API running on port ${port}`))).catch((error) => { console.error('Database setup failed:', error); process.exit(1) })
