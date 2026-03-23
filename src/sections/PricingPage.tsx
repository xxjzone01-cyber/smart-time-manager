import { useState } from 'react';
import { Check, X, Crown, Zap, Users, Sparkles, CreditCard, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PayPalPayment } from '@/components/PayPalPayment';
import type { MembershipTier } from '@/types';

export type { MembershipTier };

export interface PricingPageProps {
  currentTier: MembershipTier;
  onUpgrade: (tier: MembershipTier, plan: 'monthly' | 'yearly' | 'team') => void;
}

const FEATURES = {
  free: [
    { name: '无限任务', available: true },
    { name: '基础计时器', available: true },
    { name: '数据导出(JSON)', available: true },
    { name: '云端同步', available: true },
    { name: 'AI智能分析', available: false },
    { name: '高级数据导出', available: false },
    { name: '统计数据报表', available: false },
  ],
  pro: [
    { name: '无限任务', available: true },
    { name: '基础计时器', available: true },
    { name: '数据导出(JSON)', available: true },
    { name: '云端同步', available: true },
    { name: 'AI智能分析', available: true },
    { name: '高级数据导出', available: true },
    { name: '统计数据报表', available: true },
  ],
  team: [
    { name: '无限任务', available: true },
    { name: '基础计时器', available: true },
    { name: '数据导出(JSON)', available: true },
    { name: '云端同步', available: true },
    { name: 'AI智能分析', available: true },
    { name: '高级数据导出', available: true },
    { name: '统计数据报表', available: true },
    { name: '团队协作', available: true },
    { name: '权限管理', available: true },
  ],
};

export function PricingPage({ currentTier, onUpgrade }: PricingPageProps) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | 'team'>('monthly');
  const [showPayment, setShowPayment] = useState(false);
  const [paymentTier, setPaymentTier] = useState<MembershipTier>('pro');

  const PLANS = [
    {
      id: 'monthly',
      name: 'Pro Monthly',
      price: '$5',
      period: '/月',
      description: '适合个人用户',
      badge: null,
      color: 'blue',
    },
    {
      id: 'yearly',
      name: 'Pro Yearly',
      price: '$48',
      period: '/年',
      description: 'Save 20%',
      badge: 'Save 20%',
      color: 'blue',
    },
    {
      id: 'team',
      name: 'Team',
      price: '$18',
      period: '/人/月',
      description: '团队协作',
      badge: null,
      color: 'purple',
    },
  ] as const;

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

  const currentTierInfo = getTierInfo(currentTier);

  const handleUpgradeClick = () => {
    setPaymentTier(selectedPlan === 'team' ? 'team' : 'pro');
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    onUpgrade(paymentTier, selectedPlan);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-blue-400" />
          <span className="text-sm font-medium text-slate-400">升级你的体验</span>
        </div>
        <h2 className="text-3xl lg:text-4xl font-bold text-slate-100 mb-3">选择适合你的套餐</h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          解锁更多高级功能，提升团队协作效率
        </p>
      </div>

      {/* Current Plan Banner */}
      <div className={`mb-8 p-4 rounded-xl border ${
        currentTier === 'free' 
          ? 'bg-slate-900/50 border-slate-800'
          : currentTier === 'pro'
          ? 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20'
          : 'bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-violet-500/20'
      }`}>
        <div className="flex items-center justify-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
            currentTier === 'free'
              ? 'bg-slate-800 text-slate-300'
              : currentTier === 'pro'
              ? 'bg-amber-500/20 text-amber-400'
              : 'bg-violet-500/20 text-violet-400'
          }`}>
            {currentTierInfo.icon}
            <span className="text-slate-900 font-semibold">{currentTierInfo.label}</span>
            {currentTier === 'pro' && ' 高级功能已开启'}
            {currentTier === 'team' && ' 团队功能已开启'}
          </span>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {PLANS.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          const borderColor = plan.color === 'purple' 
            ? isSelected ? 'border-violet-500' : 'border-slate-800'
            : isSelected ? 'border-blue-500' : 'border-slate-800';

          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                borderColor
              } ${isSelected ? 'bg-slate-900' : 'bg-slate-900/50 hover:bg-slate-900'}`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full text-xs font-bold text-slate-900">
                  {plan.badge}
                </div>
              )}

              <h3 className="text-xl font-bold text-slate-100 mb-2">{plan.name}</h3>
              <p className="text-sm text-slate-500 mb-4">{plan.description}</p>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-slate-100">{plan.price}</span>
                <span className="text-slate-500">{plan.period}</span>
              </div>

              <div className="space-y-3">
                {FEATURES[plan.id === 'team' ? 'team' : 'pro'].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    {feature.available ? (
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-slate-600 flex-shrink-0" />
                    )}
                    <span className={`text-sm ${feature.available ? 'text-slate-300' : 'text-slate-600'}`}>
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Free Plan Features */}
      <div className="mb-12">
        <h3 className="text-xl font-bold text-slate-100 mb-4">免费版功能</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.free.map((feature, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border ${
                feature.available
                  ? 'bg-slate-900/50 border-slate-800'
                  : 'bg-slate-900/30 border-slate-800/50 opacity-50'
              }`}
            >
              <div className="flex items-center gap-2">
                {feature.available ? (
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                ) : (
                  <X className="w-4 h-4 text-slate-600 flex-shrink-0" />
                )}
                <span className={`text-sm font-medium ${
                  feature.available ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  {feature.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade Button */}
      <div className="flex justify-center">
        {currentTier === 'free' ? (
          <Button
            size="lg"
            onClick={handleUpgradeClick}
            className="px-12 bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-400 hover:to-violet-500 font-semibold"
          >
            <CreditCard className="w-5 h-5 mr-2" />
            立即升级
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        ) : (
          <p className="text-slate-400 text-sm">
            你当前已订阅 {currentTier === 'pro' ? 'Pro' : 'Team'} 套餐，
            <a href="#" className="text-blue-400 hover:underline ml-1">管理订阅</a>
          </p>
        )}
      </div>

      {/* PayPal Payment Modal */}
      {showPayment && (
        <PayPalPayment
          plan={selectedPlan}
          tier={paymentTier}
          onSuccess={handlePaymentSuccess}
          onCancel={() => setShowPayment(false)}
        />
      )}
    </div>
  );
}
