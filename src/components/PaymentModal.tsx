import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { SUBSCRIPTION_PLANS, COURSE_PRICES, COURSE_DETAILS, PlanType, CourseType } from '../services/storage';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  email: string;
  type: 'subscription' | 'course' | 'deposit';
  itemId?: string;
  itemName?: string;
  depositAmount?: number;
  onSuccess?: (transactionId: string) => void;
  onError?: (error: string) => void;
}

type PaymentMethod = 'mercadopago' | 'zenobank';

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  userId,
  email,
  type,
  itemId,
  itemName,
  depositAmount,
  onSuccess,
  onError,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('mercadopago');
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('pro');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMercadoPagoPreference = useMutation(api.paymentOrchestrator.createMercadoPagoPreference);
  const createZenobankPayment = useMutation(api.paymentOrchestrator.createZenobankPayment);

  if (!isOpen) return null;

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let amount = 0;
      let description = '';

      if (type === 'subscription') {
        const plan = SUBSCRIPTION_PLANS[selectedPlan];
        amount = plan.price;
        description = `TradeHub ${plan.name}`;
      } else if (type === 'course' && itemId) {
        amount = COURSE_PRICES[itemId as CourseType] || 0;
        description = COURSE_DETAILS[itemId as CourseType]?.name || itemName || 'Course';
      } else if (type === 'deposit') {
        amount = depositAmount || 0;
        description = 'Depósito de Saldo - TradeShare';
      }

      if (selectedMethod === 'mercadopago') {
        const result = await createMercadoPagoPreference({
          userId,
          amount,
          description,
          plan: type === 'subscription' ? selectedPlan : undefined,
          courseId: type === 'course' ? itemId : undefined,
          paymentType: type,
          email,
          billingCycle: type === 'subscription' ? billingCycle : undefined,
        });

        if (result.init_point) {
          window.location.href = result.init_point;
        } else {
          throw new Error('No se pudo generar el link de pago');
        }
      } else {
        const result = await createZenobankPayment({
          userId,
          amount,
          currency: 'USDT',
          email,
          description,
        });

        if (result.success && result.paymentUrl) {
          window.location.href = result.paymentUrl;
        } else {
          throw new Error(result.error || 'No se pudo generar el link de pago');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error al procesar el pago');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl w-full max-w-lg mx-4 p-6 shadow-2xl border border-gray-800">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-gradient-to-br from-primary via-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-105 transition-all duration-300 overflow-hidden">
              <img src="/logo.svg" alt="TradeHub" className="w-full h-full object-cover scale-110" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              {type === 'subscription' ? 'Suscribirse' : type === 'deposit' ? 'Recargar Saldo' : 'Comprar Curso'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {type === 'subscription' && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Ciclo de facturación</h3>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`flex-1 py-2 rounded-lg border-2 transition-all ${
                  billingCycle === 'monthly'
                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                    : 'border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                <span className="font-bold">Mensual</span>
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`flex-1 py-2 rounded-lg border-2 transition-all ${
                  billingCycle === 'yearly'
                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                    : 'border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                <span className="font-bold">Anual</span>
                <span className="block text-xs text-emerald-400">Ahorra 20%</span>
              </button>
            </div>
            <h3 className="text-sm font-medium text-gray-400 mb-3">Selecciona tu plan</h3>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(SUBSCRIPTION_PLANS) as PlanType[]).map((planKey) => {
                const plan = SUBSCRIPTION_PLANS[planKey];
                if (planKey === 'free') return null;
                
                const displayPrice = billingCycle === 'yearly' && plan.yearlyPrice 
                  ? Math.round(plan.yearlyPrice / 12) 
                  : plan.price;
                
                return (
                  <button
                    key={planKey}
                    onClick={() => setSelectedPlan(planKey)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedPlan === planKey
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="text-lg font-bold text-white">{plan.name}</div>
                    <div className="text-2xl font-bold text-cyan-400">${displayPrice}</div>
                    <div className="text-xs text-gray-400">/{billingCycle === 'yearly' ? 'mes (anual)' : 'mes'}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {type === 'course' && itemId && (
          <div className="mb-6 p-4 bg-gray-800/50 rounded-xl">
            <h3 className="text-lg font-bold text-white">{COURSE_DETAILS[itemId as CourseType]?.name || itemName}</h3>
            <p className="text-gray-400 text-sm mt-1">{COURSE_DETAILS[itemId as CourseType]?.description}</p>
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
              <span>{COURSE_DETAILS[itemId as CourseType]?.modules} módulos</span>
              <span>•</span>
              <span>{COURSE_DETAILS[itemId as CourseType]?.duration}</span>
            </div>
            <div className="text-3xl font-bold text-cyan-400 mt-3">
              ${COURSE_PRICES[itemId as CourseType] || 0} USD
            </div>
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Método de pago</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSelectedMethod('mercadopago')}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedMethod === 'mercadopago'
                  ? 'border-cyan-500 bg-cyan-500/10'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="text-lg font-bold text-white">MercadoPago</div>
              <div className="text-xs text-gray-400 mt-1">Tarjeta, RapiPago, etc.</div>
            </button>
            <button
              onClick={() => setSelectedMethod('zenobank')}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedMethod === 'zenobank'
                  ? 'border-cyan-500 bg-cyan-500/10'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="text-lg font-bold text-white">Zenobank</div>
              <div className="text-xs text-gray-400 mt-1">USDT, Bitcoin, Ethereum</div>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleCheckout}
          disabled={isLoading}
          className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Procesando...
            </span>
          ) : (
            `Pagar ${type === 'subscription' ? `$${billingCycle === 'yearly' && SUBSCRIPTION_PLANS[selectedPlan].yearlyPrice ? Math.round(SUBSCRIPTION_PLANS[selectedPlan].yearlyPrice! / 12) : SUBSCRIPTION_PLANS[selectedPlan].price}` : type === 'deposit' ? `$${depositAmount}` : `$${itemId ? COURSE_PRICES[itemId as CourseType] : 0}`}`
          )}
        </button>

        <p className="text-center text-xs text-gray-500 mt-4">
          Al proceder, aceptas nuestros términos y condiciones de pago.
        </p>
      </div>
    </div>
  );
};

export default PaymentModal;
