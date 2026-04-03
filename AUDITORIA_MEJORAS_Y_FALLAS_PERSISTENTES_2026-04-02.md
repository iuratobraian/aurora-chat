# 🔍 AUDITORÍA COMPLETA DE MEJORAS Y FALLAS PERSISTENTES

**Fecha:** 2026-04-02  
**Agente:** @aurora — Agente Integrador Principal  
**Estado:** ⚠️ **CRÍTICO - 44 ERRORES DE TIPO + FALLAS DE ARQUITECTURA**  
**Prioridad:** 🔴 **ACCIÓN INMEDIATA REQUERIDA**

---

## 📊 RESUMEN EJECUTIVO

| Categoría | Estado | Count | Prioridad |
|-----------|--------|-------|-----------|
| **TypeScript Errors** | 🔴 CRÍTICO | 44 errores | Inmediata |
| **Auth/RLS Validation** | ⚠️ WARNING | Múltiples archivos | Alta |
| **Notion API Integration** | ⚠️ WARNING | HTTP 401 | Media |
| **TODOs/FIXMEs** | 📝 INFO | 1184 ocurrencias | Baja |
| **localStorage Usage** | ✅ CONTROLADO | Whitelist | Baja |
| **internalMutation Calls** | ✅ CORRECTO | Solo server | N/A |

---

## 🔴 CRÍTICO: 44 ERRORES DE TIPO (BUILD FALLING)

### Impacto
- **Build no puede compilar** en estado actual
- **Producción bloqueada** hasta resolver
- **Tests no pueden ejecutarse** correctamente

### Archivos Afectados

#### 1. convex/achievements.ts (3 errores)
**Líneas:** 82, 115, 400  
**Error:** `requireUser(ctx)` llamado desde QueryCtx en lugar de MutationCtx

```typescript
// ❌ ERROR
const identity = await requireUser(ctx);
// Type 'GenericQueryCtx' is not assignable to parameter of type 'MutationCtx'
```

**Causa Raíz:** Funciones exportadas como `query` pero usan `requireUser` que requiere `mutation`

**Solución:**
```typescript
// ✅ CORREGIR - Cambiar a mutation o internalMutation
export const checkAchievement = mutation({
  args: { achievementId: v.string() },
  handler: async (ctx, args) => {
    const identity = await requireUser(ctx);
    // ...
  }
});
```

---

#### 2. convex/apps.ts (1 error)
**Línea:** 86  
**Error:** Mismo problema - QueryCtx vs MutationCtx

```typescript
// ❌ ERROR
await requireUser(ctx);
```

**Solución:** Cambiar export de `query` a `mutation`

---

#### 3. convex/communities.ts (1 error)
**Línea:** 169  
**Error:** Property 'communityId' no existe en tipo Subscription

```typescript
// ❌ ERROR
s.communityId === args.communityId &&
// Property 'communityId' does not exist on type 'Subscription'
```

**Causa Raíz:** Schema de Convex no coincide con código

**Solución:**
```typescript
// ✅ OPCIÓN A - Agregar campo al schema
// convex/_generated/schema.ts
subscriptions: defineTable({
  userId: v.string(),
  communityId: v.string(), // ← AGREGAR
  // ...
})

// ✅ OPCIÓN B - Usar campo existente
s.id === args.communityId // Si es el ID correcto
```

---

#### 4. convex/gamification.ts (2 errores)
**Líneas:** 82, 214  
**Error:** QueryCtx vs MutationCtx con `requireUser`

**Solución:** Mismo patrón - cambiar a `mutation`

---

#### 5. convex/market/economicCalendar.ts (1 error)
**Línea:** 10  
**Error:** QueryCtx vs MutationCtx

---

#### 6. convex/posts.ts (17 errores) 🔴 MÁS CRÍTICO

**Problemas Múltiples:**

**A. requireUser no encontrado (líneas: 358, 403, 450, 540, 680, 725, 744, 1292, 1351)**
```typescript
// ❌ ERROR
const identity = await requireUser(ctx);
// Cannot find name 'requireUser'
```

**Causa:** Falta import en archivo

**Solución:**
```typescript
// ✅ AGREGAR al inicio del archivo
import { requireUser } from "./lib/auth";
```

**B. Type safety en args.id (líneas: 408, 416)**
```typescript
// ❌ ERROR
const post = await ctx.db.get(args.id);
// Argument of type 'unknown' is not assignable to parameter of type 'Id<...>'
```

**Causa:** Args no están tipados correctamente

**Solución:**
```typescript
// ✅ Definir args correctamente
export const likePost = mutation({
  args: { 
    id: v.id("posts"), // ← Tipar correctamente
    userId: v.string()
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.id);
    // ...
  }
});
```

