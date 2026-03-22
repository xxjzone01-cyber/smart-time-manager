// ============ User ============
export type MembershipTier = 'free' | 'pro' | 'team';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  membershipTier: MembershipTier;
  createdAt: string;
}

// ============ Task ============
export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'completed';

export interface Task {
  id: string;
  userId: string;
  title: string;
  priority: Priority;
  dueDate?: string; // ISO date string
  status: TaskStatus;
  createdAt: string;
  completedAt?: string;
  timeSpent: number; // seconds
}

// ============ Time Record ============
export interface TimeRecord {
  id: string;
  userId: string;
  taskId: string;
  taskTitle: string;
  startTime: string; // ISO
  endTime?: string;  // ISO
  duration: number;  // seconds
  date: string;      // YYYY-MM-DD
}

// ============ Timer State ============
export interface TimerState {
  isRunning: boolean;
  taskId: string | null;
  startTime: number | null; // Date.now()
  elapsed: number; // seconds accumulated before current run
}

// ============ App Data (for export/import) ============
export interface AppData {
  user: User;
  tasks: Task[];
  timeRecords: TimeRecord[];
  exportedAt: string;
  version: string;
}

// ============ Auth ============
export type AuthMode = 'login' | 'register';
