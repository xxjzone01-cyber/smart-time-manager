import { CheckCircle, Clock, TrendingUp, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Task, TimeRecord } from '@/types';
import { formatSeconds } from '@/lib/utils-extra';

interface StatsOverviewProps {
  tasks: Task[];
  records: TimeRecord[];
}

export function StatsOverview({ tasks, records }: StatsOverviewProps) {
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
  const totalTime = records.reduce((s, r) => s + r.duration, 0);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayTime = records.filter(r => r.date === todayStr).reduce((s, r) => s + r.duration, 0);

  // Last 7 days
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000);
    const dateStr = d.toISOString().slice(0, 10);
    const dayRecords = records.filter(r => r.date === dateStr);
    const total = dayRecords.reduce((s, r) => s + r.duration, 0);
    return { date: dateStr, label: ['日', '一', '二', '三', '四', '五', '六'][d.getDay()], total };
  });

  const maxDay = Math.max(...last7.map(d => d.total), 1);

  // Priority breakdown
  const priorityStats = {
    high: tasks.filter(t => t.priority === 'high'),
    medium: tasks.filter(t => t.priority === 'medium'),
    low: tasks.filter(t => t.priority === 'low'),
  };

  return (
    <div className="space-y-4">
      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: <CheckCircle className="w-5 h-5 text-emerald-400" />, label: '完成率', value: `${completionRate}%`, color: 'bg-emerald-500/15' },
          { icon: <Clock className="w-5 h-5 text-blue-400" />, label: '累计时间', value: formatSeconds(totalTime), color: 'bg-blue-500/15' },
          { icon: <TrendingUp className="w-5 h-5 text-violet-400" />, label: '今日时间', value: formatSeconds(todayTime), color: 'bg-violet-500/15' },
          { icon: <Award className="w-5 h-5 text-amber-400" />, label: '已完成', value: `${completedTasks.length} 个`, color: 'bg-amber-500/15' },
        ].map(kpi => (
          <Card key={kpi.label} className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpi.color}`}>
                {kpi.icon}
              </div>
              <div>
                <p className="text-xs text-slate-500">{kpi.label}</p>
                <p className="text-lg font-bold text-slate-200">{kpi.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Weekly chart */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-slate-200 text-base">近7天工作时间</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="flex items-end justify-between gap-2 h-32">
            {last7.map(day => {
              const heightPct = day.total > 0 ? (day.total / maxDay) * 100 : 0;
              const isToday = day.date === todayStr;
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-md transition-all duration-500 min-h-[4px] relative group"
                    style={{
                      height: `${Math.max(heightPct, 4)}%`,
                      background: isToday
                        ? 'linear-gradient(to top, #3b82f6, #8b5cf6)'
                        : 'linear-gradient(to top, #334155, #475569)',
                    }}
                  >
                    {day.total > 0 && (
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-700 text-slate-200 text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {formatSeconds(day.total)}
                      </div>
                    )}
                  </div>
                  <span className={`text-[10px] ${isToday ? 'text-blue-400 font-medium' : 'text-slate-500'}`}>
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Priority breakdown */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-slate-200 text-base">任务优先级分布</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-3">
          {[
            { label: '高优先级', count: priorityStats.high.length, color: 'bg-red-500', textColor: 'text-red-400' },
            { label: '中优先级', count: priorityStats.medium.length, color: 'bg-amber-500', textColor: 'text-amber-400' },
            { label: '低优先级', count: priorityStats.low.length, color: 'bg-green-500', textColor: 'text-green-400' },
          ].map(item => (
            <div key={item.label}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-slate-400">{item.label}</span>
                <span className={`text-xs font-medium ${item.textColor}`}>{item.count} 个</span>
              </div>
              <div className="h-2 bg-slate-700/60 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${item.color}`}
                  style={{ width: tasks.length ? `${(item.count / tasks.length) * 100}%` : '0%' }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
