import { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { Check, Loader2, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MembershipTier } from './PricingPage';

type Plan = 'monthly' | 'yearly' | 'team';

const PLAN_PRICES: Record<Plan, { price: number; description: string }> = {
  monthly: { price: 5, description: 'Pro Monthly' },
  yearly: { price: 48, description: 'Pro Yearly' },
  team: { price: 18, description: 'Team per user/month' },
};

interface PayPalButtonProps {
  plan: Plan;
  tier: MembershipTier;
  onSuccess: () => void;
  onError: (error: string) => void;
}

function PayPalButton({ plan, tier, onSuccess, onError }: PayPalButtonProps) {
  const [{ options, isPending }, dispatch] = usePayPalScriptReducer();
  const [isProcessing, setIsProcessing] = useState(false);

  const planDetails = PLAN_PRICES[plan];

  const createOrder = async () => {
    setIsProcessing(true);
    try {
      // 在实际应用中，这里应该调用你的 API 创建订单
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          tier,
          amount: planDetails.price,
          currency: 'USD',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const order = await response.json();
      return order.id;
    } catch (error) {
      onError('创建订单失败，请稍后重试');
      setIsProcessing(false);
      throw error;
    }
  };

  const onApprove = async (data: any) => {
    try {
      // 验证订单
      const response = await fetch('/api/payment/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderID: data.orderID }),
      });

      if (!response.ok) {
        throw new Error('Payment verification failed');
      }

      const result = await response.json();
      if (result.status === 'COMPLETED') {
        onSuccess();
        setIsProcessing(false);
      }
    } catch (error) {
      onError('支付验证失败，请联系客服');
      setIsProcessing(false);
    }
  };

  const onErrorHandler = (err: any) => {
    console.error('PayPal error:', err);
    onError('支付过程中出现错误');
    setIsProcessing(false);
  };

  if (isPending) {
    return (
      <Button disabled className="w-full h-12">
        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        加载中...
      </Button>
    );
  }

  return (
    <PayPalButtons
      style={{
        layout: 'vertical',
        color: tier === 'team' ? 'blue' : 'gold',
        shape: 'rect',
        label: 'paypal',
        tagline: false,
      }}
      disabled={isProcessing}
      createOrder={createOrder}
      onApprove={onApprove}
      onError={onErrorHandler}
      forceReRender={[plan, tier, isProcessing]}
    />
  );
}

interface PayPalPaymentProps {
  plan: Plan;
  tier: MembershipTier;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PayPalPayment({ plan, tier, onSuccess, onCancel }: PayPalPaymentProps) {
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const planDetails = PLAN_PRICES[plan];

  const handleSuccess = () => {
    setStatus('success');
    setTimeout(() => {
      onSuccess();
    }, 2000);
  };

  const handleError = (error: string) => {
    setStatus('error');
    setErrorMessage(error);
  };

  const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'test';

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6">
        {status === 'idle' && (
          <>
            <h3 className="text-xl font-bold text-slate-100 mb-2">确认订阅</h3>
            <p className="text-slate-400 text-sm mb-6">
              你即将订阅 <span className="text-blue-400 font-medium">{planDetails.description}</span>
            </p>

            <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-400">套餐</span>
                <span className="text-slate-200 font-medium">{planDetails.description}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-400">价格</span>
                <span className="text-2xl font-bold text-slate-100">
                  ${planDetails.price}
                  <span className="text-sm text-slate-500 ml-1">
                    {plan === 'yearly' ? '/年' : plan === 'team' ? '/人/月' : '/月'}
                  </span>
                </span>
              </div>
              <div className="pt-2 border-t border-slate-700">
                <p className="text-xs text-slate-500">
                  • 随时取消 • 安全支付 • 30天退款保证
                </p>
              </div>
            </div>

            <PayPalScriptProvider
              options={{
                'client-id': paypalClientId,
                currency: 'USD',
                intent: 'capture',
              }}
            >
              <PayPalButton
                plan={plan}
                tier={tier}
                onSuccess={handleSuccess}
                onError={handleError}
              />
            </PayPalScriptProvider>

            <Button
              variant="ghost"
              className="w-full mt-4 text-slate-400 hover:text-slate-200"
              onClick={onCancel}
            >
              取消
            </Button>
          </>
        )}

        {status === 'processing' && (
          <div className="text-center py-8">
            <Loader2 className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-bold text-slate-100 mb-2">处理中...</h3>
            <p className="text-slate-400 text-sm">正在确认你的支付，请稍候</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-10 h-10 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-100 mb-2">订阅成功！</h3>
            <p className="text-slate-400 text-sm mb-6">
              感谢你的订阅，所有高级功能已解锁
            </p>
            <div className="space-y-2 text-left text-sm text-slate-300 mb-6">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>无限任务创建</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>AI 智能分析</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>高级统计数据报表</span>
              </div>
              {tier === 'team' && (
                <>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>团队协作功能</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>权限管理</span>
                  </div>
                </>
              )}
            </div>
            <Button
              className="w-full bg-gradient-to-r from-blue-500 to-violet-600"
              onClick={onSuccess}
            >
              开始使用
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10 text-red-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-100 mb-2">支付失败</h3>
            <p className="text-slate-400 text-sm mb-6">{errorMessage}</p>
            <div className="bg-slate-800/50 rounded-xl p-4 mb-6 text-left">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-slate-400">
                  <p className="mb-2">如果问题持续，请尝试：</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>检查支付卡片余额</li>
                    <li>确认账单地址正确</li>
                    <li>使用其他支付方式</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStatus('idle')}
              >
                重试
              </Button>
              <Button
                variant="ghost"
                className="flex-1 text-slate-400"
                onClick={onCancel}
              >
                取消
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
