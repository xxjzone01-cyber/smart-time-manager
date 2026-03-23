import { useAuth, useTasks, useTimeRecords, useTimer, useTheme } from '@/hooks/useStore';
import { AuthPage } from '@/sections/AuthPage';
import { Dashboard } from '@/sections/UserProfile';
import { PricingPage } from '@/sections/PricingPage';
import type { AppData, MembershipTier } from '@/types';

function App() {
  const { isDark, toggle: toggleTheme } = useTheme();
  const { user, login, register, logout, loginWithGoogle, updateMembershipTier } = useAuth();
  const { tasks, addTask, toggleTask, deleteTask, addTimeToTask, importTasks, clearUserData: clearTasks } = useTasks(user?.id ?? null);
  const { records, addRecord, importRecords, clearUserData: clearRecords } = useTimeRecords(user?.id ?? null);
  const { timer, start, stop, getCurrentElapsed } = useTimer();

  const membershipTier: MembershipTier = user?.membershipTier || 'free';

  const handleStartTimer = (taskId: string) => {
    if (timer.isRunning && timer.taskId !== taskId) {
      // Stop current timer first
      const elapsed = stop();
      const stoppedTask = tasks.find(t => t.id === timer.taskId);
      if (stoppedTask && elapsed > 0) {
        addTimeToTask(timer.taskId!, elapsed);
        addRecord({
          userId: user!.id,
          taskId: timer.taskId!,
          taskTitle: stoppedTask.title,
          startTime: new Date(Date.now() - elapsed * 1000).toISOString(),
          endTime: new Date().toISOString(),
          duration: elapsed,
          date: new Date().toISOString().slice(0, 10),
        });
      }
    }
    start(taskId);
  };

  const handleStopTimer = () => {
    if (!timer.isRunning || !timer.taskId) return;
    const elapsed = stop();
    const task = tasks.find(t => t.id === timer.taskId);
    if (task && elapsed > 0) {
      addTimeToTask(timer.taskId, elapsed);
      addRecord({
        userId: user!.id,
        taskId: timer.taskId,
        taskTitle: task.title,
        startTime: new Date(Date.now() - elapsed * 1000).toISOString(),
        endTime: new Date().toISOString(),
        duration: elapsed,
        date: new Date().toISOString().slice(0, 10),
      });
    }
  };

  const handleImport = (data: AppData) => {
    importTasks(data.tasks);
    importRecords(data.timeRecords);
  };

  const handleClearData = () => {
    clearTasks();
    clearRecords();
  };

  const handleUpgrade = (tier: MembershipTier, plan: 'monthly' | 'yearly' | 'team') => {
    console.log('Upgrade to:', tier, plan);
    // PayPal 支付成功后调用
    updateMembershipTier(tier);
  };

  if (!user) {
    return (
      <AuthPage
        onLogin={login}
        onRegister={register}
        onGoogleLogin={loginWithGoogle}
      />
    );
  }

  return (
    <Dashboard
      user={user}
      tasks={tasks}
      records={records}
      timer={timer}
      membershipTier={membershipTier}
      getCurrentElapsed={getCurrentElapsed}
      onLogout={logout}
      onAddTask={addTask}
      onToggleTask={toggleTask}
      onDeleteTask={deleteTask}
      onStartTimer={handleStartTimer}
      onStopTimer={handleStopTimer}
      onImport={handleImport}
      onClearData={handleClearData}
      onUpgrade={handleUpgrade}
    />
  );
}

export default App;
