import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { Env } from '../index'

const timerRouter = new Hono<{ Bindings: Env }>()

const timeEntrySchema = z.object({
  taskId: z.number(),
  seconds: z.number().min(1)
})

// Get time entries for a task
timerRouter.get('/task/:taskId', async (c) => {
  const userId = c.get('userId' as never) as number
  const taskId = c.req.param('taskId')
  const db = c.env.DB
  
  // Verify task ownership
  const task = await db.prepare(
    'SELECT id FROM tasks WHERE id = ? AND user_id = ?'
  ).bind(taskId, userId).first()
  
  if (!task) {
    return c.json({ error: 'Task not found' }, 404)
  }
  
  const { results } = await db.prepare(
    `SELECT id, task_id as taskId, seconds, recorded_at as recordedAt
     FROM time_entries WHERE task_id = ? ORDER BY recorded_at DESC`
  ).bind(taskId).all()
  
  return c.json({ entries: results })
})

// Get all time entries for user (with stats)
timerRouter.get('/stats', async (c) => {
  const userId = c.get('userId' as never) as number
  const db = c.env.DB
  
  // Get today's total
  const todayResult = await db.prepare(
    `SELECT COALESCE(SUM(seconds), 0) as total
     FROM time_entries te
     JOIN tasks t ON te.task_id = t.id
     WHERE t.user_id = ? AND date(te.recorded_at) = date('now')`
  ).bind(userId).first<{ total: number }>()
  
  // Get this week's total
  const weekResult = await db.prepare(
    `SELECT COALESCE(SUM(seconds), 0) as total
     FROM time_entries te
     JOIN tasks t ON te.task_id = t.id
     WHERE t.user_id = ? AND te.recorded_at >= datetime('now', '-7 days')`
  ).bind(userId).first<{ total: number }>()
  
  // Get daily stats for last 7 days
  const { results: dailyStats } = await db.prepare(
    `SELECT date(recorded_at) as date, SUM(seconds) as seconds
     FROM time_entries te
     JOIN tasks t ON te.task_id = t.id
     WHERE t.user_id = ? AND recorded_at >= datetime('now', '-7 days')
     GROUP BY date(recorded_at)
     ORDER BY date`
  ).bind(userId).all()
  
  return c.json({
    today: todayResult?.total || 0,
    thisWeek: weekResult?.total || 0,
    dailyStats
  })
})

// Record time entry
timerRouter.post('/', zValidator('json', timeEntrySchema), async (c) => {
  const userId = c.get('userId' as never) as number
  const { taskId, seconds } = c.req.valid('json')
  const db = c.env.DB
  
  // Verify task ownership
  const task = await db.prepare(
    'SELECT id FROM tasks WHERE id = ? AND user_id = ?'
  ).bind(taskId, userId).first()
  
  if (!task) {
    return c.json({ error: 'Task not found' }, 404)
  }
  
  // Insert time entry
  const result = await db.prepare(
    `INSERT INTO time_entries (task_id, seconds, recorded_at)
     VALUES (?, ?, datetime('now'))`
  ).bind(taskId, seconds).run()
  
  if (!result.success) {
    return c.json({ error: 'Failed to record time' }, 500)
  }
  
  // Update task total
  await db.prepare(
    `UPDATE tasks SET total_seconds = total_seconds + ? WHERE id = ?`
  ).bind(seconds, taskId).run()
  
  return c.json({ success: true, entryId: result.meta?.last_row_id }, 201)
})

export { timerRouter }
