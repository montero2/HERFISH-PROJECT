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
import customerRoutes from './routes/customer'
import distributorRoutes from './routes/distributor'
import notificationRoutes from './routes/notifications'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000
const baseOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176']
const envOrigins = `${process.env.FRONTEND_URLS ?? ''},${process.env.FRONTEND_URL ?? ''}`
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)
const allowedOrigins = Array.from(new Set([...baseOrigins, ...envOrigins]))

const isPrivateIpv4 = (hostname: string) => {
  const parts = hostname.split('.').map((part) => Number(part))
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part) || part < 0 || part > 255)) {
    return false
  }

  if (parts[0] === 10) {
    return true
  }
  if (parts[0] === 192 && parts[1] === 168) {
    return true
  }
  return parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31
}

const isAllowedLanOrigin = (origin: string) => {
  try {
    const parsed = new URL(origin)
    const isHttp = parsed.protocol === 'http:' || parsed.protocol === 'https:'
    const isAllowedPort = ['5173', '5174', '5175', '5176'].includes(parsed.port)
    return isHttp && isAllowedPort && isPrivateIpv4(parsed.hostname)
  } catch (_error) {
    return false
  }
}

// Middleware
app.use(helmet())
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || isAllowedLanOrigin(origin)) {
      callback(null, true)
      return
    }
    callback(new Error(`Origin not allowed by CORS: ${origin}`))
  },
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
      customer: 'ready',
      distributor: 'ready',
      notifications: 'ready',
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
app.use('/api/v1/customer', customerRoutes)
app.use('/api/v1/distributor', distributorRoutes)
app.use('/api/v1/notifications', notificationRoutes)

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
