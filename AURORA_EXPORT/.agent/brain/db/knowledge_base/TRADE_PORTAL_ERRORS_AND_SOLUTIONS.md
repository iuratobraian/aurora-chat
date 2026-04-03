# TradePortal 2025 - Base de Conocimiento de Errores y Soluciones

**Fecha de creación:** 2026-03-20
**Sesión:** Code Review + Sprint de Correcciones
**Participantes:** BIG-PICKLE, AGENT-TEST, AGENT-QUALITY, AGENT-MEMORY, AGENT-ARCH, AGENT-CI, AGENT-PERF

---

## Resumen Ejecutivo

Se realizó una revisión completa del codebase de TradePortal 2025. Se identificaron **problemas críticos, medios y de calidad**, y se ejecutaron **3 sprints** con **8 tareas completadas**.

**Estado Final:**
- ✅ Lint: 0 errores
- ✅ Tests: 34/34 pasando
- ✅ Build: Exitoso (~402 kB)

---

## Problemas Identificados y Soluciones

### 🔴 CRÍTICO: Tests Rotos

**Problema:**
```
4/34 tests fallando en sessionManager
- extendSession: Cannot read properties of null (reading 'expiresAt')
- clearSession: Keys inconsistentes (tradehub_session vs local_session)
```

**Causa Raíz:**
- Tests usaban keys `tradehub_session` y `tradehub_session_user`
- Código real usaba `local_session` y `local_session_user`

**Solución:**
```diff
# __tests__/unit/sessionManager.test.ts
- localStorage.setItem('tradehub_session', ...);
- localStorage.setItem('tradehub_session_user', ...);
+ localStorage.setItem('local_session', ...);
+ localStorage.setItem('local_session_user', ...);
```

**Archivos Modificados:**
- `__tests__/unit/sessionManager.test.ts`
- `__tests__/utils/sessionManager.test.ts`

**Tarea:** `FIX-006` - AGENT-TEST ✅

---

### 🔴 CRÍTICO: Memory Leaks en Server

**Problema:**
```typescript
// server.ts
const notificationClicks = new Map(); // Crece sin límite
const processedWebhooks = new Map();   // Sin límite de tamaño
```

**Causa Raíz:**
- `notificationClicks`: Solo limpiaba cuando `size > 10000` y solo 1 item
- `processedWebhooks`: TTL de 1h pero sin límite de tamaño total

**Solución:**
```typescript
// notificationClicks: TTL 30min + LRU (max 5000)
const MAX_CLICKS = 5000;
const CLICK_TTL_MS = 30 * 60 * 1000;

// processedWebhooks: TTL 1h + LRU (max 10000)
const MAX_WEBHOOKS = 10000;
const WEBHOOK_TTL_MS = 60 * 60 * 1000;

// Agregar cleanup por edad y LRU en cada inserción
```

**Archivos Modificados:**
- `server.ts`

**Tarea:** `FIX-007` - AGENT-MEMORY ✅

---

### 🟡 MEDIO: Tipos Inseguros (any/unknown)

**Problema:**
```typescript
// types.ts
medallas?: any[];
medianas?: any[];
comentarios: unknown[];
content: any;
```

**Causa Raíz:**
- Uso histórico de `any` para "flexibilidad"
- `unknown[]` sin tipar correctamente

**Solución:**
```typescript
// types.ts
content: unknown;  // Antes: any
data?: unknown;    // Antes: any

// Interfaz Badge ya existía, usar en vez de any
badges: BadgeType[];  // En authService.ts
```

**Archivos Modificados:**
- `types.ts`
- `services/auth/authService.ts`

**Tarea:** `QUAL-001` - AGENT-QUALITY ✅

---

### 🟡 MEDIO: Arquitectura Confusa (Source of Truth)

**Problema:**
- Mezcla de localStorage + Convex + in-memory (server.ts)
- No quedaba claro cuál era la fuente de verdad

**Solución:**
```markdown
# docs/SOT.md creado

| Dato | Source of Truth | Cache Local |
|------|----------------|------------|
| Posts | Convex | localStorage |
| Usuarios | Convex | localStorage |
| Config | Convex | - |
| Realtime | server.ts (WS) | - |

## Reglas
1. Convex es la verdad para datos persistentes
2. localStorage es cache con TTL de 24h
3. server.ts es temporal para datos realtime
4. Nunca escribir a localStorage y asumir que es verdad
```

