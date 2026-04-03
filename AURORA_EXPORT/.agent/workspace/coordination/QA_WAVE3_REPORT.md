# QA Wave 3 - Reporte de Auditoría

**Fecha:** 2026-03-28  
**Auditor:** BIG-PICKLE  
**Tarea:** TSK-063

---

## Resumen Ejecutivo

QA Wave 3 auditó 8 superficies críticas. Se encontraron **5 problemas críticos** que requieren remediación antes de marcar como `done`.

---

## Hallazgos Detallados

### 🔴 CRÍTICO: News - Mocks Activos

| Archivo | Problema | Severidad |
|---------|----------|-----------|
| `src/services/newsService.ts:16` | `SAMPLE_NEWS` array con datos demo hardcodeados | CRÍTICO |
| `src/services/storage.ts:266` | Retorna `NOTICIAS_MOCK` | CRÍTICO |
| `src/services/storage/media.ts:30` | Retorna `NOTICIAS_MOCK` | CRÍTICO |
| `src/services/agents/newsAgentService.ts:132` | `mockAnalysis` activo | CRÍTICO |
| `src/constants.ts:3` | `NOTICIAS_MOCK` exportado | CRÍTICO |

**Impacto:** Usuarios ven noticias fake en producción. No hay feed real de noticias.

**Remediación sugerida:**
1. Crear tabla `news` en Convex
2. Implementar `newsService.ts` con queries reales
3. Eliminar `SAMPLE_NEWS` y `NOTICIAS_MOCK`
4. Actualizar `newsAgentService.ts` para usar Convex

---

### 🟡 MEDIO: Signals - Feature Flag Hardcodeado

| Archivo | Línea | Problema |
|---------|-------|----------|
| `src/views/SignalsView.tsx` | 79 | `signalsFeatureEnabled = true` ignora env var |

**Impacto:** No se puede deshabilitar señales via env en producción.

**Remediación sugerida:**
```tsx
const signalsFeatureEnabled = import.meta.env.VITE_FEATURE_SIGNALS === 'on';
```

---

### 🟡 MEDIO: CreatorDashboard - Métricas Estimadas

| Archivo | Línea | Problema |
|---------|-------|----------|
| `src/views/CreatorDashboard.tsx` | 117 | `activeMembers = Math.floor(stats.totalMembers * 0.7)` |

**Impacto:** KPI muestra estimado, no dato real.

**Remediación sugerida:**
- Consultar `communityMembers` con filtro de actividad reciente (último login < 30 días)
- O agregar campo `activeMembers` en el schema

---

### 🟡 MEDIO: InstagramDashboard - StorageService

| Archivo | Línea | Problema |
|---------|-------|----------|
| `src/views/instagram/InstagramDashboard.tsx` | 4 | Usa `StorageService` (localStorage) |

**Impacto:** Datos de Instagram no persisten en cloud.

**Remediación sugerida:**
- Crear tabla `instagramAccounts` en Convex
- Migrar a `useQuery(api.instagram.getAccounts)`

---

### 🟢 MENOR: InstagramCallback - Session en localStorage

| Archivo | Línea | Problema |
|---------|-------|----------|
| `src/views/instagram/InstagramCallback.tsx` | 19 | `localStorage.getItem('user_session')` |

**Impacto:** Menor - es session storage para OAuth callback.

**Remediación sugerida:**
- Mover a cookie con flags httpOnly para seguridad.

---

## Superficies Verificadas ✅

| Superficie | Estado | Notas |
|------------|--------|-------|
| PricingView | ✅ OK | Usa `api.paymentOrchestrator` correctamente |
| PaymentModal | ✅ OK | Mutations bien estructuradas |
| Wallet | ✅ OK | Conectado a Convex |

---

## Recomendaciones

### Tareas de Remediación Inmediata

| TASK-ID | Descripción | Prioridad |
|---------|-------------|-----------|
| TSK-058-R | Eliminar SAMPLE_NEWS, NOTICIAS_MOCK, mockAnalysis | 🔴 ALTA |
| TSK-080 | Corregir feature flag signals (línea 79) | 🟡 MEDIA |
| TSK-081 | CreatorDashboard: métricas reales | 🟡 MEDIA |
| TSK-082 | InstagramDashboard: migrar a Convex | 🟡 MEDIA |

---

## Criterio de Cierre

Esta tarea (TSK-063) se marca como **parcial** hasta que los issues críticos sean remediados. El smoke test real requiere endpoints de producción activos.

---

## Validación Realizada

- [x] Revisión de código fuente
- [x] Cruce con TASK_BOARD.md
- [x] Verificación de auth/RLS
- [x] Verificación de localStorage como source of truth
- [ ] Smoke test en producción (requiere deploy)

---

*BIG-PICKLE - QA Wave 3*
*2026-03-28*
