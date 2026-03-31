/**
 * Unified Session Persistence Service
 * 
 * Single source of truth for session management.
 * Replaces the fragmented localStorage-based session systems.
 * 
 * Priority order for session restore:
 * 1. JWT session (valid access token or refreshable)
 * 2. Legacy tradehub_session (authBase.ts)
 * 3. Legacy local_session (sessionManager.ts)
 * 
 * All sessions are validated against Convex before being considered valid.
 */

import { ConvexReactClient } from 'convex/react';
import { api } from '../../convex/_generated/api';
import {
  getJwtSession,
  clearJwtSession,
  getJwtUser,
  isAccessTokenExpired,
  isRefreshTokenExpired,
  saveJwtSession,
  updateAccessToken as updateJwtAccessToken,
} from '../../utils/jwtSessionManager';
import {
  getSesion,
  setSesion,
  clearSesion,
  UserSession,
} from '../authBase';
import {
  getSessionUser,
  clearSession as clearSecureSession,
  isSessionExpired,
  saveSessionUser,
} from '../../utils/sessionManager';
import logger from '../../../lib/utils/logger';

const REFRESH_TOKEN_STORAGE_KEY = 'tradehub_refresh_token';

async function restoreJwtSession(convex: ConvexReactClient): Promise<UserSession | null> {
  const jwtSession = getJwtSession();
  
  if (!jwtSession) {
    return null;
  }

  if (isRefreshTokenExpired()) {
    logger.info('[SessionPersistence] JWT refresh token expired, clearing session');
    clearJwtSession();
    return null;
  }

  if (isAccessTokenExpired() || (jwtSession.expiresAt - Date.now()) < 5 * 60 * 1000) {
    const refreshed = await refreshJwtAccessToken(convex);
    if (!refreshed) {
      logger.warn('[SessionPersistence] JWT token refresh failed');
      clearJwtSession();
      return null;
    }
  }

  const cachedUser = getJwtUser();
  if (!cachedUser) {
    clearJwtSession();
    return null;
  }

  const userId = jwtSession.userId;
  
  try {
    const profile = await convex.query(api.authInternal.getProfile, {
      userId: userId as any,
    });

    if (!profile) {
      logger.warn('[SessionPersistence] User not found in Convex, clearing stale session');
      clearJwtSession();
      return null;
    }

    if ((profile as any).isBlocked) {
      logger.warn('[SessionPersistence] User is blocked, clearing session');
      clearJwtSession();
      return null;
    }

    const userSession: UserSession = {
      _id: profile._id,
      email: profile.email,
      nombre: profile.nombre,
      usuario: profile.usuario,
      avatar: profile.avatar,
      banner: profile.banner,
      rol: profile.rol,
      role: profile.role,
      esPro: profile.esPro,
      esVerificado: profile.esVerificado,
      xp: profile.xp,
      level: profile.level,
      saldo: profile.saldo,
      badges: profile.badges,
      biografia: profile.biografia,
      seguidores: profile.seguidores,
      siguiendo: profile.siguiendo,
      userNumber: profile.userNumber,
      avatarFrame: profile.avatarFrame,
      streakDays: profile.streakDays,
      phone: profile.phone,
      whatsappOptIn: profile.whatsappOptIn,
    };

    setSesion(userSession);

    return userSession;
  } catch (error) {
    logger.error('[SessionPersistence] Convex validation failed:', error);
    return null;
  }
}

async function refreshJwtAccessToken(convex: ConvexReactClient): Promise<boolean> {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
  
  if (!refreshToken) {
    logger.warn('[SessionPersistence] No refresh token in storage');
    return false;
  }

  try {
    const result = await convex.action(api.authJwt.refreshAccessToken, {
      refreshToken,
    });

    if (result.success && result.accessToken) {
      localStorage.setItem('tradehub_access_token', result.accessToken);
      updateJwtAccessToken(result.accessToken, result.expiresIn);
      logger.info('[SessionPersistence] JWT token refreshed successfully');
      return true;
    }

    logger.warn('[SessionPersistence] Token refresh returned failure');
    return false;
  } catch (error) {
    logger.error('[SessionPersistence] Token refresh error:', error);
    return false;
  }
}

