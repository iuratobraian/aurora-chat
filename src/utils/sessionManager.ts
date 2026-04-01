import { getConvexClient } from '../../lib/convex/client';
import { api } from '../../convex/_generated/api';
import logger from '../../lib/utils/logger';

const SESSION_KEY = 'local_session';
const SESSION_USER_KEY = 'local_session_user';
const SESSION_CACHE_VERSION = 'v2';

interface SessionData {
  token: string;
  userId: string;
  expiresAt: number;
  version: string;
}

let sessionCache: { token: string; userId: string } | null = null;
let userCache: any | null = null;
let validationPromise: Promise<void> | null = null;

function updateCacheFromStorage() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      const session: SessionData = JSON.parse(raw);
      if (Date.now() <= session.expiresAt) {
        sessionCache = { token: session.token, userId: session.userId };
      } else {
        sessionCache = null;
      }
    } else {
      sessionCache = null;
    }

    const userRaw = localStorage.getItem(SESSION_USER_KEY);
    if (userRaw) {
      userCache = JSON.parse(userRaw);
    } else {
      userCache = null;
    }
  } catch {
    sessionCache = null;
    userCache = null;
  }
}

function invalidateCache() {
  sessionCache = null;
  userCache = null;
}

export const saveSession = (token: string, userId: string, expiresIn = 7 * 24 * 60 * 60 * 1000) => {
  const session: SessionData = {
    token,
    userId,
    expiresAt: Date.now() + expiresIn,
    version: SESSION_CACHE_VERSION,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  sessionCache = { token, userId };
};

export const getSession = (): { token: string; userId: string } | null => {
  if (sessionCache) return sessionCache;
  
  updateCacheFromStorage();
  return sessionCache;
};

export const saveSessionUser = (user: any) => {
  const { password, ...safeUser } = user;
  localStorage.setItem(SESSION_USER_KEY, JSON.stringify(safeUser));
  userCache = safeUser;
};

export const getSessionUser = (): any | null => {
  if (userCache) return userCache;
  
  updateCacheFromStorage();
  return userCache;
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_USER_KEY);
  invalidateCache();
};

export const isSessionExpired = (): boolean => {
  const session = getSession();
  if (!session) return true;
  
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return true;

  try {
    const data: SessionData = JSON.parse(raw);
    return Date.now() > data.expiresAt;
  } catch {
    return true;
  }
};

export const extendSession = (additionalMs = 7 * 24 * 60 * 60 * 1000) => {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return false;

  try {
    const session: SessionData = JSON.parse(raw);
    session.expiresAt = Date.now() + additionalMs;
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return true;
  } catch {
    return false;
  }
};

export const validateSessionWithConvex = async (): Promise<{ valid: boolean; profile: any | null }> => {
  const session = getSession();
  if (!session?.userId) {
    return { valid: false, profile: null };
  }

  if (validationPromise) {
    return validationPromise.then(() => ({ valid: !!sessionCache, profile: userCache }));
  }

  validationPromise = (async () => {
    try {
      const convex = getConvexClient();
      if (!convex) {
        logger.warn('[Session] Convex client not available for validation');
        return;
      }

      const profile = await convex.query(api.profiles.getProfile, { userId: session.userId });
      
      if (!profile) {
        logger.warn('[Session] Profile not found in Convex, clearing session');
        clearSession();
        return;
      }

      if ((profile as any).isBlocked) {
        logger.warn('[Session] User is blocked, clearing session');
        clearSession();
        return;
      }

      saveSessionUser(profile);
    } catch (err) {
      logger.error('[Session] Convex validation failed:', err);
    } finally {
      validationPromise = null;
    }
  })();

  await validationPromise;
  return { valid: !!sessionCache, profile: userCache };
};

export const syncSessionToConvex = async (userData: any): Promise<boolean> => {
  try {
    const convex = getConvexClient();
    if (!convex) {
      logger.warn('[Session] Convex client not available for sync');
      return false;
    }

    await convex.mutation(api.profiles.upsertProfile, {
      userId: userData.id,
      nombre: userData.nombre,
      usuario: userData.usuario,
      email: userData.email,
      avatar: userData.avatar,
      esPro: userData.esPro || false,
      esVerificado: userData.esVerificado || false,
      rol: userData.rol || 'user',
      role: userData.role ?? 0,
      xp: userData.xp ?? 0,
      level: userData.level ?? 1,
      seguidores: userData.seguidores || [],
      siguiendo: userData.siguiendo || [],
      aportes: userData.aportes || 0,
      accuracy: userData.accuracy || 50,
      reputation: userData.reputation || 50,
      badges: userData.badges || [],
      estadisticas: userData.estadisticas || {},
      saldo: userData.saldo || 0,
      watchlist: userData.watchlist || ['BTC/USD', 'EUR/USD'],
      watchedClasses: userData.watchedClasses || [],
      progreso: userData.progreso || {},
      fechaRegistro: userData.fechaRegistro || new Date().toISOString(),
      diasActivos: userData.diasActivos || 1,
    });

    return true;
  } catch (err) {
    logger.error('[Session] Failed to sync to Convex:', err);
    return false;
  }
};

updateCacheFromStorage();
