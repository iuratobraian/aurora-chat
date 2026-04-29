import { askKimi } from "./aurora-kimi-agent.mjs";

const prompt = `Tarea [FIX-SAVED-POSTS-SERVER-ERROR]: Reparar error de servidor en savedPosts:getSavedPosts causing web load failure.

CONTEXTO:
Tras una refactorización masiva del esquema de Convex (modularización), se cambiaron los nombres de los índices en las tablas.
La tabla 'savedPosts' ahora tiene índices 'by_userId' y 'by_userId_postId' (definidos en convex/schema/social.ts).
Sin embargo, el código en 'convex/savedPosts.ts' sigue usando 'by_user' y 'by_user_post'.

ARCHIVO convex/savedPosts.ts:
\`\`\`typescript
export const getSavedPosts = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const saved = await ctx.db
      .query("savedPosts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    return saved.map(s => s.postId);
  },
});
\`\`\`

PREGUNTA:
1. ¿Es correcto simplemente cambiar 'by_user' por 'by_userId'?
2. ¿Hay riesgos de performance si el índice no coincide exactamente con el schema? (En Convex, si el índice no existe la query falla, que es lo que está pasando).
3. ¿Cómo puedo asegurar que no queden otros índices rotos en el sistema?

Responde conciso con correcciones críticas si las hay.`;

const result = await askKimi(prompt, { timeout: 120000 });

console.log("\n💜 Respuesta de Kimi - [FIX-SAVED-POSTS-SERVER-ERROR]:");
console.log(result.answer);
