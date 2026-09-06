import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is required in the Vercel environment variables.')
}

const globalForPg = globalThis

export const pool = globalForPg.careerlyPool ?? new Pool({ connectionString })

if (!globalForPg.careerlyPool) {
  globalForPg.careerlyPool = pool
}

export const safe = (value) => value ?? null

export async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS applications (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      company text NOT NULL,
      role text NOT NULL,
      type text NOT NULL,
      status text NOT NULL,
      location text,
      link text,
      notes text,
      created_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS work_hours (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      date date NOT NULL,
      hours numeric(6,2) NOT NULL,
      rate numeric(10,2) NOT NULL,
      note text,
      created_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS learning_courses (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      title text NOT NULL,
      total integer,
      completed integer NOT NULL DEFAULT 0,
      progress integer NOT NULL DEFAULT 0,
      notes text,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `)
}

export function sendError(res, error) {
  console.error(error)
  return res.status(500).json({ error: 'The server could not complete that request.' })
}
