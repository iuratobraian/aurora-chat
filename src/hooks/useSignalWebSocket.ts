/**
 * useSignalWebSocket Hook
 * 
 * Connects to the Express WebSocket server for real-time signal updates.
 * Listens for signal:create, signal:update, signal:close, signal:delete events.
 * Triggers callbacks to refresh the UI when new signals arrive.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { getSession } from '../utils/sessionManager';

interface SignalWebSocketOptions {
  enabled?: boolean;
  userId?: string;
  onSignalCreated?: (signal: any) => void;
  onSignalUpdated?: (signal: any) => void;
  onSignalClosed?: (signal: any) => void;
  onSignalDeleted?: (signal: any) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: Event) => void;
}

interface SignalWebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  lastMessage: any | null;
  error: string | null;
}

export function useSignalWebSocket({
  enabled = true,
  userId,
  onSignalCreated,
  onSignalUpdated,
  onSignalClosed,
  onSignalDeleted,
  onConnected,
  onDisconnected,
  onError,
}: SignalWebSocketOptions): SignalWebSocketState & {
  reconnect: () => void;
  disconnect: () => void;
} {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const [state, setState] = useState<SignalWebSocketState>({
    isConnected: false,
    isConnecting: false,
    lastMessage: null,
    error: null,
  });

  const getWsUrl = useCallback(() => {
    // In production, the WS server is on the same host/protocol but different port
    // In Vercel it might be the same URL but /ws path or similar, 
    // but our server.ts listens on the port.
    const host = window.location.hostname;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    
    // Explicitly use the backend port (3000 by default in server.ts)
    // or the configured proxy port.
    const wsPort = import.meta.env.VITE_SERVER_PORT || '3000';
    
    // Use token if available for authentication (SEC-010)
    const session = getSession();
    const token = session?.token || '';
    const authParam = token ? `?token=${token}` : '';
    
    if (host === 'localhost' || host === '127.0.0.1') {
      return `${protocol}//${host}:${wsPort}${authParam}`;
    }
    
    // In production, we might use a subdomain or specific path
    // For now, assume same host but backend port
    return `${protocol}//${host}${authParam}`;
  }, []);

  const connect = useCallback(() => {
    if (!enabled || wsRef.current) return;

    setState(prev => ({ ...prev, isConnecting: true }));

    try {
      const wsUrl = getWsUrl();
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setState({
          isConnected: true,
          isConnecting: false,
          lastMessage: null,
          error: null,
        });
        reconnectAttemptsRef.current = 0;
        onConnected?.();

        // Send auth with user ID if available
        if (userId) {
          ws.send(JSON.stringify({ type: 'auth', userId }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setState(prev => ({ ...prev, lastMessage: data }));

          switch (data.type) {
            case 'signal:created':
            case 'signal:create':
              onSignalCreated?.(data.data);
              playNotificationSound();
              break;
            case 'signal:updated':
            case 'signal:update':
              onSignalUpdated?.(data.data);
              break;
            case 'signal:closed':
            case 'signal:close':
              onSignalClosed?.(data.data);
              break;
            case 'signal:deleted':
            case 'signal:delete':
              onSignalDeleted?.(data.data);
              break;
          }
        } catch (e) {
          console.error('[SignalWS] Parse error:', e);
        }
      };

      ws.onclose = () => {
        setState({
          isConnected: false,
          isConnecting: false,
          lastMessage: null,
          error: null,
        });
        wsRef.current = null;
        onDisconnected?.();

        // Attempt reconnection with exponential backoff
        if (enabled && reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          reconnectAttemptsRef.current++;
          
          reconnectTimerRef.current = setTimeout(() => {
            reconnectTimerRef.current = null;
            connect();
          }, delay);
        }
      };

      ws.onerror = (error) => {
        setState(prev => ({
          ...prev,
          error: 'WebSocket connection error',
          isConnecting: false,
        }));
        onError?.(error);
      };

      wsRef.current = ws;
    } catch (error) {
      setState({
        isConnected: false,
        isConnecting: false,
        lastMessage: null,
        error: 'Failed to create WebSocket connection',
      });
      onError?.(error as Event);
    }
  }, [enabled, userId, getWsUrl, onSignalCreated, onSignalUpdated, onSignalClosed, onSignalDeleted, onConnected, onDisconnected, onError]);

  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setState({
      isConnected: false,
      isConnecting: false,
      lastMessage: null,
      error: null,
    });
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttemptsRef.current = 0;
    setTimeout(() => connect(), 500);
  }, [disconnect, connect]);

  const playNotificationSound = useCallback(() => {
    try {
      const audio = new Audio('/sounds/signal-alert.mp3');
      audio.volume = 0.5;
      audio.play().catch(e => console.warn('[SignalWS] Audio play blocked:', e));
    } catch (e) {
      // Ignorar errores de audio
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return {
    ...state,
    reconnect,
    disconnect,
  };
}
