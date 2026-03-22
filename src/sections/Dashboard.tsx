import { useState } from 'react';
import { LogOut, Moon, Sun, Clock, CheckSquare, Database, BarChart2, Menu, X, Zap, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TasksSection } from './TasksSection';
import { TimerSection } from './TimerSection';
import { DataManagement } from './DataManagement';
import { StatsOverview } from './StatsOverview';
import type { User as UserType, Task, TimeRecord, TimerState, AppData, Priority } from '@/types';

type Tab = 'tasks' | 'timer' | 'stats' | 'data' | 'upgrade';

interface DashboardProps {
  user: UserType;
  tasks: Task[];
  records: TimeRecord[];
  timer: TimerState;
  isDark: boolean;
  isPro?: boolean;
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

const TABS: { id: Tab; label: string; icon: React.ReactNode; pro?: boolean }[] = [
  { id: 'tasks', label: '任务管理', icon: <CheckSquare className="w-5 h-5" /> },
  { id: 'timer', label: '时间追踪', icon: <Clock className="w-5 h-5" /> },
  { id: 'stats', label: '数据统计', icon: <BarChart2 className="w-5 h-5" /> },
  { id: 'data', label: '数据管理', icon: <Database className="w-5 h-5" /> },
];

export function Dashboard(props: DashboardProps) {
  const [tab, setTab] = useState<Tab>('tasks');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, tasks, records, timer, isDark, isPro, getCurrentElapsed } = props;

  const initials = user.name.slice(0, 2).toUpperCase();

  const handleStartTimer = (taskId: string, taskTitle: string) => {
    props.onStartTimer(taskId);
    setTab('timer');
    void taskTitle;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar - Desktop */}
      <aside className={`hidden lg:flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
            <Clock className="w-5 h-5 text-white" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <h1 className="font-bold text-slate-100 whitespace-nowrap">智能时间管家</h1>
              {isPro && (
                <span className="text-[10px] bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 px-1.5 py-0.5 rounded font-semibold">PRO</span>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                tab === t.id
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {t.icon}
              {sidebarOpen && <span className="font-medium whitespace-nowrap">{t.label}</span>}
            </button>
          ))}

          {/* Upgrade to Pro */}
          {!isPro && sidebarOpen && (
            <div className="mt-6 p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="font-semibold text-amber-400 text-sm">升级到 Pro</span>
              </div>
              <p className="text-xs text-slate-400 mb-3">解锁无限任务、高级统计等功能</p>
              <Button 
                size="sm" 
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 font-semibold hover:from-amber-400 hover:to-orange-400"
                onClick={() => setTab('upgrade')}
              >
                <CreditCard className="w-4 h-4 mr-1" />
                $9.99/月
              </Button>
            </div>
          )}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <Avatar className="w-9 h-9 flex-shrink-0">
              {user.avatar && <AvatarImage src={user.avatar} />}
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-violet-600 text-white text-sm font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
            )}
          </div>
          <div className={`flex items-center gap-2 mt-3 ${sidebarOpen ? '' : 'flex-col'}`}>
            <Button
              variant="ghost"
              size="sm"
              onClick={props.onToggleTheme}
              className="flex-1 text-slate-400 hover:text-slate-200"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {sidebarOpen && <span className="ml-2">主题</span>}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={props.onLogout}
              className="flex-1 text-slate-400 hover:text-red-400"
            >
              <LogOut className="w-4 h-4" />
              {sidebarOpen && <span className="ml-2">退出</span>}
            </Button>
          </div>
        </div>

        {/* Toggle sidebar */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-20 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-200"
        >
          {sidebarOpen ? <X className="w-3 h-3" /> : <Menu className="w-3 h-3" />}
        </button>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-slate-100">智能时间管家</span>
          </div>
          <div className="flex items-center gap-2">
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
              className="w-8 h-8 p-0 text-slate-400"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={props.onLogout}
              className="w-8 h-8 p-0 text-slate-400"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto lg:pt-0 pt-16">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6 lg:py-8 pb-24 lg:pb-8">
          {/* Page Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-100">
              {TABS.find(t => t.id === tab)?.label || '升级 Pro'}
            </h2>
            <p className="text-slate-400 mt-1">
              {tab === 'tasks' && '管理你的任务，追踪完成进度'}
              {tab === 'timer' && '专注计时，提高工作效率'}
              {tab === 'stats' && '查看工作时间统计和趋势'}
              {tab === 'data' && '导入导出数据，备份你的记录'}
              {tab === 'upgrade' && '解锁高级功能，提升生产力'}
            </p>
          </div>

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
          {tab === 'upgrade' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <Zap className="w-10 h-10 text-slate-900" />
                </div>
                <h3 className="text-3xl font-bold text-slate-100 mb-2">升级到 Pro</h3>
                <p className="text-slate-400 mb-8">解锁所有高级功能，让你的时间管理更上一层楼</p>
                
                <div className="grid sm:grid-cols-2 gap-4 mb-8 text-left">
                  <div className="flex items-start gap-3 p-4 bg-slate-800/50 rounded-xl">
                    <CheckSquare className="w-5 h-5 text-amber-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-200">无限任务</p>
                      <p className="text-sm text-slate-500">创建任意数量的任务</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-slate-800/50 rounded-xl">
                    <BarChart2 className="w-5 h-5 text-amber-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-200">高级统计</p>
                      <p className="text-sm text-slate-500">详细的数据分析报告</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-slate-800/50 rounded-xl">
                    <Database className="w-5 h-5 text-amber-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-200">云同步</p>
                      <p className="text-sm text-slate-500">数据自动备份到云端</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-slate-800/50 rounded-xl">
                    <Clock className="w-5 h-5 text-amber-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-200">专注模式</p>
                      <p className="text-sm text-slate-500">番茄钟和白噪音</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4 mb-6">
                  <span className="text-4xl font-bold text-slate-100">$9.99</span>
                  <span className="text-slate-500">/月</span>
                </div>

                <Button 
                  size="lg" 
                  className="w-full sm:w-auto px-12 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 font-bold hover:from-amber-400 hover:to-orange-400"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  立即升级
                </Button>
                <p className="text-xs text-slate-500 mt-4">支持 PayPal 支付 · 随时取消</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 z-50">
        <div className="flex">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-all ${
                tab === t.id
                  ? 'text-blue-400'
                  : 'text-slate-500'
              }`}
            >
              {t.icon}
              <span className="text-[10px]">{t.label.slice(0, 2)}</span>
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
