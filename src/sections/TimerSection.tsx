import { useState, useEffect } from 'react';
import { Play, Square, Clock, BarChart2, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Task, TimeRecord, TimerState } from '@/types';
import { formatSeconds } from '@/lib/utils-extra';

interface TimerSectionProps {
  tasks: Task[];
  records: TimeRecord[];
  timer: TimerState;
  getCurrentElapsed: () => number;
  onStart: (taskId: string) => void;
  onStop: () => void;
}

export function TimerSection({ tasks, records, timer, getCurrentElapsed, onStart, onStop }: TimerSectionProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [displaySeconds, setDisplaySeconds] = useState(0);

  // Tick display
  useEffect(() => {
    if (!timer.isRunning) { setDisplaySeconds(0); return; }
    const interval = setInterval(() => setDisplaySeconds(getCurrentElapsed()), 500);
    setDisplaySeconds(getCurrentElapsed());
    return () => clearInterval(interval);
  }, [timer.isRunning, getCurrentElapsed]);

  const handleStart = () => {
    const id = selectedTaskId || (tasks[0]?.id ?? '');
    if (!id) return;
    onStart(id);
  };

  const handleStop = () => {
    onStop();
    setDisplaySeconds(0);
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending');

  // Stats
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayRecords = records.filter(r => r.date === todayStr);
  const todayTotal = todayRecords.reduce((s, r) => s + r.duration, 0);
  const weekTotal = records
    .filter(r => {
      const d = new Date(r.date);
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      return d >= startOfWeek;
    })
    .reduce((s, r) => s + r.duration, 0);

  // Group records by date for display
  const grouped: Record<string, TimeRecord[]> = {};
  records.slice(0, 30).forEach(r => {
    if (!grouped[r.date]) grouped[r.date] = [];
    grouped[r.date].push(r);
  });
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a)).slice(0, 7);

  const activeTask = tasks.find(t => t.id === timer.taskId);

  return (
    <div className="space-y-4">
      {/* Timer card */}
      <Card className="bg-gradient-to-br from-slate-800/80 to-blue-900/30 border-slate-700/50 overflow-hidden">
        <CardContent className="p-6">
          {/* Clock display */}
          <div className="text-center mb-6">
            <div className={`text-6xl font-mono font-bold tracking-tight mb-2 ${
              timer.isRunning ? 'text-blue-300' : 'text-slate-300'
            }`}>
              {formatClock(timer.isRunning ? displaySeconds : 0)}
            </div>
            {timer.isRunning && activeTask && (
              <p className="text-slate-400 text-sm truncate max-w-xs mx-auto">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-400 animate-pulse mr-2" />
                {activeTask.title}
              </p>
            )}
          </div>

          {/* Task selector */}
          {!timer.isRunning && (
            <Select
              value={selectedTaskId}
              onValueChange={setSelectedTaskId}
            >
              <SelectTrigger className="bg-slate-900/60 border-slate-600/50 text-slate-300 mb-4 h-10">
                <SelectValue placeholder={pendingTasks.length ? '选择要计时的任务...' : '暂无待完成任务'} />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                {pendingTasks.map(t => (
                  <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Control buttons */}
          <div className="flex justify-center gap-3">
            {!timer.isRunning ? (
              <Button
                onClick={handleStart}
                disabled={pendingTasks.length === 0}
                className="bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white h-12 px-8 gap-2 text-base font-medium shadow-lg shadow-blue-500/25"
              >
                <Play className="w-5 h-5" />
                开始计时
              </Button>
            ) : (
              <Button
                onClick={handleStop}
                className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white h-12 px-8 gap-2 text-base font-medium"
              >
                <Square className="w-5 h-5" />
                停止计时
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">今日工作</p>
              <p className="text-lg font-bold text-slate-200">{formatSeconds(todayTotal)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">本周工作</p>
              <p className="text-lg font-bold text-slate-200">{formatSeconds(weekTotal)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time records */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader className="pb-3 pt-4 px-4">
          <CardTitle className="text-slate-200 text-base flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-slate-400" />
            时间记录
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {sortedDates.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">暂无时间记录</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[320px] overflow-y-auto custom-scrollbar">
              {sortedDates.map(date => {
                const dayRecords = grouped[date];
                const dayTotal = dayRecords.reduce((s, r) => s + r.duration, 0);
                return (
                  <div key={date}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-slate-400">
                        {date === todayStr ? '今天' : date}
                      </span>
                      <span className="text-xs text-slate-500">{formatSeconds(dayTotal)}</span>
                    </div>
                    <div className="space-y-1">
                      {dayRecords.map(r => (
                        <div key={r.id} className="flex items-center justify-between bg-slate-900/40 rounded-lg px-3 py-2">
                          <p className="text-xs text-slate-300 truncate flex-1">{r.taskTitle}</p>
                          <span className="text-xs text-slate-500 ml-2 shrink-0">{formatSeconds(r.duration)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function formatClock(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
