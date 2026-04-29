#!/usr/bin/env node
/**
 * Template: Función Convex (query/mutation/action)
 */

export default {
  name: 'convex-function',
  description: 'Función Convex con tipado estricto y manejo de errores',
  prompt: `
Estructura de función Convex esperada:

\`\`\`typescript
import { query, mutation, action, internalQuery, internalMutation } from "./_generated.server";
import { v } from "convex/values";

// Query pública
export const functionName = query({
  args: {
    arg1: v.string(),
    arg2: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. Validar inputs (ya validados por args schema)
    // 2. Consultar DB
    const data = await ctx.db.query("tableName").collect();
    // 3. Procesar y retornar
    return data;
  },
});

// Mutation
export const createItem = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Verificar permisos (ctx.auth)
    // 2. Validar reglas de negocio
    // 3. Ejecutar operación
    const id = await ctx.db.insert("tableName", {
      ...args,
      createdAt: Date.now(),
    });
    // 4. Retornar ID o datos
    return id;
  },
});

// Action (para lógica externa: APIs, emails, etc.)
export const myAction = action({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // 1. Obtener datos con ctx.runQuery
    // 2. Llamar servicio externo
    // 3. Guardar resultado con ctx.runMutation
    return { success: true };
  },
});
\`\`\`

REGLAS:
- Siempre definir args con schema (v.*)
- Usar optional() cuando el campo no es requerido
- Query para lecturas, Mutation para escrituras, Action para externo
- Manejar errores explícitamente
- Verificar autenticación cuando aplique
- Tipar retornos cuando no sean obvios
- Usar internalQuery/Mutation para uso interno del sistema

Genera una función Convex completa siguiendo estas convenciones.
`
};
