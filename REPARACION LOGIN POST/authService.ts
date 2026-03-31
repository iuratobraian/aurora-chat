// src/services/authService.ts
import { ConvexReactClient } from "convex/react";
import { api } from "../../convex/_generated/api";
import bcrypt from "bcrypt";

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
}

export function updateSesion(partial: Partial<UserSession>): void {
  const current = getSesion();
  if (!current) return;
  setSesion({ ...current, ...partial });
}

// ─────────────────────────────────────────────
// HASH DE PASSWORD (en el cliente para no enviar plaintext)
// ─────────────────────────────────────────────
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

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

  const hashedPassword = await hashPassword(data.password);

  try {
    const result = await convex.mutation(api.auth.register, {
      email: data.email.trim().toLowerCase(),
      password: hashedPassword,
      nombre: data.nombre.trim(),
      usuario: data.usuario?.trim(),
      referralCode: data.referralCode,
      phone: data.phone,
      whatsappOptIn: data.whatsappOptIn,
    });

    setSesion(result.user as UserSession);
    return result.user as UserSession;
  } catch (error: any) {
    throw mapAuthError(error);
  }
}

// ─────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────
export async function loginUser(
  convex: ConvexReactClient,
  email: string,
  password: string
): Promise<UserSession> {
  if (!email || !password) {
    throw { code: "MISSING_FIELDS", message: "Completá todos los campos" };
  }

  const hashedPassword = await hashPassword(password);

  try {
    const result = await convex.mutation(api.auth.login, {
      email: email.trim().toLowerCase(),
      password: hashedPassword,
    });

    setSesion(result.user as UserSession);
    return result.user as UserSession;
  } catch (error: any) {
    throw mapAuthError(error);
  }
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
    const fresh = await convex.query(api.auth.getProfile, {
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
  if (msg.includes("RATE_LIMIT")) {
    return { code: "RATE_LIMIT", message: "Demasiados intentos. Esperá unos minutos" };
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