async function restoreLegacySession(convex: ConvexReactClient): Promise<UserSession | null> {
  const legacySession = getSesion();
  
  if (!legacySession) {
    return null;
  }

  try {
    const profile = await convex.query(api.authInternal.getProfile, {
      userId: legacySession._id as any,
    });

    if (!profile) {
      logger.warn('[SessionPersistence] Legacy session user not found in Convex');
      clearSesion();
      return null;
    }

    if ((profile as any).isBlocked) {
      logger.warn('[SessionPersistence] Legacy session user is blocked');
      clearSesion();
      return null;
    }

    const updatedSession: UserSession = {
      _id: profile._id,
      email: profile.email,
      nombre: profile.nombre,
      usuario: profile.usuario,
      avatar: profile.avatar,
      banner: profile.banner,
      rol: profile.rol,
      role: profile.role,
      esPro: profile.esPro,
      esVerificado: profile.esVerificado,
      xp: profile.xp,
      level: profile.level,
      saldo: profile.saldo,
      badges: profile.badges,
      biografia: profile.biografia,
      seguidores: profile.seguidores,
      siguiendo: profile.siguiendo,
      userNumber: profile.userNumber,
      avatarFrame: profile.avatarFrame,
      streakDays: profile.streakDays,
      phone: profile.phone,
      whatsappOptIn: profile.whatsappOptIn,
    };

    setSesion(updatedSession);
    return updatedSession;
  } catch (error) {
    logger.error('[SessionPersistence] Legacy session Convex validation failed:', error);
    return null;
  }
}

async function restoreOldestSession(convex: ConvexReactClient): Promise<UserSession | null> {
  if (isSessionExpired()) {
    clearSecureSession();
    return null;
  }

  const user = getSessionUser();
  if (!user || !user.id) {
    return null;
  }

  try {
    const profile = await convex.query(api.authInternal.getProfile, {
      userId: user.id as any,
    });

    if (!profile) {
      clearSecureSession();
      return null;
    }

    if ((profile as any).isBlocked) {
      clearSecureSession();
      return null;
    }

    const userSession: UserSession = {
      _id: profile._id,
      email: profile.email,
      nombre: profile.nombre,
      usuario: profile.usuario,
      avatar: profile.avatar,
      banner: profile.banner,
      rol: profile.rol,
      role: profile.role,
      esPro: profile.esPro,
      esVerificado: profile.esVerificado,
      xp: profile.xp,
      level: profile.level,
      saldo: profile.saldo,
      badges: profile.badges,
      biografia: profile.biografia,
      seguidores: profile.seguidores,
      siguiendo: profile.siguiendo,
      userNumber: profile.userNumber,
      avatarFrame: profile.avatarFrame,
      streakDays: profile.streakDays,
      phone: profile.phone,
      whatsappOptIn: profile.whatsappOptIn,
    };

    setSesion(userSession);
    return userSession;
  } catch (error) {
    logger.error('[SessionPersistence] Oldest session Convex validation failed:', error);
    return null;
  }
}

export function clearAllSessions(): void {
  clearJwtSession();
  clearSesion();
  clearSecureSession();
  localStorage.removeItem('tradehub_access_token');
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  localStorage.removeItem('jwt_user');
  logger.info('[SessionPersistence] All sessions cleared');
}

export async function restoreSessionWithValidation(
  convex: ConvexReactClient
): Promise<UserSession | null> {
  const jwtUser = await restoreJwtSession(convex);
  if (jwtUser) {
    logger.info('[SessionPersistence] JWT session restored and validated');
    return jwtUser;
  }

  const legacyUser = await restoreLegacySession(convex);
  if (legacyUser) {
    logger.info('[SessionPersistence] Legacy session restored and validated');
    return legacyUser;
  }

  const oldestUser = await restoreOldestSession(convex);
  if (oldestUser) {
    logger.info('[SessionPersistence] Oldest session restored and validated');
    return oldestUser;
  }

  logger.info('[SessionPersistence] No valid session found');
  return null;
}

export function saveAuthenticatedSession(
  user: UserSession,
  tokens?: { accessToken: string; refreshToken: string; expiresIn: number; tokenType: string }
): void {
  setSesion(user);

  if (tokens) {
    saveJwtSession(tokens, user._id, user);
    localStorage.setItem('tradehub_access_token', tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokens.refreshToken);
  }

  saveSessionUser(user);

  logger.info('[SessionPersistence] Session saved across all storage systems');
}
