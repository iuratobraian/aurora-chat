# 🔒 AURORA - Prompt de Seguridad

> Usar para: auth, permissions, pagos, datos sensibles

## Reglas de Oro

### 1. Nunca confiar en el cliente
```typescript
// ❌ MAL - userId viene del cliente
const userId = args.userId;

// ✅ BIEN - userId viene de la sesión
const identity = await ctx.auth.getUserIdentity();
const userId = identity.subject;
```

### 2. Validar roles explícitamente
```typescript
// Función helper obligatoria
async function getCallerAdminStatus(ctx: any): Promise<boolean> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return false;
  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_userId", (q: any) => q.eq("userId", identity.subject))
    .unique();
  return !!profile && (profile.role || 0) >= 5;
}

// Usar en cada operación admin
export const sensitiveMutation = mutation({
  handler: async (ctx) => {
    const isAdmin = await getCallerAdminStatus(ctx);
    if (!isAdmin) throw new Error("Solo administradores pueden...");
  }
});
```

### 3. Ownership check
```typescript
// Para queries que devuelven datos de usuarios
export const getUserData = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("No autenticado");
    
    // Owner check O admin check
    if (args.userId !== identity.subject) {
      const isAdmin = await getCallerAdminStatus(ctx);
      if (!isAdmin) throw new Error("No autorizado");
    }
  }
});
```

### 4. Campos sensibles nunca en frontend
- ❌ passwords, tokens, API keys
- ❌ roles internos del servidor
- ❌ datos financieros de otros usuarios

### 5. Rate limiting
- Para operaciones costosas: validar frecuencia
- Logs de auditoría para acciones sensibles

## Patterns de Seguridad

| Operación | Validación Requerida |
|-----------|---------------------|
| Pagos | Admin o owner |
| Cambios de rol | Admin (role >= 5) |
| Eliminación datos | Admin + confirmación |
| Lectura datos otros | Admin |
| Modificación perfil | Owner |

## Checklist de Seguridad

- [ ] `ctx.auth.getUserIdentity()` usado
- [ ] `getCallerAdminStatus()` para operaciones admin
- [ ] Ownership check para datos de usuarios
- [ ] No hay `adminId/userId` del cliente en args
- [ ] Tokens/API keys no expuestos
- [ ] Errores genéricos (no details sensibles)
