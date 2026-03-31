import React from 'react';

interface Withdrawal {
  _id: string;
  userId: string;
  amount: number;
  cbu: string;
  alias?: string;
  status: string;
  createdAt: number;
  processedAt?: number;
  notes?: string;
}

interface Payment {
  _id: string;
  userId: string;
  provider: string;
  amount: number;
  currency?: string;
  status: string;
  description?: string;
  createdAt: number;
}

interface PaymentManagementTableProps {
  payments?: Payment[];
  withdrawals?: Withdrawal[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

export function PaymentManagementTable({ 
  payments = [], 
  withdrawals = [],
  onApprove,
  onReject 
}: PaymentManagementTableProps) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-white">Depósitos Recientes</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">ID</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Usuario</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Monto</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Proveedor</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Fecha</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Estado</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No hay depósitos registrados
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment._id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4 text-gray-300 text-sm font-mono">
                      {payment._id.slice(0, 8)}...
                    </td>
                    <td className="py-3 px-4 text-white text-sm">
                      {payment.userId.slice(0, 8)}...
                    </td>
                    <td className="py-3 px-4 text-green-400 font-medium">
                      ${payment.amount.toLocaleString('es-AR')}
                    </td>
                    <td className="py-3 px-4 text-gray-300 text-sm capitalize">
                      {payment.provider}
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-sm">
                      {new Date(payment.createdAt).toLocaleDateString('es-AR')}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        payment.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        payment.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 text-white">Retiros Pendientes</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">ID</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Usuario</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Monto</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">CBU/CVU</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Fecha Solicitud</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Estado</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    No hay retiros pendientes
                  </td>
                </tr>
              ) : (
                withdrawals.filter(w => w.status === 'pending').map((withdrawal) => (
                  <tr key={withdrawal._id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4 text-gray-300 text-sm font-mono">
                      {withdrawal._id.slice(0, 8)}...
                    </td>
                    <td className="py-3 px-4 text-white text-sm">
                      {withdrawal.userId.slice(0, 8)}...
                    </td>
                    <td className="py-3 px-4 text-red-400 font-medium">
                      ${withdrawal.amount.toLocaleString('es-AR')}
                    </td>
                    <td className="py-3 px-4 text-gray-300 text-sm font-mono">
                      ****{withdrawal.cbu.slice(-4)}
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-sm">
                      {new Date(withdrawal.createdAt).toLocaleDateString('es-AR')}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                        {withdrawal.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => onApprove?.(withdrawal._id)}
                          className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                          title="Aprobar"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => onReject?.(withdrawal._id)}
                          className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                          title="Rechazar"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
