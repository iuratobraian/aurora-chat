import { MutationCtx } from "../_generated/server";
import { calculateXpGain, getLevelFromXp } from "./permissions";

/**
 * Agrega XP a un usuario y maneja la subida de nivel y notificaciones.
 */
export async function addXpInternal(
  ctx: MutationCtx,
  userId: string,
  action: "post" | "comment" | "like" | "follower" | "chat_message"
) {
  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .unique();

  if (!profile) return;

  const xpGain = calculateXpGain(action);
  const currentXp = profile.xp || 0;
  const nextXp = currentXp + xpGain;
  const currentLevel = profile.level || 1;
  const nextLevel = getLevelFromXp(nextXp);

  const updates: any = { xp: nextXp };

  if (nextLevel > currentLevel) {
    updates.level = nextLevel;
    
    // Auto-notificar al usuario
    await ctx.db.insert("notifications", {
      userId: userId,
      type: "level_up",
      title: "🚀 ¡NUEVO NIVEL!",
      body: `¡Felicidades! Has alcanzado el Nivel ${nextLevel}. Seguí así para desbloquear nuevas funciones.`,
      read: false,
      createdAt: Date.now(),
    });

    // XP Extra por subir de nivel
    updates.xp += nextLevel * 10;
  }

  await ctx.db.patch(profile._id, updates);
  return { nextLevel, leveledUp: nextLevel > currentLevel };
}
