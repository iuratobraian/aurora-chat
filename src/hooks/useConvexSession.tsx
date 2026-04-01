import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { getConvexClient } from '../../lib/convex/client';
import { api } from '../../convex/_generated/api';
import { mapConvexProfileToUsuario } from '../services/auth/authService';
import logger from '../../lib/utils/logger';

interface ConvexSession {
  userId: string;
  profile: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface ConvexSessionContextValue extends ConvexSession {
  refresh: () => Promise<void>;
  clear: () => void;
}

const ConvexSessionContext = createContext<ConvexSessionContextValue | null>(null);

const SESSION_CACHE_KEY = 'convex_session_cache';

function getCachedSession(): { userId: string; timestamp: number } | null {
  try {
    const raw = localStorage.getItem(SESSION_CACHE_KEY);
    if (!raw) return null;
    const { userId, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > 7 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(SESSION_CACHE_KEY);
      return null;
    }
    return { userId, timestamp };
  } catch {
    return null;
  }
}

function setCachedSession(userId: string) {
  try {
    localStorage.setItem(SESSION_CACHE_KEY, JSON.stringify({ userId, timestamp: Date.now() }));
  } catch {
    // Silently fail - cache is optional
  }
}

function clearCachedSession() {
  try {
    localStorage.removeItem(SESSION_CACHE_KEY);
  } catch {
    // Silently fail
  }
}

export function ConvexSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<ConvexSession>({
    userId: '',
    profile: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  const refresh = useCallback(async () => {
    const convex = getConvexClient();
    if (!convex) {
      setSession((prev) => ({ ...prev, isLoading: false, error: 'Convex client not available' }));
      return;
    }

    try {
      const cached = getCachedSession();
      if (!cached?.userId) {
        setSession({
          userId: '',
          profile: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
        return;
      }

      const status = await convex.query(api.auth.getAuthStatus);
      
      if (!status.authenticated) {
        clearCachedSession();
        setSession({
          userId: '',
          profile: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
        return;
      }

      const profile = await convex.query(api.profiles.getProfile, { userId: cached.userId });
      
      if (!profile || (profile as any).isBlocked) {
        clearCachedSession();
        setSession({
          userId: '',
          profile: null,
          isAuthenticated: false,
          isLoading: false,
          error: (profile as any)?.isBlocked ? 'Cuenta bloqueada' : null,
        });
        return;
      }

      const user = mapConvexProfileToUsuario(profile);
      setCachedSession(user.id);

      setSession({
        userId: user.id,
        profile,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      logger.error('[ConvexSession] Error refreshing session:', err);
      setSession((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Session refresh failed',
      }));
    }
  }, []);

  const clear = useCallback(() => {
    clearCachedSession();
    setSession({
      userId: '',
      profile: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <ConvexSessionContext.Provider value={{ ...session, refresh, clear }}>
      {children}
    </ConvexSessionContext.Provider>
  );
}

export function useConvexSession(): ConvexSessionContextValue {
  const context = useContext(ConvexSessionContext);
  if (!context) {
    throw new Error('useConvexSession must be used within ConvexSessionProvider');
  }
  return context;
}
