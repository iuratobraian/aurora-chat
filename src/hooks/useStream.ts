import { useEffect, useCallback, useRef, useState } from 'react';

export interface StreamConfig {
  pollInterval?: number;
  enabled?: boolean;
}

export function useSignalStream(config: StreamConfig = {}) {
  const { pollInterval = 5000, enabled = true } = config;
  const [lastEventId, setLastEventId] = useState<string | null>(null);
  const [signals, setSignals] = useState<any[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMounted = useRef(true);

  const fetchNewSignals = useCallback(async () => {
    if (!enabled || !isMounted.current) return;
    
    try {
      const response = await fetch(`/api/signals/stream?lastEventId=${lastEventId || '0'}`);
      if (!response.ok) return;
      
      const data = await response.json();
      if (data.signals?.length && isMounted.current) {
        setSignals(prev => [...data.signals, ...prev].slice(0, 100));
        setLastEventId(String(data.timestamp));
      }
    } catch (error) {
      console.error('Signal stream error:', error);
    }
  }, [enabled, lastEventId]);

  useEffect(() => {
    isMounted.current = true;
    
    if (enabled) {
      fetchNewSignals();
      intervalRef.current = setInterval(fetchNewSignals, pollInterval);
    }

    return () => {
      isMounted.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, pollInterval, fetchNewSignals]);

  const clearSignals = useCallback(() => {
    setSignals([]);
    setLastEventId(null);
  }, []);

  return { signals, clearSignals, refresh: fetchNewSignals };
}

export function useNotificationsStream(userId: string | null, config: StreamConfig = {}) {
  const { pollInterval = 10000, enabled = true } = config;
  const [notifications, setNotifications] = useState<any[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!userId || !enabled) return;

    const fetchNotifications = async () => {
      try {
        const response = await fetch(`/api/notifications/stream?userId=${userId}`);
        if (!response.ok) return;
        
        const data = await response.json();
        if (data.notifications?.length) {
          setNotifications(prev => [...data.notifications, ...prev].slice(0, 50));
        }
      } catch (error) {
        console.error('Notification stream error:', error);
      }
    };

    fetchNotifications();
    intervalRef.current = setInterval(fetchNotifications, pollInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [userId, enabled, pollInterval]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return { notifications, clearNotifications };
}

export function useMarketDataStream(pairs: string[], config: StreamConfig = {}) {
  const { pollInterval = 5000, enabled = true } = config;
  const [marketData, setMarketData] = useState<Record<string, any>>({});
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled || pairs.length === 0) return;

    const fetchMarketData = async () => {
      try {
        const response = await fetch('/api/market/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pairs }),
        });
        if (!response.ok) return;
        
        const data = await response.json();
        setMarketData(prev => ({ ...prev, ...data }));
      } catch (error) {
        console.error('Market data stream error:', error);
      }
    };

    fetchMarketData();
    intervalRef.current = setInterval(fetchMarketData, pollInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, pairs.join(','), pollInterval]);

  const getPrice = useCallback((pair: string) => marketData[pair], [marketData]);

  return { marketData, getPrice };
}
