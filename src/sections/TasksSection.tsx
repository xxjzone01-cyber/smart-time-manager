import { useState } from 'react';
import { Plus, Trash2, CheckCircle, Circle, Flag, Calendar, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Task, Priority } from '@/types';
import { formatSeconds } from '@/lib/utils-extra';

interface TasksProps {
  tasks: Task[];
  onAdd: (title: string, priority: Priority, dueDate?: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onStartTimer: (taskId: string, taskTitle: string) => void;
  activeTaskId: string | null;
}

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; icon: string }> = {
  high:   { label: '高', color: 'bg-red-500/15 text-red-400 border-red-500/30',    icon: '🔴' },
  medium: { label: '中', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30', icon: '🟡' },
  low:    { label: '低', color: 'bg-green-500/15 text-green-400 border-green-500/30', icon: '🟢' },
};

export function TasksSection({ tasks, onAdd, onToggle, onDelete, onStartTimer, activeTaskId }: TasksProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [showForm, setShowForm] = useState(false);

  const handleAdd = () => {
    if (!title.trim()) return;
    onAdd(title.trim(), priority, dueDate || undefined);
    setTitle('');
    setDueDate('');
    setPriority('medium');
    setShowForm(false);
  };

  const filtered = tasks.filter(t => {
    if (filter === 'pending') return t.status === 'pending';
    if (filter === 'completed') return t.status === 'completed';
    return true;
  });

  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: '全部任务', value: tasks.length, color: 'text-slate-300' },
          { label: '待完成', value: pendingCount, color: 'text-blue-400' },
          { label: '已完成', value: completedCount, color: 'text-emerald-400' },
        ].map(stat => (
          <Card key={stat.label} className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-3 text-center">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add task form */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader className="pb-3 pt-4 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-slate-200 text-base">任务列表</CardTitle>
            <Button
              size="sm"
              onClick={() => setShowForm(v => !v)}
              className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-3 gap-1.5 text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              新建任务
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-3">
          {showForm && (
            <div className="bg-slate-900/60 rounded-xl p-3 space-y-2 border border-slate-700/40">
              <Input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="输入任务标题..."
                className="bg-slate-800 border-slate-600/50 text-slate-100 placeholder:text-slate-500 text-sm h-9"
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                autoFocus
              />
              <div className="flex gap-2">
                <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                  <SelectTrigger className="bg-slate-800 border-slate-600/50 text-slate-300 h-9 text-xs flex-1">
                    <Flag className="w-3 h-3 mr-1.5 text-slate-500" />
                    <SelectValue />
                    <ChevronDown className="w-3 h-3 ml-auto text-slate-500" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                    <SelectItem value="high">🔴 高优先级</SelectItem>
                    <SelectItem value="medium">🟡 中优先级</SelectItem>
                    <SelectItem value="low">🟢 低优先级</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="bg-slate-800 border-slate-600/50 text-slate-300 h-9 text-xs flex-1 cursor-pointer"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="ghost" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-200 h-8 text-xs">取消</Button>
                <Button size="sm" onClick={handleAdd} disabled={!title.trim()} className="bg-blue-600 hover:bg-blue-700 h-8 text-xs px-4">添加</Button>
              </div>
            </div>
          )}

          {/* Filter tabs */}
          <div className="flex gap-1 bg-slate-900/50 rounded-lg p-1">
            {(['all', 'pending', 'completed'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
                  filter === f ? 'bg-slate-700 text-slate-200' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {f === 'all' ? '全部' : f === 'pending' ? '待完成' : '已完成'}
              </button>
            ))}
          </div>

          {/* Task list */}
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
            {filtered.length === 0 && (
              <div className="text-center py-10 text-slate-500">
                <Circle className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">暂无任务</p>
              </div>
            )}
            {filtered.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={() => onToggle(task.id)}
                onDelete={() => onDelete(task.id)}
                onStartTimer={() => onStartTimer(task.id, task.title)}
                isActive={activeTaskId === task.id}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TaskItem({
  task,
  onToggle,
  onDelete,
  onStartTimer,
  isActive,
}: {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
  onStartTimer: () => void;
  isActive: boolean;
}) {
  const pc = PRIORITY_CONFIG[task.priority];
  const isOverdue = task.dueDate && task.status === 'pending' && new Date(task.dueDate) < new Date();

  return (
    <div className={`group flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${
      isActive
        ? 'bg-blue-500/10 border-blue-500/40'
        : task.status === 'completed'
        ? 'bg-slate-800/30 border-slate-700/30 opacity-60'
        : 'bg-slate-800/50 border-slate-700/40 hover:border-slate-600/60'
    }`}>
      <button onClick={onToggle} className="shrink-0 transition-transform hover:scale-110">
        {task.status === 'completed'
          ? <CheckCircle className="w-5 h-5 text-emerald-400" />
          : <Circle className="w-5 h-5 text-slate-500 hover:text-blue-400 transition-colors" />
        }
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${task.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-200'}`}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-4 border ${pc.color}`}>
            {pc.label}
          </Badge>
          {task.dueDate && (
            <span className={`flex items-center gap-0.5 text-[10px] ${isOverdue ? 'text-red-400' : 'text-slate-500'}`}>
              <Calendar className="w-2.5 h-2.5" />
              {task.dueDate}
              {isOverdue && ' · 已逾期'}
            </span>
          )}
          {task.timeSpent > 0 && (
            <span className="text-[10px] text-slate-500">⏱ {formatSeconds(task.timeSpent)}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {task.status === 'pending' && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onStartTimer}
            className={`h-7 w-7 p-0 ${isActive ? 'text-blue-400' : 'text-slate-400 hover:text-blue-400'}`}
            title="开始计时"
          >
            {isActive
              ? <span className="w-2.5 h-2.5 rounded-sm bg-blue-400" />
              : <span className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-current ml-0.5" />
            }
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={onDelete}
          className="h-7 w-7 p-0 text-slate-500 hover:text-red-400"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
