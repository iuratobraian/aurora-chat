/**
 * Admin Error Toast - TSK-100
 * 
 * Corner-positioned error notification visible ONLY to admin users (role >= 5).
 * Regular users never see error toasts - errors are silently handled via fallback.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { eventBus, APP_EVENTS } from '../lib/eventBus';
import { getDegradedServices, resetFallbackState } from '../lib/fallback';

interface ServiceError {
  service: string;
  error: string;
  timestamp: number;
  stack?: string;
}

interface AdminErrorToastProps {
  userRole?: number;
  userRol?: string;
}

const MAX_VISIBLE_ERRORS = 5;

export const AdminErrorToast: React.FC<AdminErrorToastProps> = ({ userRole, userRol }) => {
  const [errors, setErrors] = useState<ServiceError[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const isAdmin = (userRole ?? 0) >= 5 || userRol === 'admin' || userRol === 'ceo';

  useEffect(() => {
    if (!isAdmin) return;

    const handleError = (errorData: ServiceError) => {
      setErrors(prev => [errorData, ...prev].slice(0, MAX_VISIBLE_ERRORS));
      setIsVisible(true);
    };

    eventBus.on(APP_EVENTS.SERVICE_ERROR, handleError);

    return () => {
      eventBus.off(APP_EVENTS.SERVICE_ERROR, handleError);
    };
  }, [isAdmin]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
  }, []);

  const handleClearAll = useCallback(() => {
    setErrors([]);
    resetFallbackState();
    setIsVisible(false);
  }, []);

  const handleToggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  if (!isAdmin || !isVisible || errors.length === 0) {
    return null;
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const timeSinceError = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `hace ${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `hace ${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `hace ${hours}h`;
  };

  return (
    <div
      className="fixed bottom-4 right-4 z-[9999] max-w-sm"
      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
    >
      <div className="bg-red-950/95 backdrop-blur-xl border border-red-500/30 rounded-xl shadow-2xl shadow-red-500/20 overflow-hidden">
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 bg-red-900/50 cursor-pointer select-none"
          onClick={handleToggleExpand}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <span className="text-red-200 text-xs font-semibold uppercase tracking-wider">
              {errors.length} error{errors.length !== 1 ? 'es' : ''}
            </span>
            <span className="text-red-400/60 text-xs">
              {getDegradedServices().length > 0 && `· ${getDegradedServices().length} servicio${getDegradedServices().length !== 1 ? 's' : ''} degradado${getDegradedServices().length !== 1 ? 's' : ''}`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); handleClearAll(); }}
              className="text-red-400/60 hover:text-red-300 text-xs transition-colors"
              title="Limpiar todo"
            >
              Limpiar
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleDismiss(); }}
              className="text-red-400/60 hover:text-red-300 text-xs transition-colors"
              title="Cerrar"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Error List */}
        {isExpanded && (
          <div className="max-h-64 overflow-y-auto">
            {errors.map((err, index) => (
              <div
                key={`${err.service}-${err.timestamp}-${index}`}
                className="px-4 py-2 border-t border-red-800/30 hover:bg-red-900/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-red-300 text-xs font-mono font-semibold">
                    {err.service}
                  </span>
                  <span className="text-red-500/60 text-xs" title={formatTime(err.timestamp)}>
                    {timeSinceError(err.timestamp)}
                  </span>
                </div>
                <p className="text-red-200/80 text-xs leading-relaxed break-words">
                  {err.error}
                </p>
              </div>
            ))}

            {/* Footer */}
            <div className="px-4 py-2 border-t border-red-800/30 bg-red-950/50">
              <p className="text-red-500/50 text-xs">
                Los usuarios no ven estos errores. El sistema usa fallback automático.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminErrorToast;
