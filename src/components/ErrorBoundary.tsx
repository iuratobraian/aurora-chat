import React, { ReactNode, useState, useCallback, useEffect, useRef } from 'react';
import logger from '../utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  name?: string;
}

// Check if current user is admin (reads from sessionStorage to avoid Convex calls)
function isAdminUser(): boolean {
  try {
    const session = sessionStorage.getItem('ts_session') || localStorage.getItem('ts_session');
    if (!session) return false;
    const parsed = JSON.parse(session);
    const role = parsed?.user?.rol || parsed?.user?.role;
    return role === 'admin' || role === 'ceo' || role === 'programador' || Number(role) >= 5;
  } catch {
    return false;
  }
}

// Global admin error popup (shown once per error)
let globalShowAdminPopup: ((msg: string, name: string) => void) | null = null;

function AdminErrorPopup() {
  const [errors, setErrors] = useState<Array<{ id: number; msg: string; name: string }>>([]);
  const counterRef = useRef(0);

  useEffect(() => {
    globalShowAdminPopup = (msg: string, name: string) => {
      if (!isAdminUser()) return;
      counterRef.current++;
      const id = counterRef.current;
      setErrors(prev => [...prev.slice(-4), { id, msg, name }]); // max 5
      setTimeout(() => {
        setErrors(prev => prev.filter(e => e.id !== id));
      }, 8000);
    };
    return () => { globalShowAdminPopup = null; };
  }, []);

  if (errors.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-[320px]" role="alert">
      {errors.map(e => (
        <div
          key={e.id}
          className="flex items-start gap-2 bg-red-950/90 border border-red-500/40 rounded-xl px-3 py-2 shadow-xl backdrop-blur-md animate-in slide-in-from-bottom-2 duration-300"
        >
          <span className="text-red-400 text-sm mt-0.5">⚠️</span>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-red-300 uppercase tracking-widest truncate">[Admin] {e.name}</p>
            <p className="text-[10px] text-red-200/80 leading-snug line-clamp-2">{e.msg}</p>
          </div>
          <button
            onClick={() => setErrors(prev => prev.filter(err => err.id !== e.id))}
            className="text-red-400/60 hover:text-red-300 text-xs shrink-0"
          >✕</button>
        </div>
      ))}
    </div>
  );
}

// Singleton popup — mount once at app root
export function AdminErrorPopupMount() {
  return <AdminErrorPopup />;
}

export default function ErrorBoundary({ children, fallback, onReset, name }: Props) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const reset = useCallback(() => {
    setHasError(false);
    setError(null);
    onReset?.();
  }, [onReset]);

  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault();
      const msg = event.reason?.message || String(event.reason);
      logger.error(`[${name ?? 'ErrorBoundary'}] Unhandled promise rejection:`, event.reason);
      globalShowAdminPopup?.(msg, name ?? 'Promise');
    };
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  }, [name]);

  if (hasError) {
    // Notify admin via popup, then render fallback (not a blocking page)
    globalShowAdminPopup?.(error?.message || 'Error desconocido', name ?? 'Component');
    // If a custom fallback is provided, use it. Otherwise render nothing (children are gone anyway).
    return fallback != null ? <>{fallback}</> : null;
  }

  return <ErrorBoundaryInner onError={() => setHasError(true)} setError={setError} name={name}>{children}</ErrorBoundaryInner>;
}

interface InnerProps {
  children: ReactNode;
  onError: (value: boolean) => void;
  setError: (e: Error | null) => void;
  name?: string;
}

class ErrorBoundaryInner extends React.Component<InnerProps, { hasError: boolean }> {
  constructor(props: InnerProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error(`[${this.props.name ?? 'ErrorBoundary'}] Caught error:`, error, errorInfo);
    this.props.setError(error);
    this.props.onError(true);
  }

  render() {
    return this.props.children;
  }
}
