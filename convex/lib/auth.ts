import type { MutationCtx } from "../_generated/server";

/**
 * Obtiene la identidad del usuario. Lanza si no hay sesión válida.
 */
export async function requireUser(ctx: MutationCtx) {
  const identity = await ctx.auth.getUserIdentity?.();
  if (!identity) {
    throw new Error("No autorizado: inicia sesión.");
  }
  return identity;
}

/**
 * Valida que el `userId` proporcionado corresponda al sujeto autenticado,
 * salvo que el usuario tenga rol de admin (role >=5).
 */
export async function assertOwnershipOrAdmin(ctx: any, userId: string) {
  const identity = await requireUser(ctx);
  if (identity.subject === userId) return;

  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_userId", (q: any) => q.eq("userId", identity.subject))
    .first();

  if (!profile || (profile.role || 0) < 5) {
    throw new Error("No autorizado para operar sobre este recurso.");
  }
}

export async function requireAdmin(ctx: any) {
  const identity = await requireUser(ctx);
  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_userId", (q: any) => q.eq("userId", identity.subject))
    .first();
  if (!profile || (profile.role || 0) < 5) {
    throw new Error("Acceso restringido a administradores.");
  }
  return profile;
}
