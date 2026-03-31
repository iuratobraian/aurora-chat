import React, { useState } from 'react';

interface SubscriptionPlan {
  _id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  maxCommunities: number;
  maxSignals: number;
  prioritySupport: boolean;
}

interface SubscriptionSelectorProps {
  plans: SubscriptionPlan[];
  currentPlanId?: string;
  onSelectPlan: (planId: string) => void;
  loading?: boolean;
}

export function SubscriptionSelector({ 
  plans, 
  currentPlanId, 
  onSelectPlan, 
  loading 
}: SubscriptionSelectorProps) {
  const [billingCycle, setBillingCycle] = useState<'month' | 'year'>('month');

  const filteredPlans = plans.filter(p => 
    billingCycle === 'month' ? p.interval === 'month' : p.interval === 'year'
  );

  const getIntervalLabel = (interval: string) => interval === 'month' ? '/mes' : '/año';

  return (
    <div className="space-y-6">
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setBillingCycle('month')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            billingCycle === 'month' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          Mensual
        </button>
        <button
          onClick={() => setBillingCycle('year')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            billingCycle === 'year' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          Anual <span className="text-xs ml-1 text-green-400">-20%</span>
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {filteredPlans.map((plan) => (
          <div 
            key={plan._id}
            className={`relative bg-gray-900 rounded-xl p-6 border transition-all hover:border-blue-500 ${
              currentPlanId === plan._id ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-white/10'
            }`}
          >
            {currentPlanId === plan._id && (
              <div className="absolute -top-3 -right-3 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                ACTUAL
              </div>
            )}

            <div className="mb-4">
              <h3 className="text-xl font-bold text-white">{plan.name}</h3>
              <p className="text-gray-400 text-sm mt-1">{plan.description}</p>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold text-white">
                ${plan.price.toLocaleString('es-AR')}
              </span>
              <span className="text-gray-400 text-sm">
                {getIntervalLabel(plan.interval)}
              </span>
            </div>

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center text-gray-300 text-sm">
                  <svg className="w-4 h-4 mr-2 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => onSelectPlan(plan._id)}
              disabled={currentPlanId === plan._id || loading}
              className={`w-full py-3 rounded-lg font-medium transition-colors ${
                currentPlanId === plan._id
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {currentPlanId === plan._id ? 'Plan Actual' : loading ? 'Procesando...' : 'Seleccionar Plan'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
