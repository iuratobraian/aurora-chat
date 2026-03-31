import React, { useState } from 'react';

interface WithdrawFormProps {
  userId: string;
  currentBalance: number;
  onSuccess?: (transactionId: string) => void;
  onError?: (error: string) => void;
}

export function WithdrawForm({ userId, currentBalance, onSuccess, onError }: WithdrawFormProps) {
  const [amount, setAmount] = useState('');
  const [cbu, setCbu] = useState('');
  const [alias, setAlias] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const withdrawAmount = parseFloat(amount) || 0;
  const isValidAmount = withdrawAmount > 0 && withdrawAmount <= currentBalance;

  const handleSubmit = async () => {
    if (!isValidAmount || !cbu) return;

    setLoading(true);
    try {
      const response = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          amount: withdrawAmount,
          cbu,
          alias: alias || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al procesar retiro');
      }

      const data = await response.json();
      onSuccess?.(data.transactionId || data.id);
      setAmount('');
      setCbu('');
      setAlias('');
      setShowConfirmation(false);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-400 text-sm">Balance disponible</p>
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <p className="text-2xl font-bold text-green-400">
          ${currentBalance.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-gray-400 text-sm block mb-2">Monto a retirar</label>
          <input
            type="number"
            placeholder="1000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            max={currentBalance}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          {withdrawAmount > currentBalance && (
            <p className="text-red-400 text-xs mt-1">Monto exceeds tu balance disponible</p>
          )}
        </div>

        <div>
          <label className="text-gray-400 text-sm block mb-2">CBU / CVU</label>
          <input
            type="text"
            placeholder="0000000000000000000000"
            value={cbu}
            onChange={(e) => setCbu(e.target.value.replace(/\D/g, '').slice(0, 22))}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <p className="text-gray-500 text-xs mt-1">Debe ser una cuenta bancaria argentina</p>
        </div>

        <div>
          <label className="text-gray-400 text-sm block mb-2">Alias (opcional)</label>
          <input
            type="text"
            placeholder="tu.alias.bancario"
            value={alias}
            onChange={(e) => setAlias(e.target.value.toLowerCase().replace(/[^a-z0-9.]/g, ''))}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {isValidAmount && cbu.length >= 18 && (
          <button
            onClick={() => setShowConfirmation(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
          >
            Continuar
          </button>
        )}

        {showConfirmation && (
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-400 text-sm font-medium mb-2">Confirmar retiro</p>
            <p className="text-gray-300 text-sm">
              Vas a retirar <span className="font-bold text-white">${withdrawAmount.toLocaleString('es-AR')}</span> 
              {' '}a la cuenta <span className="font-bold text-white">{cbu.slice(-4)}</span>
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 border border-white/20 text-gray-300 py-2 px-4 rounded-lg text-sm hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {loading ? 'Procesando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="text-gray-500 text-xs text-center mt-4">
        <p>Los retiros se procesan en 24-48 horas hábiles</p>
        <p>Mínimo: $1.000 | Máximo: $500.000 por operación</p>
      </div>
    </div>
  );
}
