'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'

export default function Home() {
  const { data: session, status } = useSession()
  const [tasks, setTasks] = useState<{id: number; title: string; completed: boolean}[]>([])
  const [newTask, setNewTask] = useState('')

  // 加载用户任务
  useEffect(() => {
    if (session?.user?.email) {
      const saved = localStorage.getItem(`tasks_${session.user.email}`)
      if (saved) setTasks(JSON.parse(saved))
    }
  }, [session])

  // 保存任务
  const saveTasks = (newTasks: typeof tasks) => {
    setTasks(newTasks)
    if (session?.user?.email) {
      localStorage.setItem(`tasks_${session.user.email}`, JSON.stringify(newTasks))
    }
  }

  const addTask = () => {
    if (!newTask.trim()) return
    saveTasks([...tasks, { id: Date.now(), title: newTask, completed: false }])
    setNewTask('')
  }

  const toggleTask = (id: number) => {
    saveTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  const deleteTask = (id: number) => {
    saveTasks(tasks.filter(t => t.id !== id))
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-400">加载中...</div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-800 dark:text-white">智能时间管家</h1>
          <p className="mb-8 text-gray-600 dark:text-gray-300">高效管理你的时间和任务</p>
          <button
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 px-6 border border-gray-300 rounded-lg shadow-md flex items-center gap-3 mx-auto transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            使用 Google 账号登录
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">智能时间管家</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600 dark:text-gray-300">{session.user?.name}</span>
            <button
              onClick={() => signOut()}
              className="text-sm text-red-600 hover:text-red-700"
            >
              退出登录
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">任务列表</h2>
          
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
              placeholder="添加新任务..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <button
              onClick={addTask}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              添加
            </button>
          </div>

          <ul className="space-y-2">
            {tasks.map(task => (
              <li key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  className="w-5 h-5 text-blue-600"
                />
                <span className={`flex-1 ${task.completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-white'}`}>
                  {task.title}
                </span>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  删除
                </button>
              </li>
            ))}
            {tasks.length === 0 && (
              <p className="text-center text-gray-500 py-8">暂无任务，点击上方添加</p>
            )}
          </ul>
        </div>
      </main>
    </div>
  )
}
