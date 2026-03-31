import React, { ReactNode, useState, useCallback, useEffect } from 'react';
import logger from '../utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  name?: string;
}

interface ErrorInfo {
  error: Error;
  errorInfo: React.ErrorInfo;
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
      logger.error(`[${name ?? 'ErrorBoundary'}] Unhandled promise rejection:`, event.reason);
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  }, [name]);

  if (hasError) {
    return fallback ?? (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-white mb-4">Algo salió mal</h1>
          <p className="text-gray-400 mb-4 text-sm">{error?.message}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={reset}
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors font-bold text-sm"
            >
              Reintentar
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors font-bold text-sm"
            >
              Recargar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <ErrorBoundaryInner onError={() => setHasError(true)} setError={setError} name={name}>{children}</ErrorBoundaryInner>;
}

interface InnerProps {
  children: ReactNode;
  onError: (value: boolean) => void;
  setError: (e: Error | null) => void;
  name?: string;
}

class ErrorBoundaryInner extends React.Component<{ children: ReactNode; onError: (v: boolean) => void; setError: (e: Error | null) => void; name?: string }, { hasError: boolean }> {
  constructor(props: { children: ReactNode; onError: (v: boolean) => void; setError: (e: Error | null) => void; name?: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
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
