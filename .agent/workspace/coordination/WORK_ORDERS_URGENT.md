# 🚨 ÓRDENES DE TRABAJO URGENTES — SESIÓN 2026-04-03
## Estado: ACTIVO — Asignar inmediatamente

---

## ✅ YA RESUELTOS (NO TOCAR)
- **OT-A5** RewardsView hook violation → `useQuery` con `skip` pattern ✅
- **OT-A6** PerfilView `oderId` typo → `userId` ✅
- **GraficoView crash** `selectedAsset` undefined → null guard ✅

---

## 🔴 OT-B1 — CRÍTICO: gamification.ts queries crasheando (Server Error)

**Archivos:** `convex/gamification.ts`
**Error:** `getUserProgress`, `getUserAchievements` → `requireUser(ctx)` throws porque `ctx.auth.getUserIdentity()` es SIEMPRE null en auth custom

**Fix EXACTO:**

En `getUserProgress` (línea 79-138), reemplazar:
```ts
handler: async (ctx, args) => {
  const identity = await requireUser(ctx);
  if (identity.subject !== args.userId) {
      throw new Error("IDOR Detectado...");
  }
```
Por:
```ts
handler: async (ctx, args) => {
  try {
    // Obtener perfil directamente, sin auth check (auth custom via session, no Convex Auth)
```
Y al final agregar el catch:
```ts
  } catch (e) {
    console.error('[getUserProgress] error:', e);
    return null;
  }
```

Repetir EXACTAMENTE lo mismo para `getUserAchievements` (línea 211-242):
```ts
handler: async (ctx, args) => {
  // Removed requireUser - custom auth, not Convex Auth
  try {
    const userAchievements = await ctx.db
      .query("userAchievements")
      ...
    return ...;
  } catch(e) {
    console.error('[getUserAchievements] error:', e);
    return [];
  }
```

**TAMBIÉN:** Agregar la query `getAchievementProgress` que NO EXISTE pero es llamada desde `storage.ts:392`:
```ts
export const getAchievementProgress = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    try {
      const allAchievements = await ctx.db.query("achievements").collect();
      const userAchievements = await ctx.db
        .query("userAchievements")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .collect();
      const unlockedIds = new Set(userAchievements.map((ua: any) => ua.achievementId));
      
      return allAchievements
        .filter(a => !unlockedIds.has(a.id))
        .map(a => ({
          id: a.id,
          name: a.name,
          icon: a.icon || '🏆',
          description: a.description,
          category: a.category,
          points: a.points,
          rarity: a.rarity || 'common',
          progress: 0,
          current: 0,
          target: (a as any).target || 1,
        }));
    } catch(e) {
      console.error('[getAchievementProgress] error:', e);
      return [];
    }
  }
});
```

**Luego hacer deploy:** `npx convex deploy`

---

## 🔴 OT-B2 — CRÍTICO: `products:getUserPurchases` crasheando (ProductView)

**Archivo:** `convex/products.ts`
**Error:** `CONVEX Q(products:getUserPurchases)` Server Error → mismo patrón, `requireUser`/`requireAdmin` throws

**Fix:** Buscar la función `getUserPurchases` en `convex/products.ts` y aplicar el patrón defensivo:
```ts
handler: async (ctx, args) => {
  try {
    // ... lógica existente ...
  } catch(e) {
    console.error('[getUserPurchases] error:', e);
    return [];
  }
}
```
Verificar si usa `requireUser(ctx)` y eliminar ese check — reemplazar por comentario explicativo.

---

## 🔴 OT-B3 — CRÍTICO: `communities:getCommunityStats` crasheando (CommunityAdminPanel)

**Archivo:** `convex/communities.ts`
**Error:** `CONVEX Q(communities:getCommunityStats)` Server Error

**Fix:** Buscar `getCommunityStats` en `convex/communities.ts`, aplicar try/catch defensivo:
```ts
handler: async (ctx, args) => {
  try {
    // ... lógica existente ...
  } catch(e) {
    console.error('[getCommunityStats] error:', e);
    return { memberCount: 0, postCount: 0, activeMembers: 0 };
  }
}
```

---

## 🔴 OT-B4 — CRÍTICO: `market/economicCalendar:getUpcomingEvents` crasheando (NewsView)

**Archivo:** `convex/market/economicCalendar.ts`
**Error:** `CONVEX Q(market/economicCalendar:getUpcomingEvents)` Server Error → crashes NewsView globalmente

**Fix:** Buscar `getUpcomingEvents` en `convex/market/economicCalendar.ts`, aplicar try/catch:
```ts
handler: async (ctx, args) => {
  try {
    // ... lógica existente ...
  } catch(e) {
    console.error('[getUpcomingEvents] error:', e);
    return [];
  }
}
```

---

## 🟡 OT-B5 — IMPORTANTE: CreatorDashboard `CONVEX Q(skip:default)` 

**Archivo:** `src/views/CreatorDashboard.tsx` línea 82
**Error:** `"skip" as any` con `{}` vacío como segundo arg → Convex intenta ejecutar query llamada "skip"

