import { useAuth, useTasks, useTimeRecords, useTimer, useTheme } from '@/hooks/useStore';
import { AuthPage } from '@/sections/AuthPage';
import { Dashboard } from '@/sections/Dashboard';
import type { AppData } from '@/types';

function App() {
  const { isDark, toggle: toggleTheme } = useTheme();
  const { user, login, register, logout, loginWithGoogle } = useAuth();
  const { tasks, addTask, toggleTask, deleteTask, addTimeToTask, importTasks, clearUserData: clearTasks } = useTasks(user?.id ?? null);
  const { records, addRecord, importRecords, clearUserData: clearRecords } = useTimeRecords(user?.id ?? null);
  const { timer, start, stop, getCurrentElapsed } = useTimer();

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
      isDark={isDark}
      getCurrentElapsed={getCurrentElapsed}
      onToggleTheme={toggleTheme}
      onLogout={logout}
      onAddTask={addTask}
      onToggleTask={toggleTask}
      onDeleteTask={deleteTask}
      onStartTimer={handleStartTimer}
      onStopTimer={handleStopTimer}
      onImport={handleImport}
      onClearData={handleClearData}
    />
  );
}

export default App;
