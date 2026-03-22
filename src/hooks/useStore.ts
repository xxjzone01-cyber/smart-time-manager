import { useState, useEffect, useCallback } from 'react';
import type { User, Task, TimeRecord, TimerState, Priority } from '@/types';

const STORAGE_KEYS = {
  USER: 'ttm_user',
  TASKS: 'ttm_tasks',
  TIME_RECORDS: 'ttm_time_records',
  TIMER: 'ttm_timer',
  THEME: 'ttm_theme',
  USERS_DB: 'ttm_users_db',
};

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// =========== useAuth ===========
export function useAuth() {
  const [user, setUser] = useState<User | null>(() =>
    loadFromStorage<User | null>(STORAGE_KEYS.USER, null)
  );

  const login = useCallback((email: string, password: string): { ok: boolean; error?: string } => {
    const db = loadFromStorage<Record<string, { password: string; user: User }>>(STORAGE_KEYS.USERS_DB, {});
    const entry = db[email.toLowerCase()];
    if (!entry) return { ok: false, error: '该邮箱未注册' };
    if (entry.password !== password) return { ok: false, error: '密码错误' };
    setUser(entry.user);
    saveToStorage(STORAGE_KEYS.USER, entry.user);
    return { ok: true };
  }, []);

  const register = useCallback((email: string, password: string, name: string): { ok: boolean; error?: string } => {
    const db = loadFromStorage<Record<string, { password: string; user: User }>>(STORAGE_KEYS.USERS_DB, {});
    if (db[email.toLowerCase()]) return { ok: false, error: '该邮箱已注册' };
    const newUser: User = {
      id: generateId(),
      email: email.toLowerCase(),
      name,
      createdAt: new Date().toISOString(),
    };
    db[email.toLowerCase()] = { password, user: newUser };
    saveToStorage(STORAGE_KEYS.USERS_DB, db);
    setUser(newUser);
    saveToStorage(STORAGE_KEYS.USER, newUser);
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }, []);

  // Google OAuth mock
  const loginWithGoogle = useCallback(() => {
    const mockUser: User = {
      id: generateId(),
      email: 'demo@gmail.com',
      name: 'Google 用户',
      avatar: 'https://ui-avatars.com/api/?name=Google+User&background=4285F4&color=fff',
      createdAt: new Date().toISOString(),
    };
    setUser(mockUser);
    saveToStorage(STORAGE_KEYS.USER, mockUser);
  }, []);

  return { user, login, register, logout, loginWithGoogle };
}

// =========== useTasks ===========
export function useTasks(userId: string | null) {
  const [tasks, setTasks] = useState<Task[]>(() =>
    loadFromStorage<Task[]>(STORAGE_KEYS.TASKS, [])
  );

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.TASKS, tasks);
  }, [tasks]);

  const userTasks = tasks.filter(t => t.userId === userId);

  const addTask = useCallback((title: string, priority: Priority, dueDate?: string) => {
    if (!userId) return;
    const task: Task = {
      id: generateId(),
      userId,
      title,
      priority,
      dueDate,
      status: 'pending',
      createdAt: new Date().toISOString(),
      timeSpent: 0,
    };
    setTasks(prev => [task, ...prev]);
  }, [userId]);

  const toggleTask = useCallback((id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      return t.status === 'pending'
        ? { ...t, status: 'completed', completedAt: new Date().toISOString() }
        : { ...t, status: 'pending', completedAt: undefined };
    }));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const addTimeToTask = useCallback((taskId: string, seconds: number) => {
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, timeSpent: t.timeSpent + seconds } : t
    ));
  }, []);

  const importTasks = useCallback((imported: Task[]) => {
    setTasks(prev => {
      const ids = new Set(prev.map(t => t.id));
      const newOnes = imported.filter(t => !ids.has(t.id));
      return [...prev, ...newOnes];
    });
  }, []);

  const clearUserData = useCallback(() => {
    if (!userId) return;
    setTasks(prev => prev.filter(t => t.userId !== userId));
  }, [userId]);

  return { tasks: userTasks, addTask, toggleTask, deleteTask, addTimeToTask, importTasks, clearUserData };
}

// =========== useTimeRecords ===========
export function useTimeRecords(userId: string | null) {
  const [records, setRecords] = useState<TimeRecord[]>(() =>
    loadFromStorage<TimeRecord[]>(STORAGE_KEYS.TIME_RECORDS, [])
  );

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.TIME_RECORDS, records);
  }, [records]);

  const userRecords = records.filter(r => r.userId === userId);

  const addRecord = useCallback((record: Omit<TimeRecord, 'id'>) => {
    const newRecord: TimeRecord = { id: generateId(), ...record };
    setRecords(prev => [newRecord, ...prev]);
  }, []);

  const importRecords = useCallback((imported: TimeRecord[]) => {
    setRecords(prev => {
      const ids = new Set(prev.map(r => r.id));
      const newOnes = imported.filter(r => !ids.has(r.id));
      return [...prev, ...newOnes];
    });
  }, []);

  const clearUserData = useCallback(() => {
    if (!userId) return;
    setRecords(prev => prev.filter(r => r.userId !== userId));
  }, [userId]);

  return { records: userRecords, addRecord, importRecords, clearUserData };
}

// =========== useTimer ===========
export function useTimer() {
  const [timer, setTimer] = useState<TimerState>(() =>
    loadFromStorage<TimerState>(STORAGE_KEYS.TIMER, {
      isRunning: false,
      taskId: null,
      startTime: null,
      elapsed: 0,
    })
  );
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!timer.isRunning) return;
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [timer.isRunning]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.TIMER, timer);
  }, [timer]);

  const getCurrentElapsed = useCallback((): number => {
    if (!timer.isRunning || !timer.startTime) return timer.elapsed;
    return timer.elapsed + Math.floor((Date.now() - timer.startTime) / 1000);
  }, [timer, tick]); // eslint-disable-line react-hooks/exhaustive-deps

  const start = useCallback((taskId: string) => {
    setTimer({
      isRunning: true,
      taskId,
      startTime: Date.now(),
      elapsed: 0,
    });
  }, []);

  const stop = useCallback((): number => {
    const elapsed = timer.isRunning && timer.startTime
      ? timer.elapsed + Math.floor((Date.now() - timer.startTime) / 1000)
      : timer.elapsed;
    setTimer({ isRunning: false, taskId: null, startTime: null, elapsed: 0 });
    return elapsed;
  }, [timer]);

  return { timer, start, stop, getCurrentElapsed };
}

// =========== useTheme ===========
export function useTheme() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.THEME);
    if (stored !== null) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem(STORAGE_KEYS.THEME, isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggle = useCallback(() => setIsDark(v => !v), []);
  return { isDark, toggle };
}
