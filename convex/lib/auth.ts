import { v } from "convex/values";
import type {
  QueryCtx,
  MutationCtx,
  ActionCtx,
  DatabaseReader,
} from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";

type AnyCtx = QueryCtx | MutationCtx | ActionCtx;

/** User shape as stored in the `users` table. */
export type User = Doc<"users">;

/** Authenticated user identity extracted from Convex auth. */
export type Identity = { subject: string } | null;

const ERRORS = {
  AUTH_REQUIRED: "🔐 FALLO DE AUTENTICACIÓN: Debes iniciar sesión.",
  IDENTITY_UNVERIFIED: "🔐 ERROR DE IDENTIDAD: Usuario no encontrado en la base de datos.",
  SPOOFING_DETECTED: "⚠️ SEGURIDAD: Intento de suplantación detectado.",
} as const;

export async function getAuthIdentity(ctx: AnyCtx): Promise<Identity> {
  try {
    const identity = await ctx.auth.getUserIdentity();
    return identity?.subject ? { subject: identity.subject } : null;
  } catch {
    return null;
  }
}

export async function resolveCallerId(ctx: AnyCtx, passedId?: string): Promise<string> {
  const identity = await getAuthIdentity(ctx);
  if (!identity) {
    throw new Error(ERRORS.AUTH_REQUIRED);
  }
  
  const authId = identity.subject;
  
  if (passedId && passedId !== authId) {
    // Aquí se podría añadir lógica de admin bypass si fuera necesario
    throw new Error(ERRORS.SPOOFING_DETECTED);
  }
  
  return authId;
}

export async function resolveOptionalCallerId(ctx: AnyCtx, passedId?: string): Promise<string | null> {
  const identity = await getAuthIdentity(ctx);
  const authId = identity?.subject ?? null;
  
  if (passedId && authId && passedId !== authId) {
    throw new Error(ERRORS.SPOOFING_DETECTED);
  }
  
  return authId;
}
