import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type PaymentProvider = 'mercadopago' | 'stripe' | 'paypal' | 'mercadopago_qr' | 'test';

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  provider: PaymentProvider;
  description?: string;
  metadata?: Record<string, string>;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  provider: PaymentProvider;
}

export interface PaymentGatewayConfig {
  provider: PaymentProvider;
  amount: number;
  currency?: string;
  description?: string;
  metadata?: Record<string, string>;
  onSuccess?: (result: PaymentResult) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

interface PaymentGatewayContextType {
  isProcessing: boolean;
  currentPayment: PaymentIntent | null;
  initiatePayment: (config: PaymentGatewayConfig) => Promise<PaymentResult>;
  simulatePayment: (provider: PaymentProvider, amount: number) => Promise<PaymentResult>;
  cancelPayment: () => void;
  resetPayment: () => void;
}

const PaymentGatewayContext = createContext<PaymentGatewayContextType | null>(null);

export const usePaymentGateway = () => {
  const context = useContext(PaymentGatewayContext);
  if (!context) {
    throw new Error('usePaymentGateway debe usarse dentro de PaymentGatewayProvider');
  }
  return context;
};

const generateTransactionId = () => {
  return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const simulatePaymentProcessing = (provider: PaymentProvider, amount: number): Promise<PaymentResult> => {
  return new Promise((resolve) => {
    const processingTime = 1500 + Math.random() * 2000;
    
    setTimeout(() => {
      const success = Math.random() > 0.1;
      
      if (success) {
        resolve({
          success: true,
          transactionId: generateTransactionId(),
          provider,
        });
      } else {
        resolve({
          success: false,
          error: 'La transacción fue declinada. Por favor intenta con otro método de pago.',
          provider,
        });
      }
    }, processingTime);
  });
};

const ProviderLogos: Record<PaymentProvider, { name: string; color: string; icon: string }> = {
  mercadopago: { name: 'MercadoPago', color: 'from-blue-500 to-cyan-500', icon: 'payments' },
  stripe: { name: 'Stripe', color: 'from-violet-500 to-purple-500', icon: 'credit_card' },
  paypal: { name: 'PayPal', color: 'from-blue-600 to-blue-400', icon: 'account_balance_wallet' },
  mercadopago_qr: { name: 'MercadoPago QR', color: 'from-teal-500 to-emerald-500', icon: 'qr_code' },
  test: { name: 'Pago de Prueba', color: 'from-amber-500 to-orange-500', icon: 'science' },
};

export const getProviderInfo = (provider: PaymentProvider) => ProviderLogos[provider];

interface PaymentGatewayProviderProps {
  children: ReactNode;
}

export const PaymentGatewayProvider: React.FC<PaymentGatewayProviderProps> = ({ children }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPayment, setCurrentPayment] = useState<PaymentIntent | null>(null);

  const initiatePayment = useCallback(async (config: PaymentGatewayConfig): Promise<PaymentResult> => {
    setIsProcessing(true);
    
    const paymentIntent: PaymentIntent = {
      id: generateTransactionId(),
      amount: config.amount,
      currency: config.currency || 'USD',
      status: 'processing',
      provider: config.provider,
      description: config.description,
      metadata: config.metadata,
    };
    
    setCurrentPayment(paymentIntent);

    try {
      const result = await simulatePaymentProcessing(config.provider, config.amount);
      
      const finalIntent: PaymentIntent = {
        ...paymentIntent,
        status: result.success ? 'completed' : 'failed',
      };
      setCurrentPayment(finalIntent);

      if (result.success && config.onSuccess) {
        config.onSuccess(result);
      } else if (!result.success && config.onError) {
        config.onError(result.error || 'Error desconocido');
      }

      return result;
    } catch (error) {
      const errorResult: PaymentResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Error al procesar el pago',
        provider: config.provider,
      };
      
      if (config.onError) {
        config.onError(errorResult.error!);
      }
      
      return errorResult;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const simulatePayment = useCallback(async (provider: PaymentProvider, amount: number): Promise<PaymentResult> => {
    return initiatePayment({
      provider,
      amount,
      description: 'Pago simulado',
    });
  }, [initiatePayment]);

  const cancelPayment = useCallback(() => {
    if (currentPayment) {
      setCurrentPayment({
        ...currentPayment,
        status: 'failed',
      });
    }
    setIsProcessing(false);
  }, [currentPayment]);

  const resetPayment = useCallback(() => {
    setCurrentPayment(null);
    setIsProcessing(false);
  }, []);

  return (
    <PaymentGatewayContext.Provider
      value={{
        isProcessing,
        currentPayment,
        initiatePayment,
        simulatePayment,
        cancelPayment,
        resetPayment,
      }}
    >
      {children}
    </PaymentGatewayContext.Provider>
  );
};

export { ProviderLogos };
export default PaymentGatewayProvider;
