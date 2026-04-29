# AURORA - Registro de Soluciones

> Este documento guarda TODAS las soluciones que voy resolviendo para revisión futura.

---

## 📋 Cómo usar este documento

1. **YO resuelvo un problema** → Lo documento aquí
2. **Otro agente revisa** → Verifica si está correcto
3. **Si hay error** → Se corrige y actualiza

---

## 🔧 Soluciones por Categoría

### 1. SEGURIDAD (Security)

#### ✅ Payment Auth Hardening
**Problema:** Mutations de pagos sin validación de ownership
**Solución:**
```typescript
// En convex/paymentOrchestrator.ts
async function getCallerAdminStatus(ctx: any): Promise<boolean> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return false;
  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_userId", (q: any) => q.eq("userId", identity.subject))
    .unique();
  return !!profile && (profile.role || 0) >= 5;
}
```
**Archivos:** `convex/paymentOrchestrator.ts`, `convex/payments.ts`
**Fecha:** 2026-03-27

#### ✅ Admin Backend RLS
**Problema:** Mutaciones admin sin ctx.auth
**Solución:** Agregar getCallerAdminStatus a ads.ts, aiAgent.ts, referrals.ts, traderVerification.ts, backup.ts, propFirms.ts
**Archivos:** Múltiples en convex/
**Fecha:** 2026-03-27

---

### 2. UI/UX

#### ✅ replace alert/confirm with showToast
**Problema:** Uso de window.confirm() en AdminView
**Solución:**
```typescript
// Antes
if (confirm('¿Eliminar?')) { ... }

// Después
try {
  await mutation({ id });
  showToast('success', 'Eliminado');
} catch (err) {
  showToast('error', err.message);
}
```
**Archivos:** `src/views/AdminView.tsx`
**Fecha:** 2026-03-27

---

### 3. INTEGRACIONES

#### ✅ WhatsApp Public Mutations
**Problema:** WhatsApp mutations eran internalMutation, no accesibles desde UI
**Solución:**
```typescript
// Crear mutations públicas
export const queueCustomNotificationPublic = mutation({
  handler: async (ctx, args) => {
    const isAdmin = await getCallerAdminStatus(ctx);
    if (!isAdmin) throw new Error("Solo administradores...");
  }
});
```
**Archivos:** `convex/whatsappCron.ts`, `src/components/admin/WhatsAppNotificationPanel.tsx`
**Fecha:** 2026-03-27

---

### 4. BILLING

#### ✅ PaymentModal Billing Cycle
**Problema:** No mostraba ciclo mensual/anual
**Solución:**
- Agregar state `billingCycle` 
- Mostrar toggle mensual/anual
- Calcular precio con yearlyPrice / 12
**Archivos:** `src/components/PaymentModal.tsx`, `src/services/storage.ts`
**Fecha:** 2026-03-27

---

### 5. PERFORMANCE

#### ✅ getCommunityMembers optimization
**Problema:** Error "Server Error" en communities:getCommunityMembers,query lenta con .collect() sin índice
**Solución:**
```typescript
// Antes: .collect() en todos los profiles
const allProfiles = await ctx.db.query("profiles").collect();

// Después: Query individual por cada userId
const profiles = await Promise.all(
  userIds.map(userId => 
    ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first()
  )
);
```
**Archivos:** `convex/communities.ts`
**Fecha:** 2026-03-27

---

## 📝 Plantilla para Nuevas Soluciones

```markdown
### [NOMBRE DEL PROBLEMA]
**Problema:** [Descripción corta]
**Solución:** [Código o explicación]
**Archivos:** [Lista de archivos modificados]
**Fecha:** YYYY-MM-DD
**Revisado por:** [nombre del agente]
**Estado:** ✅ Aprobado / ❌ Pendiente de revisión
```

---

## 🔄 Pendiente de Revisión

| # | Problema | Fecha | Estado |
|---|----------|-------|--------|
| 1 | [Pendiente] | YYYY-MM-DD | ⏳ |

---

## ✅ Revisados y Aprobados

| # | Problema | Revisado por | Fecha |
|---|----------|--------------|-------|
| 1 | Payment Auth Hardening | - | 2026-03-27 |
| 2 | Admin Backend RLS | - | 2026-03-27 |
| 3 | alert/confirm → showToast | - | 2026-03-27 |
| 4 | WhatsApp Public Mutations | - | 2026-03-27 |
| 5 | Billing Cycle Display | - | 2026-03-27 |

---

*Documento actualizado: 2026-03-27*
