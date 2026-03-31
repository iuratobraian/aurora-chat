/**
 * INSTAGRAM DASHBOARD CON DEGRADED MODE (CIRCUIT BREAKER)
 * 
 * Wrapper para InstagramDashboard que muestra degraded mode cuando el servicio está caído.
 */

import React, { useState, useEffect } from 'react';
import { isInstagramAPIAvailable, getInstagramDataOrDegraded } from '../../lib/externalServices';

interface InstagramDashboardWrapperProps {
  userId: string;
  children: React.ReactNode;
}

interface DegradedData {
  followers: number;
  engagement: number;
  posts: any[];
}

const DEGRADED_DATA: DegradedData = {
  followers: 0,
  engagement: 0,
  posts: [],
};

export const InstagramDashboardWrapper: React.FC<InstagramDashboardWrapperProps> = ({
  userId,
  children,
}) => {
  const [isDegraded, setIsDegraded] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    // Checkear disponibilidad cada 10 segundos
    const checkInterval = setInterval(() => {
      const available = isInstagramAPIAvailable();
      setIsAvailable(available);
      setIsDegraded(!available);
    }, 10000);

    return () => clearInterval(checkInterval);
  }, []);

  if (!isAvailable) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Instagram no disponible
            </h3>
            <p className="mt-1 text-sm text-yellow-700">
              El servicio de Instagram está temporalmente no disponible. Mostrando datos en caché.
              Las funciones de publicación están pausadas hasta que el servicio se recupere.
            </p>
          </div>
        </div>
        
        {/* Mostrar dashboard en modo degradado */}
        <div className="mt-4 opacity-50 pointer-events-none">
          {children}
        </div>
        
        <div className="mt-4">
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-yellow-800 hover:text-yellow-600 font-medium"
          >
            Reintentar conexión →
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

/**
 * Hook para obtener datos de Instagram con degraded mode
 */
export function useInstagramData<T>(
  fetchFn: () => Promise<T>,
  degradedData: T,
  key: string
): { data: T; isDegraded: boolean; isLoading: boolean } {
  const [data, setData] = useState<T>(degradedData);
  const [isDegraded, setIsDegraded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getInstagramDataOrDegraded(fetchFn, degradedData);
        setData(result);
        setIsDegraded(false);
      } catch (error) {
        console.warn(`[Instagram] Using degraded data for ${key}`);
        setData(degradedData);
        setIsDegraded(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [fetchFn, degradedData, key]);

  return { data, isDegraded, isLoading };
}

export default InstagramDashboardWrapper;
