import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { authRouter } from './routes/auth'
import { tasksRouter } from './routes/tasks'
import { timerRouter } from './routes/timer'
import { paymentRouter } from './routes/payment'
import { authMiddleware } from './middleware/auth'

export interface Env {
  DB: D1Database
  JWT_SECRET: string
  PAYPAL_CLIENT_ID: string
  PAYPAL_CLIENT_SECRET: string
  PAYPAL_WEBHOOK_ID: string
}

const app = new Hono<{ Bindings: Env }>()

// Middleware
app.use('*', cors({
  origin: ['https://smart-time-manager.xyz', 'http://localhost:5173'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))
app.use('*', logger())

// Health check
app.get('/', (c) => c.json({ message: 'Smart Time Manager API', version: '1.0.0' }))

// Public routes
app.route('/api/auth', authRouter)

// Protected routes
app.use('/api/tasks/*', authMiddleware)
app.use('/api/timer/*', authMiddleware)
app.use('/api/payment/*', authMiddleware)

app.route('/api/tasks', tasksRouter)
app.route('/api/timer', timerRouter)
app.route('/api/payment', paymentRouter)

export default app
