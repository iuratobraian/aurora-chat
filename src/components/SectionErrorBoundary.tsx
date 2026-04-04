/**
 * SectionErrorBoundary - TradeShare Resilience
 *
 * Política: una sección fallida = skeleton animado + auto-retry silencioso.
 * El usuario nunca ve un mensaje de error. La sección "vuelve" sola.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  sectionName: string;
  fallback?: ReactNode;
  retryInterval?: number;
  maxRetries?: number;
  onError?: (error: Error) => void;
}

interface State {
  hasError: boolean;
  retryCount: number;
}

// Skeleton genérico — imita el layout de una sección sin mostrar errores
const SectionSkeleton = ({ name }: { name: string }) => (
  <div className="w-full animate-pulse space-y-3 py-4" aria-hidden="true" data-section={name}>
    <div className="h-2 bg-white/5 rounded-full w-32" />
    <div className="h-24 bg-white/[0.03] rounded-2xl border border-white/5" />
    <div className="grid grid-cols-2 gap-3">
      <div className="h-16 bg-white/[0.03] rounded-xl border border-white/5" />
      <div className="h-16 bg-white/[0.03] rounded-xl border border-white/5" />
    </div>
    <div className="h-2 bg-white/5 rounded-full w-48" />
  </div>
);

class SectionErrorBoundary extends Component<Props, State> {
  private retryTimeout: ReturnType<typeof setTimeout> | null = null;

  public state: State = { hasError: false, retryCount: 0 };

  public static getDerivedStateFromError(_error: Error): Partial<State> {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { sectionName, onError, retryInterval = 5000, maxRetries = 3 } = this.props;
    console.warn(`[SectionErrorBoundary:${sectionName}] caught:`, error.message);
    onError?.(error);

    // Auto-retry silencioso
    if (this.state.retryCount < maxRetries) {
      this.retryTimeout = setTimeout(() => {
        this.setState(prev => ({ hasError: false, retryCount: prev.retryCount + 1 }));
      }, retryInterval * (this.state.retryCount + 1)); // backoff: 5s, 10s, 15s
    }
  }

  public componentWillUnmount() {
    if (this.retryTimeout) clearTimeout(this.retryTimeout);
  }

  public render() {
    if (this.state.hasError) {
      // Si tiene fallback custom, usarlo (puede ser skeleton especializado)
      if (this.props.fallback) return <>{this.props.fallback}</>;
      // Default: skeleton genérico — nunca texto de error para el usuario
      return <SectionSkeleton name={this.props.sectionName} />;
    }
    return this.props.children;
  }
}

export default SectionErrorBoundary;
