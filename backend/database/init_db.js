import mysql from 'mysql2/promise'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '../.env') })

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  multipleStatements: true,
}

async function initializeDatabase() {
  console.log('🚀 MediTrack Database Initializer starting...')
  console.log(`Connecting to MySQL host: ${dbConfig.host}:${dbConfig.port} as user: ${dbConfig.user}`)

  let connection
  try {
    connection = await mysql.createConnection(dbConfig)
    console.log('✓ Successfully connected to MySQL server.')

    const schemaPath = path.join(__dirname, 'schema.sql')
    const seedPath = path.join(__dirname, 'seed.sql')

    console.log('📄 Executing database schema creation script (schema.sql)...')
    const schemaSql = fs.readFileSync(schemaPath, 'utf8')
    await connection.query(schemaSql)
    console.log('✓ Schema applied successfully (Tables created: users, suppliers, medicines).')

    console.log('🌱 Seeding initial sample data (seed.sql)...')
    const seedSql = fs.readFileSync(seedPath, 'utf8')
    await connection.query(seedSql)
    console.log('✓ Sample data seeded successfully!')

    console.log('\n==================================================')
    console.log('🎉 MediTrack Database initialized successfully!')
    console.log('Database Name: meditrack_db')
    console.log('==================================================\n')
  } catch (err) {
    console.error('❌ Failed to initialize database:')
    console.error(err.message)
    console.log('\n💡 Note: Make sure your MySQL Server (MySQL Workbench / service) is running.')
    console.log('Update the database credentials in backend/.env if needed.')
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

initializeDatabase()
