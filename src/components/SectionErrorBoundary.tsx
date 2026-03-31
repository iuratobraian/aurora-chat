/**
 * SectionErrorBoundary
 * 
 * Error boundary for isolating errors to specific sections/views.
 * Automatically retries and shows fallback while preventing entire app crashes.
 */

import React, { Component, ErrorInfo, ReactNode, useState, useEffect } from 'react';
import { Icon } from './icons/Icon';
import { RESILIENCE_CONFIG } from '../config/resilience';

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
  error?: Error;
  retryCount: number;
}

class SectionErrorBoundary extends Component<Props, State> {
  private retryTimeout: NodeJS.Timeout | null = null;

  public state: State = {
    hasError: false,
    retryCount: 0,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, retryCount: 0 };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[SectionErrorBoundary:${this.props.sectionName}]`, error, errorInfo);
    
    if (this.props.onError) {
      this.props.onError(error);
    }

    // Schedule automatic retry
    this.scheduleRetry();
  }

  private scheduleRetry() {
    const { retryInterval = RESILIENCE_CONFIG.RETRY_INTERVAL, maxRetries = RESILIENCE_CONFIG.MAX_RETRIES } = this.props;
    
    if (this.state.retryCount < maxRetries) {
      this.retryTimeout = setTimeout(() => {
        this.setState(prev => ({ retryCount: prev.retryCount + 1 }));
        this.setState({ hasError: false });
      }, retryInterval);
    }
  }

  public componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  private handleManualRetry = () => {
    this.setState({ hasError: false, retryCount: 0 });
  };

  public render() {
    if (this.state.hasError) {
      // Show custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      const timeUntilRetry = Math.ceil(
        (RESILIENCE_CONFIG.RETRY_INTERVAL - (Date.now() % RESILIENCE_CONFIG.RETRY_INTERVAL)) / 1000
      );

      return (
        <div className="flex flex-col items-center justify-center p-8 bg-[#1a1a2e]/50 backdrop-blur-sm rounded-2xl border border-white/10">
          <Icon 
            name="sync_problem" 
            className="text-yellow-400 text-5xl mb-4 animate-pulse" 
          />
          <h3 className="text-white font-bold text-lg mb-2">
            Problemas en esta sección
          </h3>
          <p className="text-gray-400 text-sm text-center mb-4">
            Estamos intentando recuperar los datos...
          </p>
          
          {this.state.retryCount < RESILIENCE_CONFIG.MAX_RETRIES ? (
            <p className="text-xs text-gray-500">
              Reintentando en {timeUntilRetry}s...
            </p>
          ) : (
            <button
              onClick={this.handleManualRetry}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center gap-2"
            >
              <Icon name="refresh" className="text-lg" />
              Reintentar ahora
            </button>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default SectionErrorBoundary;
