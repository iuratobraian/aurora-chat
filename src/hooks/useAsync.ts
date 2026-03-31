import { useState, useCallback, useEffect, useRef } from 'react';

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  status: AsyncStatus;
  data: T | null;
  error: Error | null;
}

export interface AsyncReturn<T> extends AsyncState<T> {
  execute: () => Promise<T | undefined>;
  reset: () => void;
}

export function useAsync<T>(asyncFunction: () => Promise<T>): AsyncReturn<T> {
  const [state, setState] = useState<AsyncState<T>>({
    status: 'idle',
    data: null,
    error: null,
  });

  const execute = useCallback(async () => {
    setState({ status: 'loading', data: null, error: null });
    try {
      const data = await asyncFunction();
      setState({ status: 'success', data, error: null });
      return data;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setState({ status: 'error', data: null, error: err });
      return undefined;
    }
  }, [asyncFunction]);

  const reset = useCallback(() => {
    setState({ status: 'idle', data: null, error: null });
  }, []);

  return { ...state, execute, reset };
}

export interface AsyncPaginatedState<T> {
  status: AsyncStatus;
  data: T[];
  error: Error | null;
  hasMore: boolean;
  cursor: string | null;
}

export interface AsyncPaginatedReturn<T> extends AsyncPaginatedState<T> {
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  reset: () => void;
}

export function useAsyncPaginated<T>(
  fetchFunction: (cursor: string | null) => Promise<{ items: T[]; nextCursor: string | null }>,
  initialData: T[] = []
): AsyncPaginatedReturn<T> {
  const [state, setState] = useState<AsyncPaginatedState<T>>({
    status: 'idle',
    data: initialData,
    error: null,
    hasMore: true,
    cursor: null,
  });

  const loadMore = useCallback(async () => {
    if (state.status === 'loading' || !state.hasMore) return;
    
    setState(prev => ({ ...prev, status: 'loading' }));
    try {
      const result = await fetchFunction(state.cursor);
      setState(prev => ({
        status: 'success',
        data: [...prev.data, ...result.items],
        error: null,
        hasMore: result.nextCursor !== null,
        cursor: result.nextCursor,
      }));
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setState(prev => ({ ...prev, status: 'error', error: err }));
    }
  }, [fetchFunction, state.cursor, state.hasMore, state.status]);

  const refresh = useCallback(async () => {
    setState(prev => ({ ...prev, status: 'loading', cursor: null }));
    try {
      const result = await fetchFunction(null);
      setState({
        status: 'success',
        data: result.items,
        error: null,
        hasMore: result.nextCursor !== null,
        cursor: result.nextCursor,
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setState(prev => ({ ...prev, status: 'error', error: err }));
    }
  }, [fetchFunction]);

  const reset = useCallback(() => {
    setState({
      status: 'idle',
      data: initialData,
      error: null,
      hasMore: true,
      cursor: null,
    });
  }, [initialData]);

  return { ...state, loadMore, refresh, reset };
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export function useThrottle<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastUpdated = useRef<number>(Date.now());

  useEffect(() => {
    const now = Date.now();
    if (now - lastUpdated.current >= interval) {
      lastUpdated.current = now;
      setThrottledValue(value);
    } else {
      const timer = setTimeout(() => {
        lastUpdated.current = Date.now();
        setThrottledValue(value);
      }, interval - (now - lastUpdated.current));
      return () => clearTimeout(timer);
    }
  }, [value, interval]);

  return throttledValue;
}

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

export function useToggle(initialValue = false): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState<boolean>(initialValue);
  const toggle = useCallback(() => setValue(v => !v), []);
  return [value, toggle, setValue];
}
