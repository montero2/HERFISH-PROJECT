import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'

// Import routes
import authRoutes from './routes/auth'
import inventoryRoutes from './routes/inventory'
import procurementRoutes from './routes/procurement'
import salesRoutes from './routes/sales'
import financeRoutes from './routes/finance'
import qualityRoutes from './routes/quality'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Fish ERP Backend API is running',
    timestamp: new Date().toISOString(),
  })
})

// API Routes
app.get('/api/v1/status', (req, res) => {
  res.json({
    status: 'ready',
    version: '1.0.0',
    message: 'HERFISH LEGACY API',
    modules: {
      auth: 'ready',
      inventory: 'ready',
      procurement: 'ready',
      sales: 'ready',
      finance: 'ready',
      quality: 'ready',
    }
  })
})

// Module routes
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/inventory', inventoryRoutes)
app.use('/api/v1/procurement', procurementRoutes)
app.use('/api/v1/sales', salesRoutes)
app.use('/api/v1/finance', financeRoutes)
app.use('/api/v1/quality', qualityRoutes)

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    path: req.path
  })
})

// Error Handler
app.use((err: any, req: any, res: any) => {
  console.error(err)
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  })
})

app.listen(PORT, () => {
  console.log(`🚀 HERFISH LEGACY Backend running on http://localhost:${PORT}`)
  console.log(`📊 API Status: http://localhost:${PORT}/api/v1/status`)
  console.log(`🔐 Health: http://localhost:${PORT}/health`)
})
