// src/services/authService.ts
import { ConvexReactClient } from "convex/react";
import { api } from "../../convex/_generated/api";
// import { loginWithGoogleOrFallback as circuitBreakerLogin } from "../lib/externalServices";
// Removed bcrypt import for browser compatibility

// ─────────────────────────────────────────────
// HELPER: Obtener IP del cliente
// ─────────────────────────────────────────────
async function getClientIP(): Promise<string | undefined> {
  try {
    // Intentar obtener IP de servicios externos (opcional, puede fallar en localhost)
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    // Fallback: IP desconocida (el servidor usará 'unknown')
    return undefined;
  }
}

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────
export interface UserSession {
  _id: string;
  email: string;
  nombre: string;
  usuario: string;
  avatar: string;
  banner?: string;
  rol: string;
  role: number;
  esPro: boolean;
  esVerificado: boolean;
  xp: number;
  level: number;
  saldo: number;
  badges: string[];
  biografia: string;
  seguidores: string[];
  siguiendo: string[];
  userNumber: number;
  avatarFrame: string | null;
  streakDays: number;
  phone?: string;
  whatsappOptIn?: boolean;
}

export interface AuthError {
  code: string;
  message: string;
}

// ─────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────
const SESSION_KEY = "tradehub_session";
const SESSION_EXPIRY_KEY = "tradehub_session_expiry";
const JWT_ACCESS_KEY = "tradehub_access_token";
const JWT_REFRESH_KEY = "tradehub_refresh_token";
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 días
const BCRYPT_ROUNDS = 10;

// ─────────────────────────────────────────────
// SESIÓN LOCAL
// ─────────────────────────────────────────────
export function getSesion(): UserSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    const expiry = localStorage.getItem(SESSION_EXPIRY_KEY);

    if (!raw || !expiry) return null;

    // Verificar expiración
    if (Date.now() > parseInt(expiry)) {
      clearSesion();
      return null;
    }

    // Extender sesión automáticamente
    extendSession();

    return JSON.parse(raw) as UserSession;
  } catch {
    return null;
  }
}

export function setSesion(user: UserSession): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    localStorage.setItem(
      SESSION_EXPIRY_KEY,
      String(Date.now() + SESSION_DURATION_MS)
    );
  } catch (e) {
    console.error("Error guardando sesión:", e);
  }
}

export function clearSesion(): void {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_EXPIRY_KEY);
  localStorage.removeItem(JWT_ACCESS_KEY);
  localStorage.removeItem(JWT_REFRESH_KEY);
}

export function extendSession(additionalMs = SESSION_DURATION_MS): void {
  try {
    const current = getSesion();
    if (!current) return;

    localStorage.setItem(
      SESSION_EXPIRY_KEY,
      String(Date.now() + additionalMs)
    );
  } catch (e) {
    console.error("Error extending session:", e);
  }
}

/**
 * VERIFICAR Y MANTENER SESIÓN ACTIVA
 * Se llama al inicio de la app para verificar si hay sesión válida
 * y extenderla automáticamente.
 */
export function verifyAndExtendSession(): UserSession | null {
  const session = getSesion();
  
  if (session) {
    // Extender sesión por 30 días más desde ahora
    extendSession(SESSION_DURATION_MS);
    
    // También actualizar sessionManager para consistencia
    try {
      // Usar importación dinámica compatible con Vitest y Navegador
      import('../utils/sessionManager').then(({ saveSessionUser }) => {
        saveSessionUser(session);
      }).catch(e => {
         console.warn("Could not sync with sessionManager in background:", e);
      });
    } catch (e) {
      console.warn("Could not sync with sessionManager:", e);
    }
  }
  
  return session;
}

/**
 * CONVERTIR UserSession A Usuario (con id)
 */
export function sessionToUsuario(session: UserSession): any {
  return {
    ...session,
    id: session._id, // Mapear _id a id para compatibilidad
  };
}