**Archivos Creados:**
- `docs/SOT.md`

**Tarea:** `ARCH-001` - AGENT-ARCH ✅

---

### 🟢 MEJORA: Performance - Memoización

**Problema:**
- ComunidadView.tsx tiene ~30 estados locales
- ~80 componentes sin memoización
- Posibles re-renders excesivos

**Solución:**
```typescript
// hooks/useMemoizedCallbacks.ts (nuevo)

export function usePostCallbacks(handlers) {
  return useMemo(() => ({
    handleLike: useCallback((post) => handlers.onLike(post), [handlers.onLike]),
    handleFollow: useCallback((id) => handlers.onFollow(id), [handlers.onFollow]),
    // ... más callbacks
  }), [handlers]);
}
```

**Hook Disponible:**
- `usePostCallbacks` - 8 callbacks
- `useCommentCallbacks` - 3 callbacks
- `useFeedCallbacks` - 4 callbacks

**Archivos Creados:**
- `hooks/useMemoizedCallbacks.ts`
- `hooks/index.ts`

**Tarea:** `PERF-001` - AGENT-PERF ✅

---

## Hallazgos Adicionales (No Solucionados)

### Auth Débil
```typescript
// server.ts - El token ES el userId sin verificación real
(req as any).userId = token;
```

**Recomendación:** Verificar tokens contra Convex en requireAuth middleware.

### Duplicación de Servicios
- `services/storage/auth.ts`
- `services/auth/authService.ts`
- `services/posts/*.ts`

**Recomendación:** Consolidar bajo un solo patrón.

### Uso Excesivo de `as any`
- `server.ts:194, 200`
- `ComunidadView.tsx:57,59`

**Recomendación:** Agregar regla ESLint para prohibir `any`.

---

## Comandos de Validación

```bash
# Lint + Typecheck
npm run lint

# Tests
npm test -- --run

# Build
npm run build

# Validación completa
npm run lint && npm test -- --run && npm run build
```

---

## Métricas del Proyecto

| Métrica | Valor |
|---------|-------|
| Componentes React | ~80 |
| Vistas | ~20 |
| Servicios | ~15 |
| Archivos Convex | ~50 |
| Líneas server.ts | 886 |
| Líneas App.tsx | 547 |
| Tests | 34 passing |

---

## Patrones de Solución Aprendidos

### 1. Memory Leaks en Maps
```typescript
// Patrón: TTL + LRU
const MAX_SIZE = X;
const TTL_MS = Y;

function addWithCleanup(map, key, value) {
  map.set(key, { value, timestamp: Date.now() });
  
  // Cleanup por edad
  for (const [k, v] of map) {
    if (Date.now() - v.timestamp > TTL_MS) {
      map.delete(k);
    }
  }
  
  // LRU si excede máximo
  if (map.size > MAX_SIZE) {
    const oldestKey = map.keys().next().value;
    map.delete(oldestKey);
  }
}
```

### 2. Consistencia de localStorage Keys
```typescript
// Definir constantes para evitar inconsistencias
const STORAGE_KEYS = {
  SESSION: 'local_session',
  USER: 'local_session_user',
  THEME: 'theme',
  WATCHLIST: 'user_watchlist',
} as const;

// Usar siempre las constantes
localStorage.setItem(STORAGE_KEYS.SESSION, data);
```

### 3. Tipos Seguros
```typescript
// En vez de:
data: any;
items: any[];

// Usar:
data: unknown;
items: DesiredType[];

// Narrow con validación:
if (typeof data === 'string') { ... }
```

---

## Tareas Pendientes

| TASK-ID | Descripción | Prioridad |
|---------|-------------|-----------|
| COM-001 | Comunidades con seed data | En progreso |
| MKT-005 | Daily poll + onboarding | En progreso |
| SEC-003 | Rate limiting AI endpoints | Alta |
| SEC-004 | Webhook signature verification | Alta |

---

## Referencias

- TASK_BOARD: `.agent/workspace/coordination/TASK_BOARD.md`
- AGENT_LOG: `.agent/workspace/coordination/AGENT_LOG.md`
- SoT: `docs/SOT.md`
- Security: `docs/SECURITY_HARDENING.md`

---

*Última actualización: 2026-03-20*
