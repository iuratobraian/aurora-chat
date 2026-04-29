import { v } from "convex/values";
import { query } from "./_generated/server";
import { resolveCallerId } from "./lib/auth";

/**
 * 🤖 KIMI K2.5 ARCHITECT - TRADESHARE OPTIMIZATION
 * Tarea: Reparación y Optimización de getUserCommunities
 * Directriz Gemma-4: Eliminar .collect() y bucles seriales ineficientes.
 */

export const getUserCommunitiesOptimized = {
  args: { userId: v.optional(v.string()) },
  handler: async (ctx: any, args: any) => {
    const userId = await resolveCallerId(ctx, args.userId);
    if (!userId) return [];
    
    // 1. Usamos take(100) como guarda inicial antes de migrar a paginado total si es necesario
    const memberships = await ctx.db.query("communityMembers")
      .withIndex("by_userId", (q: any) => q.eq("userId", userId))
      .order("desc") // Siempre ordenar por creación o unión
      .take(50); // Límite razonable para la UI de navegación lateral
    
    // 2. Ejecutamos los GET de comunidades en PARALELO para evitar Timeouts
    const results = await Promise.all(
      memberships.map(async (m: any) => {
        const community = await ctx.db.get(m.communityId);
        if (!community || community.status !== "active") return null;
        return { ...m, community };
      })
    );
    
    // 3. Filtramos nulos (comunidades eliminadas o inactivas)
    return results.filter(r => r !== null);
  },
};