/**
 * ESCUCHAR CAMBIOS DE SESIÓN ENTRE PESTAÑAS
 * Si el usuario hace logout en otra pestaña, cerrar en todas
 */
export function listenToSessionChanges(callback: () => void): () => void {
  const handler = (e: StorageEvent) => {
    if (e.key === SESSION_KEY || e.key === SESSION_EXPIRY_KEY) {
      callback();
    }
  };
  
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}

/**
 * MANTENER SESIÓN ACTIVA MIENTRAS LA PESTAÑA ESTÉ ABIERTA
 * Extiende la sesión cada 5 minutos mientras el usuario esté activo
 */
export function startSessionKeepAlive(): () => void {
  const intervalId = setInterval(() => {
    const session = getSesion();
    if (session) {
      // Extender por 5 minutos si queda menos de 1 hora
      const expiry = parseInt(localStorage.getItem(SESSION_EXPIRY_KEY) || '0');
      const timeLeft = expiry - Date.now();
      
      if (timeLeft < 60 * 60 * 1000) { // Menos de 1 hora
        extendSession(5 * 60 * 1000); // Extender 5 minutos
      }
    }
  }, 60 * 1000); // Check cada minuto
  
  return () => clearInterval(intervalId);
}

export function updateSesion(partial: Partial<UserSession>): void {
  const current = getSesion();
  if (!current) return;
  setSesion({ ...current, ...partial });
}

// Hashing moved to server side (Convex Action) for security and performance

// ─────────────────────────────────────────────
// GOOGLE OAUTH CON FALLBACK (CIRCUIT BREAKER)
// ─────────────────────────────────────────────
/**
 * Login con Google OAuth usando circuit breaker con fallback a email/password
 *
 * @param convex - Convex client
 * @param googleToken - Token de Google OAuth
 * @param fallbackEmail - Email para fallback (opcional)
 * @param fallbackPassword - Password para fallback (opcional)
 * @returns UserSession
 */
// TEMPORARILY DISABLED - externalServices path resolution issue
/*
export async function loginWithGoogleOrFallback(
  convex: ConvexReactClient,
  googleToken: string,
  fallbackEmail?: string,
  fallbackPassword?: string
): Promise<UserSession> {
  try {
    // Intentar login con Google OAuth
    const result = await circuitBreakerLogin(
      googleToken,
      fallbackEmail || '',
      fallbackPassword || '',
      async (token: string) => {
        // Google OAuth login function
        const ip = await getClientIP();
        const response = await fetch('https://accounts.google.com/o/oauth2/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `token=${token}&ip=${ip}`
        }).catch(() => null); // Fallback handled by circuit breaker
        
        if (!response) {
          throw new Error('Google OAuth failed');
        }

        return { user: null }; // Placeholder, real implementation uses Convex action
      },
      async (email: string, password: string) => {
        // Fallback a email/password
        if (!email || !password) {
          throw new Error('Fallback credentials required');
        }
        return await loginUser(convex, email, password);
      }
    );

    return result;
  } catch (error: any) {
    // Si no hay fallback disponible, lanzar error claro
    if (!fallbackEmail || !fallbackPassword) {
      throw {
        code: 'OAUTH_UNAVAILABLE',
        message: 'Google OAuth no está disponible. Por favor usa email/password.'
      };
    }
    throw error;
  }
}
*/

