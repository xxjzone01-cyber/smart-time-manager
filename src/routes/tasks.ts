import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { Env } from '../index'

const tasksRouter = new Hono<{ Bindings: Env }>()

const taskSchema = z.object({
  title: z.string().min(1),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.string().optional(),
  completed: z.boolean().optional()
})

// Get all tasks
tasksRouter.get('/', async (c) => {
  const userId = c.get('userId' as never) as number
  const db = c.env.DB
  
  const { results } = await db.prepare(
    `SELECT id, title, priority, due_date as dueDate, completed, total_seconds as totalSeconds, created_at as createdAt
     FROM tasks WHERE user_id = ? ORDER BY created_at DESC`
  ).bind(userId).all()
  
  return c.json({ tasks: results })
})

// Create task
tasksRouter.post('/', zValidator('json', taskSchema), async (c) => {
  const userId = c.get('userId' as never) as number
  const { title, priority, dueDate } = c.req.valid('json')
  const db = c.env.DB
  
  const result = await db.prepare(
    `INSERT INTO tasks (user_id, title, priority, due_date, completed, total_seconds, created_at)
     VALUES (?, ?, ?, ?, 0, 0, datetime('now'))`
  ).bind(userId, title, priority, dueDate || null).run()
  
  if (!result.success) {
    return c.json({ error: 'Failed to create task' }, 500)
  }
  
  const task = await db.prepare(
    'SELECT * FROM tasks WHERE id = ?'
  ).bind(result.meta?.last_row_id).first()
  
  return c.json({ task }, 201)
})

// Update task
tasksRouter.put('/:id', zValidator('json', taskSchema.partial()), async (c) => {
  const userId = c.get('userId' as never) as number
  const taskId = c.req.param('id')
  const updates = c.req.valid('json')
  const db = c.env.DB
  
  // Verify ownership
  const existing = await db.prepare(
    'SELECT id FROM tasks WHERE id = ? AND user_id = ?'
  ).bind(taskId, userId).first()
  
  if (!existing) {
    return c.json({ error: 'Task not found' }, 404)
  }
  
  // Build update query
  const fields: string[] = []
  const values: (string | number | boolean | null)[] = []
  
  if (updates.title !== undefined) {
    fields.push('title = ?')
    values.push(updates.title)
  }
  if (updates.priority !== undefined) {
    fields.push('priority = ?')
    values.push(updates.priority)
  }
  if (updates.dueDate !== undefined) {
    fields.push('due_date = ?')
    values.push(updates.dueDate || null)
  }
  if (updates.completed !== undefined) {
    fields.push('completed = ?')
    values.push(updates.completed ? 1 : 0)
  }
  
  if (fields.length === 0) {
    return c.json({ error: 'No fields to update' }, 400)
  }
  
  values.push(taskId)
  
  await db.prepare(
    `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`
  ).bind(...values).run()
  
  const task = await db.prepare(
    'SELECT * FROM tasks WHERE id = ?'
  ).bind(taskId).first()
  
  return c.json({ task })
})

// Delete task
tasksRouter.delete('/:id', async (c) => {
  const userId = c.get('userId' as never) as number
  const taskId = c.req.param('id')
  const db = c.env.DB
  
  // Verify ownership
  const existing = await db.prepare(
    'SELECT id FROM tasks WHERE id = ? AND user_id = ?'
  ).bind(taskId, userId).first()
  
  if (!existing) {
    return c.json({ error: 'Task not found' }, 404)
  }
  
  // Delete related time entries first
  await db.prepare('DELETE FROM time_entries WHERE task_id = ?').bind(taskId).run()
  
  // Delete task
  await db.prepare('DELETE FROM tasks WHERE id = ?').bind(taskId).run()
  
  return c.json({ success: true })
})

export { tasksRouter }
