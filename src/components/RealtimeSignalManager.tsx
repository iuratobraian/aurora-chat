import React, { useEffect } from 'react';
import { useSignalWebSocket } from '../hooks/useSignalWebSocket';
import { useToast } from './ToastProvider';
import { Usuario } from '../types';

interface RealtimeSignalManagerProps {
  usuario: Usuario | null;
  onNavigateToSignals: () => void;
}

export const RealtimeSignalManager: React.FC<RealtimeSignalManagerProps> = ({ 
  usuario, 
  onNavigateToSignals 
}) => {
  const { success, info } = useToast();

  const { isConnected } = useSignalWebSocket({
    enabled: !!usuario && usuario.id !== 'guest',
    userId: usuario?.id,
    onSignalCreated: (signal) => {
      console.log('[SignalManager] New signal received:', signal);
      success(`🚀 NUEVA SEÑAL: ${signal.pair} (${signal.direction.toUpperCase()}) @ ${signal.entryPrice}`);
      
      // We could also show a more detailed notification here if we had a better toast system
    },
    onSignalUpdated: (signal) => {
      info(`🔄 SEÑAL ACTUALIZADA: ${signal.pair}`);
    },
    onSignalClosed: (signal) => {
      info(`🏁 SEÑAL CERRADA: ${signal.pair} - Resultado: ${signal.resultado > 0 ? 'Profit ✅' : 'Loss ❌'}`);
    },
    onConnected: () => {
      console.log('[SignalManager] Connected to Realtime Bridge');
    },
    onDisconnected: () => {
      console.log('[SignalManager] Disconnected from Realtime Bridge');
    }
  });

  // Log connection status in dev
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log(`[SignalManager] WebSocket Status: ${isConnected ? 'Connected' : 'Disconnected'}`);
    }
  }, [isConnected]);

  return null; // This component handles side effects only
};