// ─────────────────────────────────────────────
// REGISTRO
// ─────────────────────────────────────────────
export async function registerUser(
  convex: ConvexReactClient,
  data: {
    email: string;
    password: string;
    nombre: string;
    usuario?: string;
    referralCode?: string;
    phone?: string;
    whatsappOptIn?: boolean;
  }
): Promise<UserSession> {
  // Validaciones básicas
  if (!data.email || !data.email.includes("@")) {
    throw { code: "INVALID_EMAIL", message: "Email inválido" };
  }
  if (!data.password || data.password.length < 8) {
    throw {
      code: "WEAK_PASSWORD",
      message: "La contraseña debe tener al menos 8 caracteres",
    };
  }
  if (!data.nombre || data.nombre.trim().length < 2) {
    throw { code: "INVALID_NAME", message: "Nombre demasiado corto" };
  }

  // Obtener IP del cliente para rate limiting
  const ip = await getClientIP();

  try {
    const result = await convex.action(api.authJwt.registerWithJwt, {
      email: data.email.trim().toLowerCase(),
      password: data.password,
      nombre: data.nombre.trim(),
      usuario: data.usuario?.trim(),
      referralCode: data.referralCode,
      phone: data.phone,
      whatsappOptIn: data.whatsappOptIn,
      ip,
    });

    if (result.success && result.tokens) {
      localStorage.setItem(JWT_ACCESS_KEY, result.tokens.accessToken);
      localStorage.setItem(JWT_REFRESH_KEY, result.tokens.refreshToken);
      setSesion(result.user as UserSession);
      
      // Sync with JWT session manager for unified persistence
      try {
        const { saveJwtSession } = await import('../utils/jwtSessionManager');
        saveJwtSession(result.tokens, result.user._id, result.user);
      } catch (e) {
        console.warn('Could not sync with jwtSessionManager:', e);
      }
      
      return result.user as UserSession;
    }
    
    throw new Error("REGISTRATION_FAILED");
  } catch (error: any) {
    // Fallback to standard register if available
    try {
      const result = await convex.action(api.auth.register, {
        email: data.email.trim().toLowerCase(),
        password: data.password,
        nombre: data.nombre.trim(),
        usuario: data.usuario?.trim(),
        referralCode: data.referralCode,
        phone: data.phone,
        whatsappOptIn: data.whatsappOptIn,
        ip,
      });
      setSesion(result.user as UserSession);
      return result.user as UserSession;
    } catch (e) {
      throw mapAuthError(error);
    }
  }
}

// ─────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────
export async function loginUser(
  convex: ConvexReactClient,
  identifier: string,
  password: string
): Promise<UserSession> {
  if (!identifier || !password) {
    throw { code: "MISSING_FIELDS", message: "Completá todos los campos" };
  }

  const ip = await getClientIP();

  try {
    // Attempt JWT login first, it's more secure
    const result = await convex.action(api.authJwt.loginWithJwt, {
      identifier: identifier.trim(),
      password: password,
      ip,
    });

    if (result.success && result.tokens) {
      localStorage.setItem(JWT_ACCESS_KEY, result.tokens.accessToken);
      localStorage.setItem(JWT_REFRESH_KEY, result.tokens.refreshToken);
      setSesion(result.user as UserSession);
      
      // Sync with JWT session manager for unified persistence
      try {
        const { saveJwtSession } = await import('../utils/jwtSessionManager');
        saveJwtSession(result.tokens, result.user._id, result.user);
      } catch (e) {
        console.warn('Could not sync with jwtSessionManager:', e);
      }
      
      return result.user as UserSession;
    }
    
    throw new Error("LOGIN_FAILED");
  } catch (error: any) {
    // If authJwt fails, fallback to standard login if available (as transition)
    try {
      const result = await convex.action(api.auth.login, {
        identifier: identifier.trim(),
        password: password,
        ip,
      });
      setSesion(result.user as UserSession);
      return result.user as UserSession;
    } catch (e) {
      throw mapAuthError(error);
    }
  }
}

/**
 * REFRESH JWT TOKEN
 */
export async function refreshJwtToken(convex: ConvexReactClient): Promise<string | null> {
  const refreshToken = localStorage.getItem(JWT_REFRESH_KEY);
  if (!refreshToken) return null;

  try {
    const result = await convex.action(api.authJwt.refreshAccessToken, {
      refreshToken,
    });

    if (result.success) {
      localStorage.setItem(JWT_ACCESS_KEY, result.accessToken);
      return result.accessToken;
    }
  } catch (err) {
    console.error("Error refreshing JWT:", err);
    clearSesion();
  }
  return null;
}

