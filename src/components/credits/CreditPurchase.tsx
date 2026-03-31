import React, { useState } from 'react';
import { PaymentModal } from '../PaymentModal';

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  bonus: number;
  icon: React.ReactNode;
  popular: boolean;
}

const creditPackages: CreditPackage[] = [
  { id: 'starter', name: 'Starter', credits: 100, price: 500, bonus: 0, popular: false, icon: '🪙' },
  { id: 'pro', name: 'Pro', credits: 500, price: 2000, bonus: 50, popular: true, icon: '⚡' },
  { id: 'expert', name: 'Expert', credits: 1000, price: 3500, bonus: 200, popular: false, icon: '⭐' },
];

interface CreditPurchaseProps {
  currentCredits?: number;
  userId: string;
  email: string;
  onPurchaseSuccess?: () => void;
}

export function CreditPurchase({ currentCredits = 0, userId, email, onPurchaseSuccess }: CreditPurchaseProps) {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 border border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Créditos Disponibles</p>
            <p className="text-3xl font-bold text-white">{currentCredits}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <span className="text-2xl">🪙</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {creditPackages.map((pkg) => (
          <div key={pkg.id} className={`relative bg-gray-900 rounded-xl p-4 border ${pkg.popular ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-white/10'}`}>
            {pkg.popular && <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-0.5 rounded-full">MÁS POPULAR</div>}
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">{pkg.icon}</div>
              <h3 className="text-lg font-bold text-white">{pkg.name}</h3>
            </div>
            <div className="text-center mb-4">
              <span className="text-3xl font-bold text-white">${pkg.price}</span>
              <p className="text-xl text-yellow-400">{pkg.credits} créditos</p>
              {pkg.bonus > 0 && <p className="text-sm text-green-400">+{pkg.bonus} bonus</p>}
            </div>
            <button onClick={() => setSelectedPackage(pkg.id)} className={`w-full py-2 rounded-lg font-medium ${pkg.popular ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'border border-white/20 text-gray-300 hover:bg-white/5'}`}>
              Seleccionar
            </button>
          </div>
        ))}
      </div>

      {selectedPackage && (
        <PaymentModal isOpen={true} onClose={() => setSelectedPackage(null)} userId={userId} email={email} type="subscription" itemId={selectedPackage} itemName={`Créditos ${creditPackages.find(p => p.id === selectedPackage)?.name}`} onSuccess={onPurchaseSuccess} />
      )}
    </div>
  );
}
