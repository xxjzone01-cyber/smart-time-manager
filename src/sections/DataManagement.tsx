import { useRef } from 'react';
import { Download, Upload, Trash2, Database, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { User, Task, TimeRecord, AppData } from '@/types';

interface DataManagementProps {
  user: User;
  tasks: Task[];
  records: TimeRecord[];
  onImport: (data: AppData) => void;
  onClear: () => void;
}

export function DataManagement({ user, tasks, records, onImport, onClear }: DataManagementProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data: AppData = {
      user,
      tasks,
      timeRecords: records,
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `time-manager-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string) as AppData;
        if (!data.tasks || !data.timeRecords) throw new Error('格式不正确');
        onImport(data);
        alert(`导入成功！${data.tasks.length} 个任务，${data.timeRecords.length} 条记录`);
      } catch {
        alert('导入失败：文件格式不正确');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClear = () => {
    if (window.confirm(`确定要清空所有数据吗？\n\n将删除：\n• ${tasks.length} 个任务\n• ${records.length} 条时间记录\n\n此操作不可恢复！`)) {
      onClear();
    }
  };

  return (
    <div className="space-y-4">
      {/* Overview */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
              <Database className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">任务总数</p>
              <p className="text-xl font-bold text-slate-200">{tasks.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
              <Database className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">时间记录</p>
              <p className="text-xl font-bold text-slate-200">{records.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-slate-200 text-sm flex items-center gap-2">
            <Download className="w-4 h-4 text-blue-400" />
            导出数据
          </CardTitle>
          <CardDescription className="text-slate-500 text-xs">
            将全部任务和时间记录导出为 JSON 文件，用于备份或迁移
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <Button
            onClick={handleExport}
            className="w-full bg-blue-600/80 hover:bg-blue-600 text-white h-10 gap-2"
          >
            <Download className="w-4 h-4" />
            导出备份 ({tasks.length} 任务 · {records.length} 记录)
          </Button>
        </CardContent>
      </Card>

      {/* Import */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-slate-200 text-sm flex items-center gap-2">
            <Upload className="w-4 h-4 text-emerald-400" />
            导入数据
          </CardTitle>
          <CardDescription className="text-slate-500 text-xs">
            从 JSON 备份文件恢复数据，已有数据不会被覆盖
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 h-10 gap-2"
          >
            <Upload className="w-4 h-4" />
            选择备份文件
          </Button>
        </CardContent>
      </Card>

      {/* Clear */}
      <Card className="bg-red-500/5 border-red-500/20">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-red-400 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            危险操作
          </CardTitle>
          <CardDescription className="text-slate-500 text-xs">
            清空所有本地数据，此操作不可恢复。建议先导出备份。
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <Button
            onClick={handleClear}
            variant="outline"
            className="w-full border-red-500/40 text-red-400 hover:bg-red-500/10 hover:border-red-500/60 h-10 gap-2"
          >
            <Trash2 className="w-4 h-4" />
            清空所有数据
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