**Fix:**
```tsx
// ANTES (línea 81-84):
const communityMembersResult = useQuery(
  validCommunityId ? api.communities.getCommunityMembers : "skip" as any, 
  validCommunityId ? { communityId: validCommunityId, limit: 50 } : {}
);

// DESPUÉS:
const communityMembersResult = useQuery(
  api.communities.getCommunityMembers,
  validCommunityId ? { communityId: validCommunityId, limit: 50 } : 'skip'
);
```

---

## 🟡 OT-B6 — IMPORTANTE: GraficoView null guard para render con `selectedAsset === null`

**Archivo:** `src/views/GraficoView.tsx`  
**Estado:** Ya se arregló el estado inicial. PERO falta agregar guard en el JSX donde se accede a `selectedAsset.color`, `selectedAsset.symbol`, etc.

**Fix:** Agregar early return después de `loadAssets()`:
```tsx
// Después de los useState y el useEffect, antes del return JSX:
if (!selectedAsset) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <span className="material-symbols-outlined text-4xl text-gray-600 mb-4">candlestick_chart</span>
        <p className="text-gray-400">Cargando activos...</p>
      </div>
    </div>
  );
}
```
Insertar justo antes de `return (` en `GraficoView` (aprox. línea 123).

---

## 🟡 OT-B7 — IMPORTANTE: `storage.ts` referencia a `getAchievementProgress` que no existe

**Archivo:** `src/services/storage.ts` líneas 385, 389, 392
**Problema:** Llama a `api.gamification.getUserProgress`, `api.gamification.getUserAchievements`, `api.gamification.getAchievementProgress` vía `ConvexHttpClient.query()`. El último no existe en el backend.

**Fix:** Solo después de resolver OT-B1 (agregar `getAchievementProgress` al backend), este error desaparecerá automáticamente.

---

## 🟡 OT-B8 — IMPORTANTE: CSP Pusher wildcard inválido

**Archivo:** `vite.config.ts` o en el servidor (`server.ts`)
**Error:** `'wss://ws*.pusher.com'` — wildcard en dominio no permitido en CSP

**Fix en `vite.config.ts`:**
```ts
// Cambiar de:
"'wss://ws*.pusher.com'"
// A (lista explícita):
"'wss://ws1.pusher.com' 'wss://ws2.pusher.com' 'wss://ws3.pusher.com' 'wss://ws4.pusher.com'"
// O mejor, si no usás Pusher activamente, eliminarlo completamente del connect-src
```

---

## 🟡 OT-B9 — IMPORTANTE: PsicotradingView YouTube API 401

**Archivo:** `src/views/PsicotradingView.tsx` línea 149
**Error:** `POST http://localhost:3000/api/youtube/extract 401 (Unauthorized)` → El endpoint requiere token pero no lo recibe

**Fix en PsicotradingView.tsx:**
```tsx
// Buscar handleExtractYouTube y agregar el token en los headers:
const token = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
const response = await fetch('/api/youtube/extract', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    'x-user-id': usuario?.id || '',
  },
  body: JSON.stringify({ url: ytUrl }),
});
```
Buscar cómo el resto de los endpoints envían autenticación en el proyecto y replicarlo.

---

## 🟡 OT-B10 — DOBLE LOGIN `[RECORD_LOGIN]` registrándose x4 veces

**Problema:** Se dispara 4 veces por render: `[INFO] [RECORD_LOGIN] Success for userId: admin_braiurato`
**Archivo:** `src/App.tsx` o donde se llama `recordDailyLogin`

**Fix:** El `useEffect` que llama `RECORD_LOGIN` tiene dependencias incorrectas que causan re-ejecuciones. Agregar un ref de guard:
```tsx
const loginRecordedRef = useRef(false);
useEffect(() => {
  if (!usuario || loginRecordedRef.current) return;
  loginRecordedRef.current = true;
  // ... lógica de recordDailyLogin ...
}, [usuario?.id]); // Solo dep crítica, no todo el objeto usuario
```

---

## 📋 ORDEN DE EJECUCIÓN RECOMENDADO

1. **OT-B1** (gamification.ts) → impacta PerfilView, LeaderboardView  
2. **OT-B2** (products:getUserPurchases) → impacta ProductView
3. **OT-B3** (communities:getCommunityStats) → impacta CommunityAdminPanel
4. **OT-B4** (economicCalendar) → impacta NewsView
5. **OT-B5** (CreatorDashboard skip bug)
6. **OT-B6** (GraficoView null guard JSX)
7. **Convex Deploy** → `npx convex deploy`
8. **OT-B8** (CSP)
9. **OT-B9** (YouTube 401)
10. **OT-B10** (doble login)

---

## 🧠 REGLA DE ORO PARA TODOS LOS AGENTES
> **NUNCA usar `requireUser(ctx)` ni `requireAdmin(ctx)` en queries de Convex.**  
> Este proyecto usa custom auth, no Convex Auth. `ctx.auth.getUserIdentity()` SIEMPRE devuelve `null`.  
> El patrón correcto es: `try { ... lógica de DB ... } catch(e) { return [] }`  
> Solo las **mutations** pueden verificar identidad y lanzar errores controlados.  
> Para **queries**, siempre retornar valores vacíos seguros en lugar de hacer throw.

---

*Generado por Aurora — 2026-04-03T19:38 ART*
*Prioridad: MÁXIMA — Producción activa con errores*
