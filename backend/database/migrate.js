import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import pool from '../config/db.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
try {
  const sql = fs.readFileSync(path.join(__dirname, 'pos_migration.sql'), 'utf8')
  const connection = await pool.getConnection()
  try {
    for (const statement of sql.split(';').map((item) => item.trim()).filter(Boolean)) {
      await connection.query(statement)
    }
    console.log('✓ POS database migration completed.')
  } finally { connection.release() }
  process.exit(0)
} catch (error) {
  console.error(`POS migration failed: ${error.message}`)
  process.exit(1)
}
