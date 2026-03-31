import React from 'react';
import { PaymentStats } from '../../components/admin/PaymentStats';
import { PaymentManagementTable } from '../../components/admin/PaymentManagementTable';

interface AdminPaymentsPageProps {
  payments?: Array<{
    _id: string;
    userId: string;
    provider: string;
    amount: number;
    status: string;
    createdAt: number;
  }>;
  withdrawals?: Array<{
    _id: string;
    userId: string;
    amount: number;
    cbu: string;
    status: string;
    createdAt: number;
  }>;
  stats?: {
    totalDeposits: number;
    totalWithdrawals: number;
    pendingWithdrawals: number;
  };
}

export function AdminPaymentsPage({ 
  payments = [], 
  withdrawals = [],
  stats = { totalDeposits: 0, totalWithdrawals: 0, pendingWithdrawals: 0 }
}: AdminPaymentsPageProps) {
  const handleApprove = async (id: string) => {
    try {
      await fetch('/api/admin/withdrawals/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ withdrawalId: id }),
      });
      window.location.reload();
    } catch (error) {
      console.error('Error approving withdrawal:', error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await fetch('/api/admin/withdrawals/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ withdrawalId: id }),
      });
      window.location.reload();
    } catch (error) {
      console.error('Error rejecting withdrawal:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Gestión de Pagos - Admin</h1>

        <PaymentStats 
          totalDeposits={stats.totalDeposits}
          totalWithdrawals={stats.totalWithdrawals}
          pendingWithdrawals={stats.pendingWithdrawals}
        />

        <div className="mt-8 bg-gray-900/50 rounded-xl p-6 border border-white/10">
          <PaymentManagementTable 
            payments={payments}
            withdrawals={withdrawals}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </div>
      </div>
    </div>
  );
}
