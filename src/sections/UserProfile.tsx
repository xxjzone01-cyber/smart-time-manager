import { useState } from 'react';
import { LogOut, Moon, Sun, Clock, CheckSquare, Database, BarChart2, Menu, X, Zap, CreditCard, Users, Crown, Settings, Bell, HelpCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TasksSection } from './TasksSection';
import { TimerSection } from './TimerSection';
import { DataManagement } from './DataManagement';
import { StatsOverview } from './StatsOverview';
import { PricingPage, MembershipTier } from './PricingPage';
import type { User as UserType, Task, TimeRecord, TimerState, AppData, Priority } from '@/types';

type Tab = 'tasks' | 'timer' | 'stats' | 'data' | 'upgrade' | 'profile';

interface DashboardProps {
  user: UserType;
  tasks: Task[];
  records: TimeRecord[];
  timer: TimerState;
  isDark: boolean;
  membershipTier?: MembershipTier;
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
  onUpgrade?: (tier: MembershipTier, plan: 'monthly' | 'yearly' | 'team') => void;
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
  const { user, tasks, records, timer, isDark, membershipTier = 'free', getCurrentElapsed } = props;

  const initials = user.name.slice(0, 2).toUpperCase();

  const getTierInfo = (tier: MembershipTier) => {
    switch (tier) {
      case 'free':
        return { icon: <Users className="w-4 h-4" />, label: 'Free', color: 'slate' };
      case 'pro':
        return { icon: <Crown className="w-4 h-4" />, label: 'Pro', color: 'amber' };
      case 'team':
        return { icon: <Zap className="w-4 h-4" />, label: 'Team', color: 'violet' };
    }
  };

  const currentTierInfo = getTierInfo(membershipTier);

  const handleStartTimer = (taskId: string, taskTitle: string) => {
    props.onStartTimer(taskId);
    setTab('timer');
    void taskTitle;
  };

  const handleUpgrade = (tier: MembershipTier, plan: 'monthly' | 'yearly' | 'team') => {
    console.log('Upgrade to:', tier, plan);
    props.onUpgrade?.(tier, plan);
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
              {membershipTier !== 'free' && (
                <span className={`text-[10px] bg-gradient-to-r ${
                  membershipTier === 'pro' ? 'from-amber-400 to-orange-500' : 'from-violet-400 to-purple-500'
                } text-slate-900 px-1.5 py-0.5 rounded font-semibold`}>
                  {membershipTier.toUpperCase()}
                </span>
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
          {membershipTier === 'free' && sidebarOpen && (
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
                $5/月
              </Button>
            </div>
          )}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <Avatar className="w-9 h-9 flex-shrink-0 cursor-pointer" onClick={() => setTab('profile')}>
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
              {tab === 'profile' ? '个人中心' : TABS.find(t => t.id === tab)?.label || '升级 Pro'}
            </h2>
            <p className="text-slate-400 mt-1">
              {tab === 'tasks' && '管理你的任务，追踪完成进度'}
              {tab === 'timer' && '专注计时，提高工作效率'}
              {tab === 'stats' && '查看工作时间统计和趋势'}
              {tab === 'data' && '导入导出数据，备份你的记录'}
              {tab === 'upgrade' && '解锁高级功能，提升生产力'}
              {tab === 'profile' && '管理你的账户和订阅'}
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
            <PricingPage
              currentTier={membershipTier}
              onUpgrade={handleUpgrade}
            />
          )}
          {tab === 'profile' && (
            <UserProfileContent
              user={user}
              membershipTier={membershipTier}
              tierInfo={currentTierInfo}
              onUpgrade={() => setTab('upgrade')}
              onLogout={props.onLogout}
            />
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

function UserProfileContent({
  user,
  membershipTier,
  tierInfo,
  onUpgrade,
  onLogout,
}: {
  user: UserType;
  membershipTier: MembershipTier;
  tierInfo: ReturnType<typeof getTierInfo>;
  onUpgrade: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Membership Status Card */}
      <div className={`bg-gradient-to-br ${
        membershipTier === 'free'
          ? 'from-slate-900 to-slate-800 border-slate-800'
          : membershipTier === 'pro'
          ? 'from-amber-500/10 to-orange-500/10 border-amber-500/20'
          : 'from-violet-500/10 to-purple-500/10 border-violet-500/20'
      } border rounded-2xl p-6`}>
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16">
            {user.avatar && <AvatarImage src={user.avatar} />}
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-violet-600 text-white text-xl font-medium">
              {user.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-100">{user.name}</h3>
            <p className="text-slate-400 text-sm">{user.email}</p>
          </div>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
            membershipTier === 'free'
              ? 'bg-slate-800 text-slate-300'
              : membershipTier === 'pro'
              ? 'bg-amber-500/20 text-amber-400'
              : 'bg-violet-500/20 text-violet-400'
          }`}>
            {tierInfo.icon}
            <span className="text-slate-900 font-semibold">{tierInfo.label}</span>
          </div>
        </div>

        {membershipTier === 'free' ? (
          <div className="mt-6 pt-6 border-t border-slate-700/50">
            <p className="text-slate-400 text-sm mb-4">升级到 Pro 解锁所有高级功能</p>
            <Button
              onClick={onUpgrade}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-400 hover:to-violet-500"
            >
              <Zap className="w-4 h-4 mr-2" />
              升级到 Pro
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        ) : (
          <div className="mt-6 pt-6 border-t border-slate-700/50">
            <p className={`text-sm ${
              membershipTier === 'pro' ? 'text-amber-400' : 'text-violet-400'
            }`}>
              {membershipTier === 'pro' ? '✓ 高级功能已开启' : '✓ 团队功能已开启'}
            </p>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                管理订阅
              </Button>
              <Button variant="ghost" size="sm" className="text-slate-400">
                <HelpCircle className="w-4 h-4 mr-2" />
                帮助中心
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h4 className="text-lg font-bold text-slate-100 mb-4">快捷操作</h4>
        <div className="grid sm:grid-cols-2 gap-3">
          <Button variant="outline" className="justify-start h-auto py-4 px-4">
            <Settings className="w-5 h-5 mr-3" />
            <div className="text-left">
              <p className="font-medium">账户设置</p>
              <p className="text-xs text-slate-500">修改个人信息</p>
            </div>
          </Button>
          <Button variant="outline" className="justify-start h-auto py-4 px-4">
            <Bell className="w-5 h-5 mr-3" />
            <div className="text-left">
              <p className="font-medium">通知设置</p>
              <p className="text-xs text-slate-500">管理提醒偏好</p>
            </div>
          </Button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-slate-900 border border-red-900/30 rounded-2xl p-6">
        <h4 className="text-lg font-bold text-red-400 mb-4">危险区域</h4>
        <p className="text-slate-400 text-sm mb-4">退出登录后，你的数据将保存在本地</p>
        <Button
          variant="outline"
          className="border-red-900/50 text-red-400 hover:bg-red-900/20 hover:text-red-300"
          onClick={onLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          退出登录
        </Button>
      </div>
    </div>
  );
}

function getTierInfo(tier: MembershipTier) {
  switch (tier) {
    case 'free':
      return { icon: <Users className="w-4 h-4" />, label: 'Free', color: 'slate' };
    case 'pro':
      return { icon: <Crown className="w-4 h-4" />, label: 'Pro', color: 'amber' };
    case 'team':
      return { icon: <Zap className="w-4 h-4" />, label: 'Team', color: 'violet' };
  }
}

function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