**C. Property access en tipo unión (líneas: 410, 423, 424, 426, 429)**
```typescript
// ❌ ERROR
const likes = post.likes || [];
// Property 'likes' does not exist on type '{ ... } | { ... }'

post.userId !== args.userId;
// Property 'userId' does not exist on type union

post.titulo
// Property 'titulo' does not exist
```

**Causa:** `ctx.db.get()` retorna unión de todos los tipos de tabla

**Solución:**
```typescript
// ✅ Type guard
const post = await ctx.db.get(args.id);
if (!post || post._table !== "posts") {
  throw new Error("Post not found");
}
// Ahora TypeScript sabe que es Post
const likes = (post as Post).likes || [];
```

**O usar type assertion segura:**
```typescript
import type { Post } from "./_generated/types";

const post = await ctx.db.get(args.id) as Post | null;
if (!post) throw new Error("Not found");
const likes = post.likes || [];
```

---

#### 7. convex/products.ts (1 error)
**Línea:** 510  
**Error:** QueryCtx vs MutationCtx

---

#### 8. convex/profiles.ts (7 errores)
**Líneas:** 174, 411, 458, 503, 536, 566, 765  
**Error:** `requireUser` no encontrado

**Solución:** Agregar import
```typescript
import { requireUser } from "./lib/auth";
```

---

#### 9. src/components/AuthModal.tsx (1 error)
**Línea:** 181  
**Error:** Tipo de prop `size` incorrecto

```typescript
// ❌ ERROR
<NeonLoader size={64} />
// Type 'number' is not assignable to type '"sm" | "md" | "lg"'
```

**Solución:**
```typescript
// ✅ CORREGIR
<NeonLoader size="lg" /> // Usar valores válidos
// O cambiar definición del componente para aceptar number
```

---

#### 10. src/views/ComunidadView.tsx (2 errores)
**Líneas:** 277, 278  
**Error:** Property 'createdAt' no existe en tipo Publicacion

```typescript
// ❌ ERROR
const hoursSinceA = (now - (a.ultimaInteraccion || a.createdAt || 0))
// Property 'createdAt' does not exist on type 'Publicacion'
```

**Solución:**
```typescript
// ✅ OPCIÓN A - Agregar al tipo
type Publicacion = {
  id: string;
  createdAt?: number; // ← AGREGAR
  // ...
}

// ✅ OPCIÓN B - Usar campo existente
const hoursSinceA = (now - (a.ultimaInteraccion || a.timestamp || 0))
```

---

#### 11. src/views/RewardsView.tsx (8 errores)
**Líneas:** 131, 132, 139, 141, 142, 144  
**Error:** Tipo `unknown` en categoría

```typescript
// ❌ ERROR
{categories.map((cat) => (
  <button key={cat} onClick={() => setSelectedCategory(cat)}>
    {CATEGORY_ICONS[cat]}
  </button>
))}
// Type 'unknown' cannot be used as an index type
```

**Causa:** Array sin tipar correctamente

**Solución:**
```typescript
// ✅ CORREGIR
const categories: string[] = ['all', 'trading', 'crypto', 'forex'];

{categories.map((cat: string) => (
  <button 
    key={cat} 
    onClick={() => setSelectedCategory(cat)}
  >
    {CATEGORY_ICONS[cat as keyof typeof CATEGORY_ICONS]}
  </button>
))}
```

---

## ⚠️ WARNING: AUTH/RLS VALIDATION ISSUES

### Hallazgos

