/**
 * useSessionPersistence Hook
 * 
 * Unifies JWT session persistence with automatic refresh,
 * cross-tab synchronization, and keep-alive mechanisms.
 * 
 * Features:
 * - Auto-restore session on page load
 * - Silent JWT refresh before access token expires
 * - Cross-tab logout sync via storage events
 * - Session keep-alive while tab is active
 * - Activity tracking to extend session on user interaction
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ConvexReactClient } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { URLS } from '../config/urls';
import {
  getJwtSession,
  saveJwtSession,
  clearJwtSession,
  getJwtUser,
  isAccessTokenExpired,
  isRefreshTokenExpired,
  updateAccessToken,
} from '../utils/jwtSessionManager';
import {
  getSesion,
  setSesion,
  clearSesion,
  UserSession,
} from '../services/authBase';

interface SessionPersistenceState {
  isAuthenticated: boolean;
  user: UserSession | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
}

interface UseSessionPersistenceOptions {
  onLogout?: () => void;
  onSessionRestored?: (user: UserSession) => void;
  refreshThresholdMs?: number;
  keepAliveIntervalMs?: number;
  activityTimeoutMs?: number;
}

const DEFAULT_REFRESH_THRESHOLD = 5 * 60 * 1000;
const DEFAULT_KEEP_ALIVE_INTERVAL = 60 * 1000;
const DEFAULT_ACTIVITY_TIMEOUT = 15 * 60 * 1000;

let sharedConvex: ConvexReactClient | null = null;
let convexClientRefCount = 0;
function getConvexClient(): ConvexReactClient {
  if (!sharedConvex) {
    const url = URLS.convex;
    if (!url) throw new Error('VITE_CONVEX_URL not configured');
    sharedConvex = new ConvexReactClient(url);
  }
  convexClientRefCount++;
  return sharedConvex;
}
function releaseConvexClient(): void {
  convexClientRefCount--;
  if (convexClientRefCount <= 0 && sharedConvex) {
    sharedConvex = null;
    convexClientRefCount = 0;
  }
}

export function useSessionPersistence({
  onLogout,
  onSessionRestored,
  refreshThresholdMs = DEFAULT_REFRESH_THRESHOLD,
  keepAliveIntervalMs = DEFAULT_KEEP_ALIVE_INTERVAL,
  activityTimeoutMs = DEFAULT_ACTIVITY_TIMEOUT,
}: UseSessionPersistenceOptions): SessionPersistenceState & {
  logout: () => void;
  refreshSession: () => Promise<void>;
} {
  const [state, setState] = useState<SessionPersistenceState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
    isRefreshing: false,
    error: null,
  });

  const lastActivityRef = useRef<number>(Date.now());
  const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const convexRef = useRef<ConvexReactClient | null>(null);
  const cleanupRef = useRef<boolean>(false);

  // Initialize convex client
  useEffect(() => {
    try {
      cleanupRef.current = false;
      convexRef.current = getConvexClient();
    } catch (e) {
      console.error('[SessionPersistence] Failed to init Convex client:', e);
    }
    return () => {
      cleanupRef.current = true;
      releaseConvexClient();
    };
  }, []);

  /**
   * Restore session from localStorage on mount
   */
  const restoreSession = useCallback(async () => {
    if (!convexRef.current) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      // Try JWT session first
      const jwtSession = getJwtSession();
      
      if (jwtSession && !isRefreshTokenExpired()) {
        const user = getJwtUser();
        
        if (user) {
          // If access token is expired or near expiry, refresh it
          if (isAccessTokenExpired() || 
              (jwtSession.expiresAt - Date.now()) < refreshThresholdMs) {
            await refreshJwtTokenSilent();
            return;
          }

          // Session is valid, restore it
          setState({
            isAuthenticated: true,
            user: user as UserSession,
            isLoading: false,
            isRefreshing: false,
            error: null,
          });

          onSessionRestored?.(user as UserSession);
          return;
        }
      }

      // Fallback to legacy session
      const legacySession = getSesion();
      if (legacySession) {
        setState({
          isAuthenticated: true,
          user: legacySession,
          isLoading: false,
          isRefreshing: false,
          error: null,
        });

        onSessionRestored?.(legacySession);
        return;
      }

      // No valid session found
      setState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        isRefreshing: false,
        error: null,
      });
    } catch (error) {
      console.error('[SessionPersistence] Error restoring session:', error);
      setState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        isRefreshing: false,
        error: 'Error al restaurar sesión',
      });
    }
  }, [onSessionRestored, refreshThresholdMs]);

  /**
   * Silent JWT refresh without user interaction
   */
  const refreshJwtTokenSilent = useCallback(async () => {
    if (!convexRef.current) return;

    setState(prev => ({ ...prev, isRefreshing: true }));

    try {
      const refreshToken = localStorage.getItem('tradehub_refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const result = await convexRef.current.action(
        api.authJwt.refreshAccessToken,
        { refreshToken }
      );

      if (result.success && result.accessToken) {
        // Update JWT session manager
        updateAccessToken(result.accessToken, 3600); // 1 hour
        
        // Update standalone token storage
        localStorage.setItem('tradehub_access_token', result.accessToken);

        // Refresh user profile from Convex
        const jwtSession = getJwtSession();
        if (jwtSession) {
          try {
            const freshProfile = await convexRef.current!.query(
              api.authInternal.getProfile,
              { userId: jwtSession.userId as any }
            );

            if (freshProfile) {
              const user: UserSession = {
                _id: freshProfile._id,
                email: freshProfile.email,
                nombre: freshProfile.nombre,
                usuario: freshProfile.usuario,
                avatar: freshProfile.avatar,
                banner: freshProfile.banner,
                rol: freshProfile.rol,
                role: freshProfile.role,
                esPro: freshProfile.esPro,
                esVerificado: freshProfile.esVerificado,
                xp: freshProfile.xp,
                level: freshProfile.level,
                saldo: freshProfile.saldo,
                badges: freshProfile.badges,
                biografia: freshProfile.biografia,
                seguidores: freshProfile.seguidores,
                siguiendo: freshProfile.siguiendo,
                userNumber: freshProfile.userNumber,
                avatarFrame: freshProfile.avatarFrame,
                streakDays: freshProfile.streakDays,
                phone: freshProfile.phone,
                whatsappOptIn: freshProfile.whatsappOptIn,
              };

              // Update user in both storage systems
              localStorage.setItem('jwt_user', JSON.stringify(user));
              setSesion(user);

              setState({
                isAuthenticated: true,
                user,
                isLoading: false,
                isRefreshing: false,
                error: null,
              });

              // Schedule next refresh
              scheduleNextRefresh();
              return;
            }
          } catch (profileError) {
            console.warn('[SessionPersistence] Could not refresh profile, using cached:', profileError);
            // Continue with cached user
          }
        }

        // If we couldn't get fresh profile, use cached
        const cachedUser = getJwtUser();
        if (cachedUser) {
          setState({
            isAuthenticated: true,
            user: cachedUser as UserSession,
            isLoading: false,
            isRefreshing: false,
            error: null,
          });
          scheduleNextRefresh();
          return;
        }
      }

      // Refresh failed
      throw new Error('Token refresh failed');
    } catch (error) {
      console.error('[SessionPersistence] Token refresh failed:', error);
      clearAllSessions();
      setState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        isRefreshing: false,
        error: 'Sesión expirada, por favor inicia sesión nuevamente',
      });
      onLogout?.();
    }
  }, [onLogout]);

  /**
   * Schedule the next automatic token refresh
   */
  const scheduleNextRefresh = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    const jwtSession = getJwtSession();
    if (!jwtSession) return;

    const timeUntilExpiry = jwtSession.expiresAt - Date.now();
    const refreshIn = Math.max(0, timeUntilExpiry - refreshThresholdMs);

    if (refreshIn > 0) {
      refreshTimerRef.current = setTimeout(() => {
        refreshJwtTokenSilent();
      }, refreshIn);
    } else {
      // Refresh immediately if already past threshold
      refreshJwtTokenSilent();
    }
  }, [refreshJwtTokenSilent, refreshThresholdMs]);

  /**
   * Clear all session storage
   */
  const clearAllSessions = useCallback(() => {
    clearJwtSession();
    clearSesion();
    localStorage.removeItem('tradehub_access_token');
    localStorage.removeItem('tradehub_refresh_token');

    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }
    if (keepAliveRef.current) {
      clearInterval(keepAliveRef.current);
    }
  }, []);

  /**
   * Manual logout
   */
  const logout = useCallback(async () => {
    if (convexRef.current) {
      try {
        await convexRef.current.action(api.authJwt.logoutWithJwt, {});
      } catch (error) {
        console.warn('[SessionPersistence] Logout action failed:', error);
      }
    }

    clearAllSessions();
    setState({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      isRefreshing: false,
      error: null,
    });
    onLogout?.();
  }, [clearAllSessions, onLogout]);

  /**
   * Manual session refresh
   */
  const refreshSession = useCallback(async () => {
    await refreshJwtTokenSilent();
  }, [refreshJwtTokenSilent]);

  /**
   * Track user activity to keep session alive
   * Throttled to 1s to prevent excessive updates from scroll/mousemove
   */
  const trackActivity = useCallback(() => {
    const now = Date.now();
    if (now - lastActivityRef.current > 1000) {
      lastActivityRef.current = now;
    }
  }, []);

  /**
   * Setup activity tracking
   */
  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
    
    events.forEach(event => {
      window.addEventListener(event, trackActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, trackActivity);
      });
    };
  }, [trackActivity]);

  /**
   * Setup cross-tab synchronization
   */
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'jwt_session' || e.key === 'tradehub_session') {
        if (!e.newValue) {
          // Session cleared in another tab
          clearAllSessions();
          setState({
            isAuthenticated: false,
            user: null,
            isLoading: false,
            isRefreshing: false,
            error: null,
          });
          onLogout?.();
        } else {
          // Session updated in another tab, sync
          restoreSession();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [clearAllSessions, onLogout, restoreSession]);

  const refreshThresholdRef = useRef(refreshThresholdMs);
  const activityTimeoutRef = useRef(activityTimeoutMs);
  const keepAliveIntervalRef = useRef(keepAliveIntervalMs);

  useEffect(() => {
    refreshThresholdRef.current = refreshThresholdMs;
  }, [refreshThresholdMs]);

  useEffect(() => {
    activityTimeoutRef.current = activityTimeoutMs;
  }, [activityTimeoutMs]);

  useEffect(() => {
    keepAliveIntervalRef.current = keepAliveIntervalMs;
  }, [keepAliveIntervalMs]);

  /**
   * Setup keep-alive interval
   */
  useEffect(() => {
    keepAliveRef.current = setInterval(() => {
      if (cleanupRef.current) return;
      const timeSinceActivity = Date.now() - lastActivityRef.current;

      if (timeSinceActivity < activityTimeoutRef.current) {
        const jwtSession = getJwtSession();
        if (jwtSession) {
          const timeUntilExpiry = jwtSession.expiresAt - Date.now();
          if (timeUntilExpiry < refreshThresholdRef.current) {
            refreshJwtTokenSilent();
          }
        }
      }
    }, keepAliveIntervalRef.current);

    return () => {
      if (keepAliveRef.current) {
        clearInterval(keepAliveRef.current);
        keepAliveRef.current = null;
      }
    };
  }, [refreshJwtTokenSilent]);

  /**
   * Initial session restore
   */
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  /**
   * Cleanup timers on unmount
   */
  useEffect(() => {
    return () => {
      cleanupRef.current = true;
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
      if (keepAliveRef.current) {
        clearInterval(keepAliveRef.current);
        keepAliveRef.current = null;
      }
    };
  }, []);

  return {
    ...state,
    logout,
    refreshSession,
  };
}
