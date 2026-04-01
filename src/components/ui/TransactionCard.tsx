import React from 'react';

interface TransactionCardProps {
  id: string;
  type: 'deposit' | 'withdraw' | 'payment' | 'refund';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  date: string;
  description?: string;
  className?: string;
}

const typeIcons = {
  deposit: 'arrow_downward',
  withdraw: 'arrow_upward',
  payment: 'shopping_cart',
  refund: 'replay',
};

const statusColors = {
  pending: 'text-yellow-400',
  completed: 'text-green-400',
  failed: 'text-red-400',
};

const statusLabels = {
  pending: 'Pendiente',
  completed: 'Completado',
  failed: 'Fallido',
};

export const TransactionCard: React.FC<TransactionCardProps> = ({
  type,
  amount,
  currency,
  status,
  date,
  description,
  className = '',
}) => {
  const isPositive = type === 'deposit' || type === 'refund';
  
  return (
    <div className={`glass rounded-xl p-4 transition-all duration-300 hover:bg-white/5 ${className}`}>
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isPositive ? 'bg-green-500/10' : 'bg-red-500/10'
        }`}>
          <span className="material-symbols-outlined text-lg">
            {typeIcons[type]}
          </span>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-white capitalize">
              {type === 'deposit' ? 'Depósito' : type === 'withdraw' ? 'Retiro' : type === 'payment' ? 'Pago' : 'Reembolso'}
            </p>
            <p className={`font-bold ${isPositive ? 'text-green-400' : 'text-white'}`}>
              {isPositive ? '+' : '-'}{amount.toFixed(2)} {currency}
            </p>
          </div>
          
          <div className="flex items-center justify-between gap-2 mt-1">
            <p className="text-xs text-gray-400 truncate">
              {description || date}
            </p>
            <span className={`text-xs font-medium ${statusColors[status]}`}>
              {statusLabels[status]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
