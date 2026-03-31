import React, { useState } from 'react';
import { UserWallet } from '../components/payments/UserWallet';
import { WithdrawForm } from '../components/payments/WithdrawForm';
import { DepositForm } from './payments/DepositForm';

interface PaymentsPageProps {
  userId: string;
  email: string;
  currentBalance: number;
  payments?: Array<{
    _id: string;
    amount: number;
    description?: string;
    status: string;
    createdAt: number;
  }>;
}

export function PaymentsPage({ 
  userId, 
  email, 
  currentBalance = 0, 
  payments = [] 
}: PaymentsPageProps) {
  const [activeTab, setActiveTab] = useState<'wallet' | 'deposit' | 'withdraw'>('wallet');

  const handleDepositSuccess = () => {
    window.location.reload();
  };

  const handleWithdrawSuccess = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Gestión de Pagos</h1>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="flex gap-2 border-b border-white/10 pb-2">
              <button
                onClick={() => setActiveTab('wallet')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'wallet' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Mi Billetera
              </button>
              <button
                onClick={() => setActiveTab('deposit')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'deposit' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Depositar
              </button>
              <button
                onClick={() => setActiveTab('withdraw')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'withdraw' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Retirar
              </button>
            </div>

            <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
              {activeTab === 'wallet' && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold mb-2">Tu Billetera</h2>
                  <p className="text-gray-400 mb-6">Gestiona tus fondos y能看到 tu historial de transacciones</p>
                  <div className="text-4xl font-bold text-green-400 mb-6">
                    ${currentBalance.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => setActiveTab('deposit')}
                      className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-medium transition-colors"
                    >
                      Depositar
                    </button>
                    <button
                      onClick={() => setActiveTab('withdraw')}
                      disabled={currentBalance <= 0}
                      className="border border-white/20 text-gray-300 hover:bg-white/5 py-2 px-6 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      Retirar
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'deposit' && (
                <DepositForm 
                  userId={userId}
                  email={email}
                  onSuccess={handleDepositSuccess}
                />
              )}

              {activeTab === 'withdraw' && (
                <WithdrawForm 
                  userId={userId}
                  currentBalance={currentBalance}
                  onSuccess={handleWithdrawSuccess}
                />
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-900/50 rounded-xl p-4 border border-white/10">
              <h3 className="font-semibold text-sm text-gray-400 mb-3">Acciones Rápidas</h3>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 rounded-lg text-gray-300 hover:bg-white/5 flex items-center gap-2 transition-colors">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Métodos de Pago
                </button>
                <button className="w-full text-left px-3 py-2 rounded-lg text-gray-300 hover:bg-white/5 flex items-center gap-2 transition-colors">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Historial Completo
                </button>
                <button className="w-full text-left px-3 py-2 rounded-lg text-gray-300 hover:bg-white/5 flex items-center gap-2 transition-colors">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Soporte
                </button>
              </div>
            </div>

            {payments.length > 0 && (
              <div className="bg-gray-900/50 rounded-xl p-4 border border-white/10">
                <h3 className="font-semibold text-sm text-gray-400 mb-3">Últimas Transacciones</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {payments.slice(0, 5).map((payment) => (
                    <div key={payment._id} className="flex justify-between items-center p-2 rounded-lg bg-black/20">
                      <div>
                        <p className="text-white text-sm">{payment.description || 'Transacción'}</p>
                        <p className="text-gray-500 text-xs">
                          {new Date(payment.createdAt).toLocaleDateString('es-AR')}
                        </p>
                      </div>
                      <p className={`font-medium ${
                        payment.status === 'completed' ? 'text-green-400' :
                        payment.status === 'pending' ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        ${payment.amount?.toLocaleString('es-AR')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
