import type { QueryCtx, MutationCtx } from "../_generated/server";

type AnyCtx = QueryCtx | MutationCtx;

export async function requireUser(ctx: AnyCtx) {
  const identity = await (ctx as MutationCtx).auth.getUserIdentity?.();
  if (!identity) {
    throw new Error("No autorizado: inicia sesión.");
  }
  return identity;
}

export async function assertOwnershipOrAdmin(ctx: AnyCtx, userId: string) {
  const identity = await requireUser(ctx);
  if (identity.subject === userId) return;

  const profile = await (ctx as QueryCtx).db
    .query("profiles")
    .withIndex("by_userId", (q: any) => q.eq("userId", identity.subject))
    .first();

  if (!profile || (profile.role || 0) < 5) {
    throw new Error("No autorizado para operar sobre este recurso.");
  }
}

export async function requireAdmin(ctx: AnyCtx) {
  const identity = await requireUser(ctx);
  const profile = await (ctx as QueryCtx).db
    .query("profiles")
    .withIndex("by_userId", (q: any) => q.eq("userId", identity.subject))
    .first();
  if (!profile || (profile.role || 0) < 5) {
    throw new Error("Acceso restringido a administradores.");
  }
  return profile;
}
