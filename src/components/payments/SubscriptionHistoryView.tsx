import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

interface SubscriptionHistoryViewProps {
  userId: string;
}

export const SubscriptionHistoryView: React.FC<SubscriptionHistoryViewProps> = ({ userId }) => {
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'payments'>('subscriptions');

  const subscriptions = useQuery(api.subscriptions.getUserSubscriptionHistory, { userId }) || [];
  const payments = useQuery(api.paymentOrchestrator.getUserPayments, { userId }) || [];

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      canceled: 'bg-red-500/10 text-red-400 border-red-500/20',
      failed: 'bg-red-500/10 text-red-400 border-red-500/20',
      expired: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
      refunded: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    };
    return styles[status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 overflow-hidden">
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-wider">Historial Financiero</h3>
          <p className="text-[10px] text-gray-500 mt-0.5">Subscripciones y pagos</p>
        </div>
      </div>

      <div className="flex border-b border-white/5">
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'subscriptions'
              ? 'text-primary border-b-2 border-primary bg-primary/5'
              : 'text-gray-500 hover:text-white'
          }`}
        >
          Subscripciones
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'payments'
              ? 'text-primary border-b-2 border-primary bg-primary/5'
              : 'text-gray-500 hover:text-white'
          }`}
        >
          Pagos
        </button>
      </div>

      <div className="p-4 max-h-96 overflow-y-auto">
        {activeTab === 'subscriptions' && (
          <div className="space-y-3">
            {subscriptions.length === 0 ? (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-4xl text-gray-600 mb-2">receipt_long</span>
                <p className="text-sm text-gray-500">No hay subscripciones registradas</p>
              </div>
            ) : (
              subscriptions.map((sub: any) => (
                <div key={sub._id} className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-white capitalize">{sub.plan}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${getStatusBadge(sub.status)}`}>
                      {sub.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500">
                    <div>
                      <span className="uppercase tracking-wider">Proveedor</span>
                      <p className="text-white font-bold">{sub.provider || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="uppercase tracking-wider">Fecha</span>
                      <p className="text-white font-bold">{formatDate(sub.createdAt)}</p>
                    </div>
                    {sub.currentPeriodEnd && (
                      <div>
                        <span className="uppercase tracking-wider">Renovación</span>
                        <p className="text-white font-bold">{formatDate(sub.currentPeriodEnd)}</p>
                      </div>
                    )}
                    {sub.externalReference && (
                      <div>
                        <span className="uppercase tracking-wider">Referencia</span>
                        <p className="text-white font-bold truncate">{sub.externalReference.slice(0, 20)}...</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-3">
            {payments.length === 0 ? (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-4xl text-gray-600 mb-2">payments</span>
                <p className="text-sm text-gray-500">No hay pagos registrados</p>
              </div>
            ) : (
              payments.map((payment: any) => (
                <div key={payment._id} className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-white">{payment.description || 'Pago'}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${getStatusBadge(payment.status)}`}>
                      {payment.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px] text-gray-500">
                    <div>
                      <span className="uppercase tracking-wider">Monto</span>
                      <p className="text-white font-bold">{formatCurrency(payment.amount)}</p>
                    </div>
                    <div>
                      <span className="uppercase tracking-wider">Proveedor</span>
                      <p className="text-white font-bold capitalize">{payment.provider}</p>
                    </div>
                    <div>
                      <span className="uppercase tracking-wider">Fecha</span>
                      <p className="text-white font-bold">{formatDate(payment._creationTime)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionHistoryView;
