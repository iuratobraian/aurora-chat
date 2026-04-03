/**
 * AURORA Tools - Convex Operations
 * 
 * Herramientas específicas para operaciones Convex
 */

export const CONVEX_TOOLS = {
  // Query patterns
  query: {
    description: "Consultas a Convex",
    patterns: {
      // Query por userId con ownership
      byUserId: `
const identity = await ctx.auth.getUserIdentity();
if (!identity) throw new Error("No autenticado");
if (args.userId !== identity.subject) {
  const isAdmin = await getCallerAdminStatus(ctx);
  if (!isAdmin) throw new Error("No autorizado");
}`
    }
  },

  // Mutation patterns
  mutation: {
    description: "Mutaciones en Convex",
    patterns: {
      // Mutation con auth
      withAuth: `
const identity = await ctx.auth.getUserIdentity();
if (!identity) throw new Error("No autenticado");`,

      // Mutation admin
      adminOnly: `
const isAdmin = await getCallerAdminStatus(ctx);
if (!isAdmin) throw new Error("Solo administradores");`
    }
  },

  // Helper functions
  helpers: {
    getCallerAdminStatus: `
async function getCallerAdminStatus(ctx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return false;
  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
    .unique();
  return !!profile && (profile.role || 0) >= 5;
}`
  },

  // Schema patterns
  schema: {
    indexes: "Usar withIndex() para优化的busquedas",
    pagination: "Usar .take(n) en lugar de .collect() cuando sea posible"
  }
};

// Common errors
export const CONVEX_ERRORS = {
  'Query returns undefined': 'Verificar que el query existe y tiene datos',
  'Permission denied': 'Agregar ctx.auth.getUserIdentity()',
  'Too many re-renders': 'Usar useCallback/useMemo'
};
