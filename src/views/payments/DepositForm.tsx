import React, { useState } from 'react';
import { PaymentModal } from '../../components/PaymentModal';

interface DepositFormProps {
  userId: string;
  email: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function DepositForm({ userId, email, onSuccess, onError }: DepositFormProps) {
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'mercadopago' | 'bank'>('mercadopago');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const depositAmount = parseFloat(amount) || 0;
  const isValidAmount = depositAmount >= 100;

  const handleDeposit = () => {
    if (!isValidAmount) return;
    setShowPaymentModal(true);
  };

  const handleSuccess = (transactionId: string) => {
    onSuccess?.();
    setShowPaymentModal(false);
    setAmount('');
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <p className="text-gray-400 text-sm">Monto mínimo</p>
          <p className="text-green-400 font-medium">$100 ARS</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-gray-400 text-sm">Monto máximo</p>
          <p className="text-green-400 font-medium">$500.000 ARS</p>
        </div>
      </div>

      <div>
        <label className="text-gray-400 text-sm block mb-2">Monto a depositar</label>
        <input
          type="number"
          placeholder="1000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-lg"
        />
        <div className="flex gap-2 mt-2">
          {[1000, 5000, 10000, 25000].map((quickAmount) => (
            <button
              key={quickAmount}
              onClick={() => setAmount(quickAmount.toString())}
              className="flex-1 py-2 rounded-lg border border-white/10 text-gray-400 text-sm hover:bg-white/5 hover:text-white transition-colors"
            >
              ${quickAmount.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-gray-400 text-sm block mb-2">Método de pago</label>
        <div className="space-y-2">
          <button
            onClick={() => setSelectedMethod('mercadopago')}
            className={`w-full p-3 rounded-lg border flex items-center gap-3 transition-colors ${
              selectedMethod === 'mercadopago'
                ? 'bg-blue-600/20 border-blue-500 text-white'
                : 'border-white/10 text-gray-400 hover:bg-white/5'
            }`}
          >
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <span className="text-blue-400 font-bold text-sm">MP</span>
            </div>
            <div className="text-left">
              <p className="font-medium">MercadoPago</p>
              <p className="text-xs text-gray-500">Instantáneo con tarjeta o efectivo</p>
            </div>
          </button>
          
          <button
            onClick={() => setSelectedMethod('bank')}
            disabled
            className="w-full p-3 rounded-lg border border-white/10 text-gray-500 cursor-not-allowed opacity-50 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-medium">Transferencia Bancaria</p>
              <p className="text-xs text-gray-500">Próximamente</p>
            </div>
          </button>
        </div>
      </div>

      {isValidAmount && selectedMethod === 'mercadopago' && (
        <button
          onClick={handleDeposit}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Continuar con MercadoPago
        </button>
      )}

      {!isValidAmount && amount && (
        <p className="text-yellow-400 text-sm text-center">
          El monto mínimo de depósito es de $100 ARS
        </p>
      )}

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
        <p className="text-blue-400 text-xs">
          <strong>Nota:</strong> Los depósitos se acreditan instantáneamente. 
          Puedes pagar con tarjeta de crédito, débito o en efectivo desde tu cuenta de MercadoPago.
        </p>
      </div>

      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          userId={userId}
          email={email}
          type="subscription"
          itemId="deposit"
          itemName="Depósito en TradePortal"
          onSuccess={handleSuccess}
          onError={onError}
        />
      )}
    </div>
  );
}
