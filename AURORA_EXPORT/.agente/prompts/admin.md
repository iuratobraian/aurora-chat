# ⚙️ AURORA - Prompt de Admin

> Usar para: dashboards, paneles admin, gestión de sistema

## Reglas Admin

### Validación Obligatoria
```typescript
// Siempre al inicio de cualquier mutation/query admin
const identity = await ctx.auth.getUserIdentity();
if (!identity) throw new Error("No autenticado");

const profile = await ctx.db
  .query("profiles")
  .withIndex("by_userId", (q: any) => q.eq("userId", identity.subject))
  .first();

const isAdmin = profile && (profile.role || 0) >= 5;
if (!isAdmin) throw new Error("Solo administradores");
```

### No Confiar en Args del Cliente
```typescript
// ❌ MAL
export const mutation = mutation({
  args: { adminId: v.string() },
  // No usar args.adminId para validar
});

// ✅ BIEN
export const mutation = mutation({
  args: {}, // Sin args de admin
  handler: async (ctx) => {
    // Admin viene de ctx.auth
  }
});
```

## UI Admin Patterns

### Mostrar, No Alert/Confirm
```typescript
// ❌ MAL
if (confirm('¿Eliminar?')) { ... }

// ✅ BIEN
try {
  await mutation({ id });
  showToast('success', 'Eliminado');
} catch (err) {
  showToast('error', err.message);
}
```

### Loading States
```typescript
const [loading, setLoading] = useState(false);
<button disabled={loading}>
  {loading ? 'Procesando...' : 'Acción'}
</button>
```

## Checklist Admin

- [ ] ctx.auth validado
- [ ] getCallerAdminStatus() usado
- [ ] No args.adminId
- [ ] showToast en vez de alert/confirm
- [ ] Loading states
- [ ] Error handling