/**
 * GET ACCESS TOKEN
 */
export function getAccessToken(): string | null {
  return localStorage.getItem(JWT_ACCESS_KEY);
}

// ─────────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────────
export function logoutUser(): void {
  clearSesion();
  // Limpiar cualquier cache de Convex si es necesario
  window.dispatchEvent(new CustomEvent("tradehub:logout"));
}

// ─────────────────────────────────────────────
// REFRESH SESIÓN desde Convex
// ─────────────────────────────────────────────
export async function refreshSession(convex: ConvexReactClient): Promise<UserSession | null> {
  const current = getSesion();
  if (!current) return null;

  try {
    const fresh = await convex.query(api.authInternal.getProfile, {
      userId: current._id as any,
    });

    if (!fresh) {
      clearSesion();
      return null;
    }

    const updated: UserSession = {
      _id: fresh._id,
      email: fresh.email,
      nombre: fresh.nombre,
      usuario: fresh.usuario,
      avatar: fresh.avatar,
      banner: fresh.banner,
      rol: fresh.rol,
      role: fresh.role,
      esPro: fresh.esPro,
      esVerificado: fresh.esVerificado,
      xp: fresh.xp,
      level: fresh.level,
      saldo: fresh.saldo,
      badges: fresh.badges,
      biografia: fresh.biografia,
      seguidores: fresh.seguidores,
      siguiendo: fresh.siguiendo,
      userNumber: fresh.userNumber,
      avatarFrame: fresh.avatarFrame,
      streakDays: fresh.streakDays,
      phone: fresh.phone,
      whatsappOptIn: fresh.whatsappOptIn,
    };

    setSesion(updated);
    return updated;
  } catch {
    return current; // Si falla el refresh, usar lo que hay
  }
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function mapAuthError(error: any): AuthError {
  const msg = error?.message || error?.toString() || "";

  if (msg.includes("EMAIL_ALREADY_EXISTS")) {
    return { code: "EMAIL_ALREADY_EXISTS", message: "Este email ya está registrado" };
  }
  if (msg.includes("INVALID_CREDENTIALS")) {
    return { code: "INVALID_CREDENTIALS", message: "Email o contraseña incorrectos" };
  }
  if (msg.includes("ACCOUNT_BLOCKED")) {
    return { code: "ACCOUNT_BLOCKED", message: "Tu cuenta fue suspendida. Contactá al soporte" };
  }
  if (msg.includes("ACCOUNT_SUSPENDED")) {
    return { code: "ACCOUNT_SUSPENDED", message: "Tu cuenta está suspendida temporalmente" };
  }
  if (msg.includes("DEMASIADOS_INTENTOS") || msg.includes("RATE_LIMIT")) {
    // Extraer tiempo de espera si está disponible
    const match = msg.match(/Intenta en (\d+) minutos/);
    const waitTime = match ? ` Esperá ${match[1]} minutos.` : "";
    return { code: "RATE_LIMIT", message: `Demasiados intentos.${waitTime}` };
  }
  if (msg.includes("DEMASIADOS_INTENTOS_REGISTRO")) {
    const match = msg.match(/Intenta en (\d+) minutos/);
    const waitTime = match ? ` Esperá ${match[1]} minutos.` : "";
    return { code: "RATE_LIMIT_REGISTER", message: `Demasiados registros.${waitTime}` };
  }

  return { code: "UNKNOWN", message: "Ocurrió un error. Intentá de nuevo" };
}

export function isLoggedIn(): boolean {
  return getSesion() !== null;
}

export function hasRole(minRole: number): boolean {
  const session = getSesion();
  if (!session) return false;
  return session.role >= minRole;
}

export function isAdmin(): boolean {
  return hasRole(5);
}

export function isMod(): boolean {
  return hasRole(4);
}

export function isPro(): boolean {
  const session = getSesion();
  return session?.esPro || false;
}