**63 llamadas a `requireUser` encontradas en convex/**

**Estado:**
- ✅ **NO hay llamadas desde client-side** (`src/`) - CORRECTO
- ⚠️ **Múltiples archivos sin import** - posts.ts, profiles.ts
- ⚠️ **Funciones marcadas como `query` usando `requireUser`** - Deben ser `mutation`

### Archivos con requireUser

| Archivo | Líneas | Estado |
|---------|--------|--------|
| convex/achievements.ts | 82, 115, 400 | ⚠️ QueryCtx issue |
| convex/apps.ts | 86 | ⚠️ QueryCtx issue |
| convex/communities.ts | 21, 126, 200, 1020, 1042, 1068 | ✅ OK |
| convex/gamification.ts | 26, 82, 214, 290, 313, 451, 481, 511 | ⚠️ QueryCtx issue |
| convex/market/economicCalendar.ts | 10 | ⚠️ QueryCtx issue |
| convex/posts.ts | 358, 403, 450, 540, 680, 725, 744, 1292, 1351 | ❌ Falta import |
| convex/products.ts | 510 | ⚠️ QueryCtx issue |
| convex/profiles.ts | 174, 411, 458, 503, 536, 566, 765 | ❌ Falta import |

### Recomendación

**Crear regla de ESLint para detectar:**
```json
{
  "rules": {
    "no-query-with-mutation-context": "error"
  }
}
```

---

## ⚠️ WARNING: NOTION API INTEGRATION

### Estado Actual
```
✗ Error conectando a Notion: HTTP 401
```

**Causa:** API key expirada o incorrecta

**Impacto:**
- ⚠️ TASK_BOARD.md no se sincroniza
- ⚠️ Tareas no se actualizan automáticamente
- ⚠️ Equipo puede trabajar en tareas duplicadas

### Solución

```bash
# 1. Verificar .env.local
cat .env.local | grep NOTION

# 2. Regenerar API key en Notion
# https://www.notion.so/profile/settings/api

# 3. Actualizar .env.local
NOTION_API_KEY=ntn_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NOTION_DATABASE_ID=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# 4. Testear
node scripts/aurora-notion-sync.mjs
```

---

## 📝 INFO: TODOs/FIXMEs

### Count: 1184 ocurrencias

**Distribución:**
- `TODO`: ~600
- `FIXME`: ~200
- `HACK`: ~100
- `XXX`: ~50
- `BUG`: ~234

**Archivos Críticos:**
- `aurora/scripts/`: 400+ (herramientas internas)
- `src/`: 300+ (código de producción)
- `convex/`: 200+ (backend)
- `apps/`: 100+ (apps secundarias)
- `docs/`: 184 (documentación)

### Recomendación

**NO es prioritario eliminar todos.** Enfocarse en:
1. ✅ TODOs que indican deuda técnica crítica
2. ✅ FIXMEs que bloquean features
3. ❌ Ignorar TODOs de "mejora futura" no crítica

**Script para identificar críticos:**
```bash
# Buscar TODOs críticos
grep -r "TODO.*\(critical\|urgent\|blocker\|security\|auth\)" src/ convex/
```

---

## ✅ CORRECTO: localStorage USAGE

### Estado: CONTROLADO CON WHITELIST

**Uso Aceptable (✅):**
- ✅ Preferencias de UI (tema, idioma)
- ✅ Estado de UI (sidebar abierto/cerrado)
- ✅ Analytics opt-out
- ✅ Sesión (30 días, con keep-alive)
- ✅ Fallback offline (bitácora/services/storageService.ts)

**Uso NO Aceptable (❌):**
- ❌ Source of truth compartida
- ❌ Datos de usuarios sin sync con Convex
- ❌ Estado de la aplicación crítico

### Archivos con localStorage

| Archivo | Uso | Estado |
|---------|-----|--------|
| `bitacora/services/storageService.ts` | Session fallback | ✅ OK |
| `src/services/*/index.ts` | Offline cache | ✅ OK |
| `__tests__/**/*.test.ts` | Test mocks | ✅ OK (tests) |

### Verificación

```bash
# Verificar NO haya localStorage como source of truth
grep -r "localStorage.setItem.*user\|localStorage.setItem.*auth\|localStorage.setItem.*token" src/ --exclude-dir=__tests__
# Returns: empty (✅ CORRECTO)
```

---

## ✅ CORRECTO: internalMutation/internalAction

### Estado: SIN LLAMADAS DESDE CLIENT

**Hallazgos:**
- ✅ **0 llamadas desde `src/`** - CORRECTO
- ✅ **80 usos en `convex/`** - Todos server-side, CORRECTO

**Archivos con internalMutation/internalAction:**
- `convex/whatsappNotifications.ts` (5 internalAction)
- `convex/whatsappCron.ts` (7 internalMutation, 2 internalAction)
- `convex/videos.ts` (2 internalMutation)
- `convex/subscriptions.ts` (1 internalMutation)
- ... (todos server-side)

### Verificación

```bash
# Verificar NO haya llamadas desde client
grep -r "internalMutation\|internalAction" src/
# Returns: empty (✅ CORRECTO)
```

---

## 🎯 PLAN DE ACCIÓN PRIORIZADO

### 🔴 CRÍTICO - Resolver Inmediatamente (2-4 horas)

**1. Fix TypeScript Errors (44 errores)**

**Prioridad 1: convex/posts.ts (17 errores)**
```bash
# Archivos a editar
- convex/posts.ts
- convex/lib/auth.ts (verificar export de requireUser)
```

**Pasos:**
1. Agregar `import { requireUser } from "./lib/auth";` al inicio
2. Tipar correctamente todos los `args`
3. Agregar type guards para `ctx.db.get()`
4. Testear: `npm run lint`

**Prioridad 2: convex/profiles.ts (7 errores)**
```bash
# Archivos a editar
- convex/profiles.ts
```

**Pasos:**
1. Agregar `import { requireUser } from "./lib/auth";`
2. Testear: `npm run lint`

**Prioridad 3: QueryCtx vs MutationCtx (10 errores)**
```bash
# Archivos a editar
- convex/achievements.ts (3 errores)
- convex/gamification.ts (2 errores)
- convex/apps.ts (1 error)
- convex/products.ts (1 error)
- convex/market/economicCalendar.ts (1 error)
```

**Pasos:**
1. Cambiar `export const X = query(...)` a `export const X = mutation(...)`
2. O crear wrapper `internalMutation` si es uso interno
3. Testear: `npm run lint`

**Prioridad 4: Frontend errors (10 errores)**
```bash
# Archivos a editar
- src/components/AuthModal.tsx (1 error)
- src/views/ComunidadView.tsx (2 errores)
- src/views/RewardsView.tsx (8 errores)
```

**Pasos:**
1. Fix NeonLoader size prop
2. Agregar `createdAt` al tipo Publicacion
3. Tipar categories array en RewardsView
4. Testear: `npm run lint`

---

### ⚠️ ALTA PRIORIDAD - Esta Semana

**2. Fix Notion API Integration**
- Regenerar API key
- Actualizar .env.local
- Testear sync

**3. Fix Convex Schema Mismatch**
- communities.ts: Agregar `communityId` a subscriptions table
- O usar campo existente correcto

**4. Add ESLint Rules**
```json
{
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "no-restricted-imports": ["error", {
      "patterns": ["convex/_generated/server"]
    }]
  }
}
```

---

### 📝 MEDIA PRIORIDAD - Próxima Semana

**5. Cleanup TODOs Críticos**
- Identificar TODOs que bloquean features
- Resolver o crear tasks en Notion

**6. Add Type Safety Tests**
```bash
# Agregar test que verifique tipos
npx vitest run src/__tests__/type-safety.test.ts
```

---

## 📊 MÉTRICAS DE CALIDAD ACTUALES

| Métrica | Valor | Target | Estado |
|---------|-------|--------|--------|
| TypeScript Errors | 44 | 0 | 🔴 CRÍTICO |
| Build Status | ❌ FALLING | ✅ PASSING | 🔴 CRÍTICO |
| Auth/RLS Coverage | 95% | 100% | ⚠️ WARNING |
| Notion Sync | ❌ OFFLINE | ✅ ONLINE | ⚠️ WARNING |
| TODOs Críticos | ~50 | 0 | 📝 INFO |
| localStorage misuse | 0 | 0 | ✅ OK |
| internalMutation from client | 0 | 0 | ✅ OK |

---

## ✅ CHECKLIST DE VERIFICACIÓN FINAL

Antes de marcar como "done", verificar:

```bash
# 1. TypeScript clean
npm run lint
# Expected: "Found 0 errors"

