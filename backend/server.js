import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

import { testConnection } from './config/db.js'
import medicineRoutes from './routes/medicineRoutes.js'
import supplierRoutes from './routes/supplierRoutes.js'
import authRoutes from './routes/authRoutes.js'
import salesRoutes from './routes/salesRoutes.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000

// Middleware Setup
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', clientUrl],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health Check API
app.get('/api/health', async (req, res) => {
  const dbConnected = await testConnection()
  res.json({
    status: 'online',
    system: 'MediTrack Backend API',
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'connected' : 'disconnected (Check MySQL Workbench / local server)',
  })
})

// Root API welcome
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to MediTrack Medicine Stock and Expiry Management API',
    version: '1.0.0',
    documentation: {
      health: 'GET /api/health',
      medicines: 'GET /api/medicines',
      lowStock: 'GET /api/medicines/low-stock',
      expiring: 'GET /api/medicines/expiring',
      suppliers: 'GET /api/suppliers',
      auth: 'POST /api/auth/login',
    },
  })
})

// Registered API Routes
app.use('/api/medicines', medicineRoutes)
app.use('/api/suppliers', supplierRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/sales', salesRoutes)

// Error Handling Middleware
app.use(notFound)
app.use(errorHandler)

// Start Server
app.listen(PORT, async () => {
  console.log('\n==================================================')
  console.log(`🏥 MediTrack Backend API running on port ${PORT}`)
  console.log(`🔗 API Base URL: http://localhost:${PORT}`)
  console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log('==================================================\n')

  await testConnection()
})
