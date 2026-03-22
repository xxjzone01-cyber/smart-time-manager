import { useState } from 'react';
import { LogOut, Moon, Sun, Clock, CheckSquare, Database, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TasksSection } from './TasksSection';
import { TimerSection } from './TimerSection';
import { DataManagement } from './DataManagement';
import { StatsOverview } from './StatsOverview';
import type { User as UserType, Task, TimeRecord, TimerState, AppData, Priority } from '@/types';

type Tab = 'tasks' | 'timer' | 'stats' | 'data';

interface DashboardProps {
  user: UserType;
  tasks: Task[];
  records: TimeRecord[];
  timer: TimerState;
  isDark: boolean;
  getCurrentElapsed: () => number;
  onToggleTheme: () => void;
  onLogout: () => void;
  onAddTask: (title: string, priority: Priority, dueDate?: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onStartTimer: (taskId: string) => void;
  onStopTimer: () => void;
  onImport: (data: AppData) => void;
  onClearData: () => void;
}

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'tasks', label: '任务', icon: <CheckSquare className="w-5 h-5" /> },
  { id: 'timer', label: '计时', icon: <Clock className="w-5 h-5" /> },
  { id: 'stats', label: '统计', icon: <BarChart2 className="w-5 h-5" /> },
  { id: 'data', label: '数据', icon: <Database className="w-5 h-5" /> },
];

export function Dashboard(props: DashboardProps) {
  const [tab, setTab] = useState<Tab>('tasks');
  const { user, tasks, records, timer, isDark, getCurrentElapsed } = props;

  const initials = user.name.slice(0, 2).toUpperCase();

  const handleStartTimer = (taskId: string, taskTitle: string) => {
    props.onStartTimer(taskId);
    setTab('timer');
    // suppress unused warning
    void taskTitle;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top navbar */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/60 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-slate-100 text-sm hidden sm:block">智能时间管家</span>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Timer badge */}
            {timer.isRunning && (
              <div className="flex items-center gap-1.5 bg-blue-500/15 border border-blue-500/30 rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-blue-300 text-xs font-mono">{formatClock(getCurrentElapsed())}</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={props.onToggleTheme}
              className="w-8 h-8 p-0 text-slate-400 hover:text-slate-200"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <div className="flex items-center gap-2">
              <Avatar className="w-7 h-7">
                {user.avatar && <AvatarImage src={user.avatar} />}
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-violet-600 text-white text-xs font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-slate-300 text-xs hidden sm:block">{user.name}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={props.onLogout}
              className="w-8 h-8 p-0 text-slate-400 hover:text-red-400"
              title="退出登录"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto px-4 py-4 pb-28">
          {tab === 'tasks' && (
            <TasksSection
              tasks={tasks}
              onAdd={props.onAddTask}
              onToggle={props.onToggleTask}
              onDelete={props.onDeleteTask}
              onStartTimer={handleStartTimer}
              activeTaskId={timer.isRunning ? timer.taskId : null}
            />
          )}
          {tab === 'timer' && (
            <TimerSection
              tasks={tasks}
              records={records}
              timer={timer}
              getCurrentElapsed={getCurrentElapsed}
              onStart={props.onStartTimer}
              onStop={props.onStopTimer}
            />
          )}
          {tab === 'stats' && (
            <StatsOverview tasks={tasks} records={records} />
          )}
          {tab === 'data' && (
            <DataManagement
              user={user}
              tasks={tasks}
              records={records}
              onImport={props.onImport}
              onClear={props.onClearData}
            />
          )}
        </div>
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800/60">
        <div className="max-w-2xl mx-auto flex">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-all ${
                tab === t.id
                  ? 'text-blue-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className={`transition-transform ${tab === t.id ? 'scale-110' : ''}`}>
                {t.icon}
              </span>
              <span className="text-[10px] font-medium">{t.label}</span>
              {t.id === 'timer' && timer.isRunning && (
                <span className="absolute top-2 w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