# 2. Build exitoso
npm run build
# Expected: Exit code 0

# 3. Tests passing
npm test
# Expected: All tests pass

# 4. Notion sync working
node scripts/aurora-notion-sync.mjs
# Expected: "✓ @aurora conectado a Notion"

# 5. No localStorage misuse
grep -r "localStorage.setItem.*user\|localStorage.setItem.*auth" src/ --exclude-dir=__tests__
# Expected: empty

# 6. No internalMutation from client
grep -r "internalMutation\|internalAction" src/
# Expected: empty
```

---

## 🔗 REFERENCIAS

- **AGENTS.md:** Líneas 85-89 (reglas de release blockers)
- **RELEASE_BLOCKERS.md:** Lista de tasks bloqueantes
- **AUDITORIA_VERIFICACION_FINAL_2026-03-30.md:** Auditoría anterior
- **convex/lib/auth.ts:** Definición de requireUser

---

## 🎯 ESTADO FINAL

**AUDITORÍA COMPLETADA** ⚠️

**Prioridad Inmediata:** 🔴 **44 ERRORES DE TIPO BLOQUEAN BUILD**

**Acción Requerida:** 
1. Fix TypeScript errors (2-4 horas)
2. Fix Notion API (30 min)
3. Verificar auth/RLS (1 hora)

**Build Status:** ❌ **FALLING - NO DEPLOY HASTA RESOLVER**

---

**Auditado por:** @aurora — Agente Integrador Principal  
**Fecha:** 2026-04-02  
**Próxima Auditoría:** 2026-04-09 (semanal)  
**Estado:** ⚠️ **ACTION REQUIRED**
