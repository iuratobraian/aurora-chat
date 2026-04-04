import type { QueryCtx, MutationCtx } from "../_generated/server";

type AnyCtx = QueryCtx | MutationCtx;

/**
 * SISTEMA DE AUTH CUSTOM - TradeShare no usa Convex Auth oficial.
 * Los usuarios se autentican con sistema propio y sus userId se pasan como argumentos.
 * ctx.auth.getUserIdentity() siempre retorna null con este sistema.
 * 
 * REGLA: Queries NUNCA hacen throw por auth — retornan null/[] defensivamente.
 *        Mutations SÍ pueden hacer throw para rechazar operaciones no autorizadas.
 */

export async function requireUser(ctx: AnyCtx) {
  // Con auth custom, getUserIdentity() siempre es null. No usamos Convex Auth.
  // Esta función se mantiene por compatibilidad pero no debería usarse en queries.
  const identity = await (ctx as MutationCtx).auth.getUserIdentity?.();
  if (!identity) {
    throw new Error("No autorizado: inicia sesión.");
  }
  return identity;
}

/**
 * Versión defensiva de requireAdmin para QUERIES.
 * Verifica por userId pasado como argumento — compatible con auth custom.
 * Retorna true/false en lugar de throw para no crashear el cliente React.
 */
export async function isAdminUser(ctx: AnyCtx, userId?: string): Promise<boolean> {
  if (!userId) return false;
  try {
    const profile = await (ctx as QueryCtx).db
      .query("profiles")
      .withIndex("by_userId", (q: any) => q.eq("userId", userId))
      .first();
    return !!profile && (Number(profile.role) >= 5 || profile.rol === "admin" || profile.rol === "ceo");
  } catch {
    return false;
  }
}

/**
 * requireAdmin para MUTATIONS — puede hacer throw.
 * Acepta userId como argumento (sistema custom) O identity de Convex Auth.
 */
export async function requireAdmin(ctx: AnyCtx, userId?: string): Promise<any> {
  // Ruta 1: userId directo (sistema custom)
  if (userId) {
    const profile = await (ctx as QueryCtx).db
      .query("profiles")
      .withIndex("by_userId", (q: any) => q.eq("userId", userId))
      .first();
    if (!profile || (Number(profile.role) < 5 && profile.rol !== "admin" && profile.rol !== "ceo")) {
      throw new Error("Acceso restringido a administradores.");
    }
    return profile;
  }

  // Ruta 2: Convex Auth (fallback para sistemas futuros)
  try {
    const identity = await (ctx as MutationCtx).auth.getUserIdentity?.();
    if (identity) {
      const profile = await (ctx as QueryCtx).db
        .query("profiles")
        .withIndex("by_userId", (q: any) => q.eq("userId", identity.subject))
        .first();
      if (profile && (Number(profile.role) >= 5 || profile.rol === "admin" || profile.rol === "ceo")) {
        return profile;
      }
    }
  } catch {
    // Convex Auth no disponible — es esperado con auth custom
  }

  throw new Error("Acceso restringido a administradores.");
}

/**
 * assertOwnershipOrAdmin — verifica que el userId sea dueño del recurso O admin.
 * Acepta userId como arg explícito (sistema custom).
 */
export async function assertOwnershipOrAdmin(ctx: AnyCtx, resourceOwnerId: string, requestingUserId?: string): Promise<void> {
  if (requestingUserId) {
    if (requestingUserId === resourceOwnerId) return;
    const isAdmin = await isAdminUser(ctx, requestingUserId);
    if (isAdmin) return;
    throw new Error("No autorizado para operar sobre este recurso.");
  }

  // Fallback: Convex Auth
  try {
    const identity = await requireUser(ctx);
    if (identity.subject === resourceOwnerId) return;
    const isAdmin = await isAdminUser(ctx, identity.subject);
    if (isAdmin) return;
  } catch {
    // no auth
  }

  throw new Error("No autorizado para operar sobre este recurso.");
}
