import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'meditrack_db',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true, // Returns MySQL DATE and DATETIME as strings (YYYY-MM-DD) instead of JS Date objects
})

// Helper function to test DB connection
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection()
    console.log(`✓ MySQL DB Connected successfully to '${process.env.DB_NAME || 'meditrack_db'}'`)
    connection.release()
    return true
  } catch (err) {
    console.error(`⚠️ MySQL DB Connection Warning: ${err.message}`)
    console.error(`Please verify MySQL is running and backend/.env contains correct credentials.`)
    return false
  }
}

export default pool
