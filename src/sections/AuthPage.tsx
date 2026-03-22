import { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import type { AuthMode } from '@/types';

interface AuthPageProps {
  onLogin: (email: string, password: string) => { ok: boolean; error?: string };
  onRegister: (email: string, password: string, name: string) => { ok: boolean; error?: string };
  onGoogleLogin: () => void;
}

export function AuthPage({ onLogin, onRegister, onGoogleLogin }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 400)); // simulate network
    let result;
    if (mode === 'login') {
      result = onLogin(email, password);
    } else {
      if (!name.trim()) { setError('请输入姓名'); setLoading(false); return; }
      result = onRegister(email, password, name);
    }
    if (!result.ok) setError(result.error || '操作失败');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-2xl shadow-blue-500/30 mb-4">
            <Clock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">智能时间管家</h1>
          <p className="text-slate-400 mt-1 text-sm">掌控时间，提升效率</p>
        </div>

        <Card className="bg-slate-800/70 border-slate-700/50 shadow-2xl backdrop-blur-xl">
          <CardHeader className="pb-4">
            {/* Tab switcher */}
            <div className="flex rounded-xl bg-slate-900/60 p-1 gap-1">
              {(['login', 'register'] as AuthMode[]).map(m => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(''); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    mode === m
                      ? 'bg-gradient-to-r from-blue-500 to-violet-600 text-white shadow-lg'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {m === 'login' ? '登录' : '注册'}
                </button>
              ))}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <Alert className="bg-red-500/10 border-red-500/30 text-red-400 text-sm py-2">
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-sm">姓名</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="请输入姓名"
                      className="pl-9 bg-slate-900/60 border-slate-600/60 text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-slate-300 text-sm">邮箱</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="pl-9 bg-slate-900/60 border-slate-600/60 text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300 text-sm">密码</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="请输入密码"
                    required
                    className="pl-9 pr-10 bg-slate-900/60 border-slate-600/60 text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white font-medium shadow-lg shadow-blue-500/25 border-0 h-10"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    处理中...
                  </span>
                ) : (mode === 'login' ? '登录' : '创建账号')}
              </Button>
            </form>

            <div className="flex items-center gap-3">
              <Separator className="flex-1 bg-slate-700" />
              <span className="text-slate-500 text-xs">或者</span>
              <Separator className="flex-1 bg-slate-700" />
            </div>

            {/* Google OAuth */}
            <button
              onClick={onGoogleLogin}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-lg border border-slate-600/60 bg-slate-900/40 hover:bg-slate-700/60 text-slate-300 hover:text-white transition-all duration-200 text-sm font-medium"
            >
              {/* Google SVG icon */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              使用 Google 账号登录
            </button>
          </CardContent>

          <CardFooter className="pt-2 pb-4">
            <p className="text-center text-slate-500 text-xs w-full">
              {mode === 'login' ? '还没有账号？' : '已有账号？'}
              <button
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
                className="text-blue-400 hover:text-blue-300 ml-1 font-medium transition-colors"
              >
                {mode === 'login' ? '立即注册' : '去登录'}
              </button>
            </p>
          </CardFooter>
        </Card>

        <p className="text-center text-slate-600 text-xs mt-6">
          © 2026 智能时间管家 · 保护您的时间与数据
        </p>
      </div>
    </div>
  );
}
