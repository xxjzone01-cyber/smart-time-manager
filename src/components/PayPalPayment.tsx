import { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { Check, Loader2, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { MembershipTier } from '@/types';

type Plan = 'monthly' | 'yearly' | 'team';

const PLAN_PRICES: Record<Plan, { price: string; description: string; period: string }> = {
  monthly: { price: '5.00', description: 'Pro Monthly', period: '/月' },
  yearly:  { price: '48.00', description: 'Pro Yearly', period: '/年' },
  team:    { price: '18.00', description: 'Team Plan', period: '/人/月' },
};

interface PayPalPaymentProps {
  plan: Plan;
  tier: MembershipTier;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PayPalPayment({ plan, tier, onSuccess, onCancel }: PayPalPaymentProps) {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const planDetails = PLAN_PRICES[plan];
  const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'test';

  const handleSuccess = () => {
    setStatus('success');
    setTimeout(() => onSuccess(), 2000);
  };

  const handleError = (msg: string) => {
    setStatus('error');
    setErrorMsg(msg);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6">

        {/* ── 待支付 ── */}
        {status === 'idle' && (
          <>
            <h3 className="text-xl font-bold text-slate-100 mb-1">确认订阅</h3>
            <p className="text-slate-400 text-sm mb-5">
              你即将订阅{' '}
              <span className="text-blue-400 font-medium">{planDetails.description}</span>
            </p>

            {/* 订单摘要 */}
            <div className="bg-slate-800/50 rounded-xl p-4 mb-5 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">套餐</span>
                <span className="text-slate-200 font-medium">{planDetails.description}</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-slate-400 text-sm">价格</span>
                <span className="text-2xl font-bold text-slate-100">
                  ${planDetails.price}
                  <span className="text-sm text-slate-500 ml-1">{planDetails.period}</span>
                </span>
              </div>
              <div className="pt-2 border-t border-slate-700">
                <p className="text-xs text-slate-500">• 随时取消  • 安全支付  • 30天退款保证</p>
              </div>
            </div>

            {/* PayPal 按钮 */}
            <PayPalScriptProvider
              options={{
                clientId,
                currency: 'USD',
                intent: 'capture',
              }}
            >
              <PayPalButtons
                style={{ layout: 'vertical', color: tier === 'team' ? 'blue' : 'gold', shape: 'rect', label: 'paypal', tagline: false }}
                createOrder={(_data, actions) =>
                  actions.order.create({
                    intent: 'CAPTURE',
                    purchase_units: [
                      {
                        description: planDetails.description,
                        amount: { currency_code: 'USD', value: planDetails.price },
                      },
                    ],
                  })
                }
                onApprove={async (_data, actions) => {
                  try {
                    const details = await actions.order!.capture();
                    if (details.status === 'COMPLETED') {
                      handleSuccess();
                    } else {
                      handleError('支付未完成，请重试');
                    }
                  } catch {
                    handleError('支付验证失败，请联系客服');
                  }
                }}
                onError={() => handleError('PayPal 出现错误，请稍后重试')}
                onCancel={() => onCancel()}
              />
            </PayPalScriptProvider>

            <Button
              variant="ghost"
              className="w-full mt-3 text-slate-400 hover:text-slate-200"
              onClick={onCancel}
            >
              取消
            </Button>
          </>
        )}

        {/* ── 成功 ── */}
        {status === 'success' && (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-10 h-10 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-100 mb-2">订阅成功！</h3>
            <p className="text-slate-400 text-sm mb-6">感谢你的订阅，所有高级功能已解锁</p>
            <div className="space-y-2 text-left text-sm text-slate-300 mb-6">
              {['无限任务创建', 'AI 智能分析', '高级统计数据报表'].map(f => (
                <div key={f} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span>{f}</span>
                </div>
              ))}
              {tier === 'team' && (
                <>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /><span>团队协作功能</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /><span>权限管理</span></div>
                </>
              )}
            </div>
            <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              正在跳转...
            </div>
          </div>
        )}

        {/* ── 失败 ── */}
        {status === 'error' && (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10 text-red-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-100 mb-2">支付失败</h3>
            <p className="text-slate-400 text-sm mb-6">{errorMsg}</p>
            <div className="bg-slate-800/50 rounded-xl p-4 mb-6 text-left">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                <ul className="text-sm text-slate-400 space-y-1 list-disc list-inside">
                  <li>检查支付卡片余额</li>
                  <li>确认账单地址正确</li>
                  <li>使用其他支付方式</li>
                </ul>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStatus('idle')}>重试</Button>
              <Button variant="ghost" className="flex-1 text-slate-400" onClick={onCancel}>取消</Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
