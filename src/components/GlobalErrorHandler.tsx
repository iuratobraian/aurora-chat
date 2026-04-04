/**
 * GlobalErrorHandler - TradeShare Resilience System
 * 
 * FILOSOFÍA CORE:
 * - La app NUNCA desaparece. Ni un flash de pantalla negra.
 * - Errores = overlay de diagnóstico solo visible para admins
 * - Usuarios normales = ven la app funcionando con contenido skeleton donde falla un módulo
 * - El sistema SIEMPRE está "vivo"
 */

import React, { Component, ReactNode, useCallback, useState, useEffect, useRef } from 'react';
import logger from '../utils/logger';

interface Props {
  children: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  errors: CapturedError[];
}

interface CapturedError {
  id: number;
  error: Error;
  errorInfo: React.ErrorInfo | null;
  timestamp: number;
}

// Session storage key for admin role (read from session without React/Convex)
function readAdminFromSession(): boolean {
  try {
    const raw = sessionStorage.getItem('ts_session') || localStorage.getItem('ts_session');
    if (!raw) return false;
    const s = JSON.parse(raw);
    const role = s?.user?.rol || s?.user?.role;
    return role === 'admin' || role === 'ceo' || Number(role) >= 5;
  } catch {
    return false;
  }
}

let _errorCounter = 0;

// ─── Admin Diagnostic Popup ─────────────────────────────────────────────────

interface DiagnosticProps {
  errors: CapturedError[];
  onDismiss: (id: number) => void;
  onDismissAll: () => void;
}

const AdminDiagnosticPopup: React.FC<DiagnosticProps> = ({ errors, onDismiss, onDismissAll }) => {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  if (errors.length === 0) return null;

  const isAdmin = readAdminFromSession();
  if (!isAdmin) return null;

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-[9998]">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 bg-red-950/95 border border-red-500/50 rounded-full px-3 py-2 shadow-2xl backdrop-blur-md hover:bg-red-900/95 transition-all group"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
          <span className="text-[11px] font-black text-red-300 uppercase tracking-widest">
            {errors.length} Error{errors.length > 1 ? 'es' : ''}
          </span>
          <span className="text-red-400/60 text-xs">▲</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9998] w-[380px] max-h-[480px] flex flex-col rounded-2xl border border-red-500/30 bg-[#0d0810]/95 shadow-2xl shadow-red-900/30 backdrop-blur-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-red-500/20 bg-red-950/40 shrink-0">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
        </span>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-300 flex-1">
          🛡️ Admin · Diagnóstico en Vivo
        </span>
        <span className="text-[10px] text-red-400/50 font-mono">{errors.length} evento{errors.length > 1 ? 's' : ''}</span>
        <button onClick={() => setIsMinimized(true)} className="text-red-400/40 hover:text-red-300 text-xs ml-1" title="Minimizar">▼</button>
        <button onClick={onDismissAll} className="text-red-400/40 hover:text-red-300 text-xs ml-1" title="Cerrar todo">✕</button>
      </div>

      {/* Error list */}
      <div className="flex-1 overflow-y-auto space-y-1 p-2">
        {errors.map((e) => {
          const isExp = expanded === e.id;
          const msg = e.error?.message || 'Error desconocido';
          const time = new Date(e.timestamp).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          const isConvex = msg.includes('CONVEX') || msg.includes('Server Error');
          const isTypeErr = msg.includes('is not a function') || msg.includes('Cannot read');

          return (
            <div
              key={e.id}
              className={`rounded-xl border transition-all ${isExp ? 'border-red-500/40 bg-red-950/30' : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]'}`}
            >
              <button
                className="w-full flex items-start gap-2 px-3 py-2.5 text-left"
                onClick={() => setExpanded(isExp ? null : e.id)}
              >
                <span className="text-base mt-0.5 shrink-0">
                  {isConvex ? '🖥️' : isTypeErr ? '💥' : '⚠️'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-red-200 font-bold leading-snug line-clamp-2">{msg}</p>
                  <p className="text-[10px] text-white/25 mt-0.5 font-mono">{time}</p>
                </div>
                <button
                  onClick={(ev) => { ev.stopPropagation(); onDismiss(e.id); }}
                  className="text-white/20 hover:text-red-400 text-xs shrink-0 mt-0.5"
                >✕</button>
              </button>

              {isExp && (
                <div className="px-3 pb-3 space-y-2">
                  {/* Stack trace */}
                  {e.error?.stack && (
                    <div className="bg-black/40 rounded-lg p-2 max-h-28 overflow-auto">
                      <pre className="text-[9px] text-red-300/70 whitespace-pre-wrap break-all font-mono leading-relaxed">
                        {e.error.stack.slice(0, 600)}
                      </pre>
                    </div>
                  )}
                  {/* Component stack */}
                  {e.errorInfo?.componentStack && (
                    <div className="bg-black/40 rounded-lg p-2 max-h-20 overflow-auto">
                      <p className="text-[9px] text-amber-400/60 font-black uppercase mb-1">Componente</p>
                      <pre className="text-[9px] text-amber-300/50 whitespace-pre-wrap break-all font-mono">
                        {e.errorInfo.componentStack.slice(0, 300)}
                      </pre>
                    </div>
                  )}
                  {/* Quick actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => { navigator.clipboard?.writeText(`${msg}\n\n${e.error?.stack || ''}`); }}
                      className="flex-1 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/80 transition-all"
                    >
                      📋 Copiar
                    </button>
                    <button
                      onClick={() => window.location.reload()}
                      className="flex-1 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg bg-primary/10 hover:bg-primary/20 text-primary/70 hover:text-primary transition-all"
                    >
                      ↻ Recargar
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer hint */}
      <div className="shrink-0 px-4 py-2 border-t border-white/5 flex items-center justify-between">
        <p className="text-[9px] text-white/20">Solo visible para admins · La app sigue operativa</p>
        <div className="flex items-center gap-1">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          <span className="text-[9px] text-emerald-400/60 font-bold uppercase">App Activa</span>
        </div>
      </div>
    </div>
  );
};

// ─── GlobalErrorHandler Class ────────────────────────────────────────────────

export class GlobalErrorHandler extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { errors: [] };
  }

  static getDerivedStateFromError(_error: Error): Partial<State> {
    // CRITICAL: DO NOT hide children. We accumulate errors and show overlay,
    // but the app tree stays rendered underneath.
    return {};
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    _errorCounter++;
    const captured: CapturedError = {
      id: _errorCounter,
      error,
      errorInfo,
      timestamp: Date.now(),
    };
    logger.error('GlobalErrorHandler caught error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
    this.setState(prev => ({ errors: [...prev.errors.slice(-9), captured] }));

    // Auto-dismiss after 30s for non-critical errors
    setTimeout(() => {
      this.setState(prev => ({ errors: prev.errors.filter(e => e.id !== captured.id) }));
    }, 30000);
  }

  dismissError = (id: number) => {
    this.setState(prev => ({ errors: prev.errors.filter(e => e.id !== id) }));
  };

  dismissAll = () => {
    this.setState({ errors: [] });
  };

  render() {
    return (
      <>
        {/* ✅ App ALWAYS renders — never hidden, never replaced */}
        {this.props.children}

        {/* 🛡️ Admin overlay — floating, non-blocking */}
        <AdminDiagnosticPopup
          errors={this.state.errors}
          onDismiss={this.dismissError}
          onDismissAll={this.dismissAll}
        />
      </>
    );
  }
}

export default GlobalErrorHandler;
