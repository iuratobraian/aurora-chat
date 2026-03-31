import React, { Component, ReactNode, useCallback, useState, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import logger from '../utils/logger';

interface ErrorReport {
  errorMessage: string;
  errorStack?: string;
  componentStack?: string;
  pageUrl: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface Props {
  children: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface GlobalErrorModalProps {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  onReport: (report: ErrorReport) => void;
  onGoHome: () => void;
}

const GlobalErrorModal: React.FC<GlobalErrorModalProps> = ({
  error,
  errorInfo,
  onReport,
  onGoHome,
}) => {
  const [reporting, setReporting] = useState(false);
  const [reported, setReported] = useState(false);

  const handleReport = async () => {
    if (!error || reported) return;
    
    setReporting(true);
    try {
      const severity = error.message.includes('auth') || error.message.includes('network')
        ? 'critical'
        : error.message.includes('undefined') || error.message.includes('null')
          ? 'high'
          : 'medium';

      await onReport({
        errorMessage: error.message,
        errorStack: error.stack,
        componentStack: errorInfo?.componentStack,
        pageUrl: window.location.href,
        severity,
      });
      setReported(true);
    } catch (err) {
      logger.error('Failed to report error:', err);
    } finally {
      setReporting(false);
    }
  };

  const getErrorIcon = () => {
    if (!error) return '⚠️';
    const msg = error.message.toLowerCase();
    if (msg.includes('network') || msg.includes('fetch')) return '📡';
    if (msg.includes('auth') || msg.includes('login')) return '🔐';
    if (msg.includes('convex')) return '🖥️';
    if (msg.includes('render')) return '💥';
    return '⚠️';
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-transparent to-purple-900/20" />
      
      <div className="relative glass rounded-3xl p-8 max-w-md mx-4 text-center border border-red-500/20 shadow-2xl shadow-red-500/10">
        <div className="text-7xl mb-6">{getErrorIcon()}</div>
        
        <h1 className="text-2xl font-black text-white mb-3 uppercase tracking-wider">
          ¡Ups! Algo salió mal
        </h1>
        
        <p className="text-white/60 mb-6 text-sm">
          Disculpe las molestias. Ha ocurrido un error inesperado. 
          Nuestro equipo ha sido notificado.
        </p>

        {error && (
          <details className="text-left mb-6 bg-white/5 rounded-xl p-3 max-h-32 overflow-auto">
            <summary className="text-xs text-white/40 cursor-pointer hover:text-white/60">
              Detalles técnicos
            </summary>
            <pre className="text-[10px] text-red-400 mt-2 whitespace-pre-wrap break-all">
              {error.message}
              {'\n\n'}
              {error.stack?.slice(0, 500)}
            </pre>
          </details>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={handleReport}
            disabled={reporting || reported}
            className={`w-full py-3 px-4 rounded-xl font-bold uppercase text-sm tracking-wider transition-all flex items-center justify-center gap-2 ${
              reported
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white'
            }`}
          >
            {reporting ? (
              <>
                <span className="animate-spin">⏳</span>
                Enviando...
              </>
            ) : reported ? (
              <>
                <span>✅</span>
                Equipo notificado
              </>
            ) : (
              <>
                <span>📧</span>
                Notificar al administrador
              </>
            )}
          </button>

          <button
            onClick={onGoHome}
            className="w-full py-3 px-4 rounded-xl font-bold uppercase text-sm tracking-wider bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 transition-all"
          >
            <span className="flex items-center justify-center gap-2">
              <span>🏠</span>
              Volver al inicio
            </span>
          </button>

          <button
            onClick={() => window.location.reload()}
            className="w-full py-2 px-4 text-xs text-white/40 hover:text-white/60 transition-colors"
          >
            O recargar la página
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-white/5">
          <p className="text-[10px] text-white/30">
            Si el problema persiste, contacta a soporte@tradeshare.com
          </p>
        </div>
      </div>
    </div>
  );
};

export class GlobalErrorHandler extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    logger.error('GlobalErrorHandler caught error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorHandlerConsumer
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onGoHome={this.handleGoHome}
        />
      );
    }
    return this.props.children;
  }
}

interface ConsumerProps {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  onGoHome: () => void;
}

const ErrorHandlerConsumer: React.FC<ConsumerProps> = ({ error, errorInfo, onGoHome }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const reportError = useMutation(api.systemErrors.reportError);

  const handleReport = useCallback(async (report: ErrorReport) => {
    try {
      await reportError({
        errorMessage: report.errorMessage,
        errorStack: report.errorStack,
        componentStack: report.componentStack,
        pageUrl: report.pageUrl,
        severity: report.severity,
      });
      logger.info('Error reported successfully');
    } catch (err) {
      logger.error('Failed to report error to admin:', err);
    }
  }, [reportError]);

  if (!mounted) return null;

  return (
    <GlobalErrorModal
      error={error}
      errorInfo={errorInfo}
      onReport={handleReport}
      onGoHome={onGoHome}
    />
  );
};

export default GlobalErrorHandler;
