import React, { useState } from 'react';
import { PaymentStats } from '../../components/admin/PaymentStats';

interface PaymentRecord {
  _id: string;
  userId: string;
  provider: string;
  amount: number;
  currency: string;
  status: string;
  externalReference?: string;
  description?: string;
  createdAt: number;
  updatedAt?: number;
}

interface SubscriptionRecord {
  _id: string;
  userId: string;
  plan: string;
  status: string;
  currentPeriodStart?: number;
  currentPeriodEnd?: number;
  createdAt: number;
}

interface CreditRecord {
  _id: string;
  userId: string;
  credits: number;
  lastUpdated: number;
}

interface MercadoPagoAdminPanelProps {
  payments?: PaymentRecord[];
  subscriptions?: SubscriptionRecord[];
  credits?: CreditRecord[];
  stats?: {
    totalDeposits: number;
    totalWithdrawals: number;
    activeSubscriptions: number;
    pendingPayments: number;
  };
}

export function MercadoPagoAdminPanel({
  payments = [],
  subscriptions = [],
  credits = [],
  stats = { totalDeposits: 0, totalWithdrawals: 0, activeSubscriptions: 0, pendingPayments: 0 }
}: MercadoPagoAdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'subscriptions' | 'credits'>('overview');

  const formatDate = (timestamp: number) => new Date(timestamp).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const formatAmount = (amount: number, currency: string = 'ARS') => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      approved: 'bg-green-500/20 text-green-400',
      completed: 'bg-green-500/20 text-green-400',
      active: 'bg-green-500/20 text-green-400',
      pending: 'bg-yellow-500/20 text-yellow-400',
      rejected: 'bg-red-500/20 text-red-400',
      failed: 'bg-red-500/20 text-red-400',
      canceled: 'bg-red-500/20 text-red-400',
      expired: 'bg-gray-500/20 text-gray-400',
    };
    return styles[status] || 'bg-gray-500/20 text-gray-400';
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <span className="text-4xl">💳</span>
            MercadoPago Admin
          </h1>
          <p className="text-gray-400 mt-2">Panel de gestión de pagos y suscripciones</p>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 rounded-xl p-4 border border-green-500/30">
            <p className="text-green-400 text-sm">Ingresos Totales</p>
            <p className="text-2xl font-bold">{formatAmount(stats.totalDeposits)}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 rounded-xl p-4 border border-blue-500/30">
            <p className="text-blue-400 text-sm">Suscripciones Activas</p>
            <p className="text-2xl font-bold">{stats.activeSubscriptions}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/30 rounded-xl p-4 border border-yellow-500/30">
            <p className="text-yellow-400 text-sm">Pagos Pendientes</p>
            <p className="text-2xl font-bold">{stats.pendingPayments}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 rounded-xl p-4 border border-purple-500/30">
            <p className="text-purple-400 text-sm">Total Transacciones</p>
            <p className="text-2xl font-bold">{payments.length + subscriptions.length}</p>
          </div>
        </div>

        <div className="flex gap-2 border-b border-white/10 pb-2 mb-6">
          {(['overview', 'payments', 'subscriptions', 'credits'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab === 'overview' ? 'Resumen' : 
               tab === 'payments' ? 'Pagos' :
               tab === 'subscriptions' ? 'Suscripciones' : 'Créditos'}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-bold mb-4">Últimos Pagos</h3>
              <div className="space-y-3">
                {payments.slice(0, 5).map((p) => (
                  <div key={p._id} className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                    <div>
                      <p className="text-white text-sm">{p.description || 'Pago'}</p>
                      <p className="text-gray-500 text-xs">{formatDate(p.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-medium">{formatAmount(p.amount)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded ${getStatusBadge(p.status)}`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))}
                {payments.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No hay pagos registrados</p>
                )}
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-bold mb-4">Suscripciones Recientes</h3>
              <div className="space-y-3">
                {subscriptions.slice(0, 5).map((s) => (
                  <div key={s._id} className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                    <div>
                      <p className="text-white text-sm">{s.plan}</p>
                      <p className="text-gray-500 text-xs">Usuario: {s.userId.slice(0, 8)}...</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white text-sm">{s.status}</p>
                      <span className={`text-xs px-2 py-0.5 rounded ${getStatusBadge(s.status)}`}>
                        {s.status}
                      </span>
                    </div>
                  </div>
                ))}
                {subscriptions.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No hay suscripciones</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="bg-gray-900/50 rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-gray-400 font-medium">Fecha</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Usuario</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Descripción</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Monto</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Estado</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Referencia</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p._id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-4 text-gray-300 text-sm">{formatDate(p.createdAt)}</td>
                      <td className="p-4 text-white text-sm font-mono">{p.userId.slice(0, 12)}...</td>
                      <td className="p-4 text-white text-sm">{p.description || '-'}</td>
                      <td className="p-4 text-green-400 font-medium">{formatAmount(p.amount)}</td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded ${getStatusBadge(p.status)}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500 text-xs font-mono">{p.externalReference?.slice(0, 16)}...</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {payments.length === 0 && (
                <p className="text-gray-500 text-center py-8">No hay pagos registrados</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'subscriptions' && (
          <div className="bg-gray-900/50 rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-gray-400 font-medium">Usuario</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Plan</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Estado</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Inicio</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Vencimiento</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((s) => (
                    <tr key={s._id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-4 text-white text-sm font-mono">{s.userId.slice(0, 12)}...</td>
                      <td className="p-4 text-white font-medium">{s.plan}</td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded ${getStatusBadge(s.status)}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-300 text-sm">
                        {s.currentPeriodStart ? formatDate(s.currentPeriodStart) : '-'}
                      </td>
                      <td className="p-4 text-gray-300 text-sm">
                        {s.currentPeriodEnd ? formatDate(s.currentPeriodEnd) : '-'}
                      </td>
                      <td className="p-4">
                        <button className="text-blue-400 hover:text-blue-300 text-sm">
                          Gestionar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {subscriptions.length === 0 && (
                <p className="text-gray-500 text-center py-8">No hay suscripciones</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'credits' && (
          <div className="bg-gray-900/50 rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-gray-400 font-medium">Usuario</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Créditos</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Última Actualización</th>
                  </tr>
                </thead>
                <tbody>
                  {credits.map((c) => (
                    <tr key={c._id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-4 text-white text-sm font-mono">{c.userId.slice(0, 12)}...</td>
                      <td className="p-4 text-yellow-400 font-bold">{c.credits}</td>
                      <td className="p-4 text-gray-300 text-sm">{formatDate(c.lastUpdated)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {credits.length === 0 && (
                <p className="text-gray-500 text-center py-8">No hay créditos registrados</p>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <h4 className="font-medium text-blue-400 mb-2">💡 Información</h4>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• Los pagos se procesan automáticamente cuando MercadoPago envía el webhook de confirmación</li>
            <li>• Las suscripciones se activan solo después de recibir el pago confirmado</li>
            <li>• Los créditos se agregan al usuario inmediatamente después del pago</li>
            <li>• El panel se actualiza en tiempo real desde la base de datos</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default MercadoPagoAdminPanel;