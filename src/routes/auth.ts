import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import { Env } from '../index'

const authRouter = new Hono<{ Bindings: Env }>()

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
})

// Register
authRouter.post('/register', zValidator('json', registerSchema), async (c) => {
  const { email, password } = c.req.valid('json')
  const db = c.env.DB
  
  // Check if user exists
  const existingUser = await db.prepare(
    'SELECT id FROM users WHERE email = ?'
  ).bind(email).first()
  
  if (existingUser) {
    return c.json({ error: 'User already exists' }, 409)
  }
  
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10)
  
  // Create user
  const result = await db.prepare(
    'INSERT INTO users (email, password_hash, created_at) VALUES (?, ?, datetime("now"))'
  ).bind(email, hashedPassword).run()
  
  if (!result.success) {
    return c.json({ error: 'Failed to create user' }, 500)
  }
  
  // Generate JWT
  const userId = result.meta?.last_row_id
  const token = await new SignJWT({ userId, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(new TextEncoder().encode(c.env.JWT_SECRET))
  
  return c.json({
    token,
    user: { id: userId, email }
  }, 201)
})

// Login
authRouter.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json')
  const db = c.env.DB
  
  // Find user
  const user = await db.prepare(
    'SELECT id, email, password_hash FROM users WHERE email = ?'
  ).bind(email).first<{ id: number; email: string; password_hash: string }>()
  
  if (!user) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }
  
  // Verify password
  const validPassword = await bcrypt.compare(password, user.password_hash)
  
  if (!validPassword) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }
  
  // Generate JWT
  const token = await new SignJWT({ userId: user.id, email: user.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(new TextEncoder().encode(c.env.JWT_SECRET))
  
  return c.json({
    token,
    user: { id: user.id, email: user.email }
  })
})

// Get current user
authRouter.get('/me', async (c) => {
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  const token = authHeader.substring(7)
  
  try {
    const secret = new TextEncoder().encode(c.env.JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)
    
    return c.json({
      user: {
        id: payload.userId,
        email: payload.email
      }
    })
  } catch {
    return c.json({ error: 'Invalid token' }, 401)
  }
})

export { authRouter }
import { jwtVerify } from 'jose'
