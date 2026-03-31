import React, { ReactNode, lazy, Suspense } from 'react';
import ErrorBoundary from './ErrorBoundary';

interface SafeWidgetProps {
  children: ReactNode;
  name?: string;
  skeleton?: ReactNode;
}

export function SafeWidget({ children, name, skeleton }: SafeWidgetProps) {
  return (
    <ErrorBoundary name={name ?? 'widget'} fallback={null}>
      {children}
    </ErrorBoundary>
  );
}

export function SafeLazyWidget<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  { name, fallback }: { name?: string; fallback?: ReactNode }
) {
  const Component = lazy(importFn);
  return function SafeLazyWidgetInner(props: React.ComponentProps<T>) {
    return (
      <ErrorBoundary name={name ?? 'lazy-widget'} fallback={fallback ?? null}>
        <Suspense fallback={fallback ?? null}>
          <Component {...props} />
        </Suspense>
      </ErrorBoundary>
    );
  };
}
