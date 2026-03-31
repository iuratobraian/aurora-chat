# 📋 ORDEN DE TRABAJO MAESTRA — Mente Maestra Antigravity
## Para Agentes Externos (Ruflo v3.5 + Aurora Intelligence)

> **Generado**: 2026-03-24 | **Auditoría**: Lint ✅ 0 errores | Build ✅ 456KB | Tests ✅ pasan
> **Protocolo**: Ruflo v3.5 Anti-Drift | **Consenso**: raft | **Max Agentes**: 8

---

## DIAGNÓSTICO DEL PROYECTO

### Estado Actual
| Métrica | Valor | Estado |
|---------|-------|--------|
| TypeScript lint | 0 errores | ✅ |
| Build (Vite) | 456 KB gzip 133 KB | ✅ |
| Tests (Vitest) | Todos pasan | ✅ |
| Console.log leaks en src/ | **26 archivos** | ⚠️ |
| TODO/FIXME en convex/ | **10 archivos** | ⚠️ |
| Views > 40KB (bloat) | **6 archivos** | 🔴 |
| Schema Convex | **1925 líneas** (62KB) | 🔴 |
| App.tsx | **33KB** | ⚠️ |

### Archivos Críticos de Bloat
| Archivo | Tamaño | Línea de Acción |
|---------|--------|-----------------|
| `PerfilView.tsx` | **75KB** | Partir en 4 sub-componentes |
| `ComunidadView.tsx` | **55KB** | Extraer sidebar, feed, modals |
| `MarketplaceView.tsx` | **51KB** | Separar catálogo, checkout, filtros |
| `DashboardView.tsx` | **44KB** | Crear sub-views por sección |
| `AdminView.tsx` | **40KB** | Modularizar paneles admin |
| `SignalsView.tsx` | **41KB** | Separar lista, creación, detalle |
| `convex/schema.ts` | **62KB** | Partir por dominio (ver CONV-001) |
| `App.tsx` | **33KB** | Lazy routes, reducir imports |

---

## 🧠 MEJORAS CRÍTICAS PARA AURORA (Ruflo Intelligence)

Estas tareas implementan las capacidades de inteligencia que Ruflo ya tiene y Aurora necesita para funcionar como verdadera Mente Maestra.

### AURORA-INT-001 — Pipeline de Inteligencia de 4 Pasos (Ruflo RuVector)
**Prioridad**: 🔴 CRÍTICA | **Swarm Code**: 15 (Aurora/AI) | **Archivos**: `scripts/aurora-intelligence-pipeline.mjs`

Implementar el pipeline RETRIEVE→JUDGE→DISTILL→CONSOLIDATE:
1. **RETRIEVE**: Buscar patrones relevantes vía HNSW en knowledge base → Ya tenemos `semantic-retriever.mjs` pero falta conectarlo al pipeline
2. **JUDGE**: Evaluar con verdicts (success/failure) → Crear `aurora-judge.mjs` que evalúe si un patrón funcionó
3. **DISTILL**: Extraer aprendizajes clave → Crear `aurora-distill.mjs` que resuma sesiones en knowledge entries
4. **CONSOLIDATE**: Prevenir olvido catastrófico → Crear `aurora-consolidate.mjs` que fusione knowledge duplicado y pese por frecuencia de uso

**Aceptación**: Pipeline ejecutable end-to-end con `npm run aurora:intelligence-pipeline`. Cada paso genera output JSON verificable.

---

### AURORA-INT-002 — Memory Backend Híbrido (SQLite + JSONL)
**Prioridad**: 🔴 CRÍTICA | **Swarm Code**: 15 | **Archivos**: `lib/aurora/memory-backend.mjs`, `.agent/brain/db/aurora.sqlite`

Aurora hoy usa JSONL plano. Ruflo usa SQLite + AgentDB híbrido con HNSW indexing:
1. Crear wrapper SQLite (vía `better-sqlite3` o `sql.js` WASM) sobre el knowledge store actual
2. Indexar por: namespace, domain, freshness score, reuseCount
3. Migrar las colecciones JSONL existentes al nuevo backend
4. Mantener JSONL como fallback y formato de export

**Aceptación**: `aurora-memory.mjs` usa SQLite como primary, JSONL como backup. Búsqueda semántica 10x más rápida que text scan actual.

---

### AURORA-INT-003 — Doctor Health Check (Ruflo Pattern)
**Prioridad**: 🟡 ALTA | **Swarm Code**: 15 | **Archivos**: `scripts/aurora-doctor.mjs`, `package.json`

Crear un "doctor" para Aurora como el de Ruflo que chequee:
- Node.js version (20+)
- npm packages instalados
- Convex deployment status
- Aurora scripts funcionando (import test)
- Knowledge base health (entries, freshness, duplicados)
- MCP servers configurados
- API keys presentes en .env
- Disk space y tamaño del brain
- Drift detection (board vs focus vs log)

**Aceptación**: `npm run aurora:doctor` reporta estado con ✅/⚠️/🔴 por cada check y sugiere fixes automáticos.

---

### AURORA-INT-004 — Background Workers (12 Workers de Ruflo)
**Prioridad**: 🟡 ALTA | **Swarm Code**: 15 | **Archivos**: `scripts/aurora-workers.mjs`

Implementar workers que corran en background durante sesiones del agente:
| Worker | Prioridad | Qué hace |
|--------|-----------|----------|
| `audit` | critical | Escanea cambios de seguridad |
| `testgaps` | normal | Detecta archivos sin test |
| `map` | normal | Mapea dependencias del codebase |
| `consolidate` | low | Fusiona knowledge duplicado |
| `refactor` | normal | Sugiere refactors por bloat |

**Aceptación**: `npm run aurora:workers` inicia los workers priorizados. Cada uno escribe su output en `.agent/brain/db/worker_outputs/`.

---

### AURORA-INT-005 — Token Optimizer (Agent Booster)
**Prioridad**: 🟡 ALTA | **Swarm Code**: 15 | **Archivos**: `scripts/aurora-token-optimizer.mjs`

Implementar las 3 capas de optimización de tokens de Ruflo:
1. **ReasoningBank retrieval** (-32%): Antes de razonar, buscar si ya se resolvió algo similar
2. **Agent Booster edits** (-15%): Para edits mecánicos (rename, add types), no usar LLM
3. **Cache de contexto** (-10%): Cachear lecturas frecuentes de archivos del repo

**Aceptación**: Script mide tokens antes/después por tarea y reporta % de ahorro.

---

### AURORA-INT-006 — Routing Inteligente de Tareas
**Prioridad**: 🟡 ALTA | **Swarm Code**: 15 | **Archivos**: `scripts/aurora-task-router.mjs`

Ruflo usa un router de modelos que selecciona el tier óptimo por tarea. Para Aurora:
1. Clasificar tareas por complejidad (1-10) analizando archivos afectados, tipo de cambio, y riesgo
2. Recomendar agente(s) óptimo(s) desde `TRADESHARE_AGENT_ROUTING.md`
3. Estimar tokens necesarios y sugerir tier (local/Haiku/Sonnet)
4. Generar el brief pre-tarea con contexto mínimo pero suficiente

**Aceptación**: `npm run aurora:route "[tarea]"` retorna JSON con: complexity, recommendedAgents, estimatedTokens, tier, contextPack.

---

## 🔧 MEJORAS DE INFRAESTRUCTURA

### CONV-001 — Partir schema.ts por Dominio
**Prioridad**: 🔴 CRÍTICA | **Swarm Code**: 11 (Convex/DB) | **Archivos**: `convex/schema.ts` → `convex/schema/*.ts`

1925 líneas en un solo archivo de schema es deuda técnica grave:
- `convex/schema/profiles.ts` — profiles, achievements, userAchievements
- `convex/schema/content.ts` — posts, communityPosts, recursos, videos
- `convex/schema/social.ts` — communities, communityMembers, chat, notifications
- `convex/schema/commerce.ts` — payments, subscriptions, products, purchases
- `convex/schema/trading.ts` — signals, strategies, propFirms
- `convex/schema/admin.ts` — auditLogs, moderationLogs, spamReports
- `convex/schema/index.ts` — re-export con defineSchema

> **NOTA**: Convex combina schemas vía spread operator. Verificar compatibilidad con Convex 1.32.0.

**Aceptación**: Cada archivo < 300 líneas. `npx convex deploy` exitoso. Tests existentes pasan.

---

### REFAC-001 — Partir Views Gigantes en Sub-Componentes
**Prioridad**: 🔴 CRÍTICA | **Swarm Code**: 5 (Refactor) | **Archivos**: 6 views > 40KB

Regla: ningún archivo > 500 líneas (CLAUDE.md). Plan:

**PerfilView.tsx (75KB) →**
- `views/profile/ProfileHeader.tsx` (existente, ampliar)
- `views/profile/ProfileStats.tsx`
- `views/profile/ProfileTabs.tsx`
- `views/profile/ProfilePurchases.tsx`

**ComunidadView.tsx (55KB) →**
- `views/comunidad/CommunityFeed.tsx`
- `views/comunidad/CommunitySidebar.tsx`
- `views/comunidad/CommunityModals.tsx`
- `views/comunidad/CommunityFilters.tsx`

**MarketplaceView.tsx (51KB) →**
- `views/marketplace/ProductGrid.tsx`
- `views/marketplace/ProductFilters.tsx`
- `views/marketplace/CheckoutFlow.tsx`

**Aceptación**: Cada archivo resultante < 15KB. Ningún cambio de funcionalidad. Lint pasa. Tests pasan.

---

### CLEAN-001 — Eliminar Console.log en Producción
**Prioridad**: 🟡 ALTA | **Swarm Code**: 1 (Bug Fix) | **Archivos**: 26 archivos en src/

Archivos con console.log que llegan a producción:
- `ProductView.tsx`, `ShareablePostView.tsx`, `SignalsView.tsx`, `NewsView.tsx`
- `MarketingView.tsx`, `LeaderboardView.tsx`, `JuegosView.tsx`
- `ExpertAdvisorsView.tsx`, `InstagramCallback.tsx`
- `newsService.ts`, `youtubeService.ts`
- `DistributionPanel.tsx`, `FeedbackModal.tsx`, `GamingRoom.tsx`
- `MorningBriefingCard.tsx`, `YouTubeAIEditor.tsx`
- 5 archivos de news/, `SignalNotificationPrefs.tsx`
- `soundManager.ts`, `urls.ts`

Reemplazar con `logger` (ya existe en `src/utils/logger.ts`) o eliminar.

**Aceptación**: `grep -r "console\." src/ --include="*.tsx" --include="*.ts" | wc -l` retorna 0 (excepto logger.ts).

---

### CLEAN-002 — Resolver TODO/FIXME en Convex
**Prioridad**: 🟡 ALTA | **Swarm Code**: 11 | **Archivos**: 10 archivos en convex/

Archivos con TODO/FIXME/HACK:
- `apps.ts`, `posts.ts`, `webhooks.ts`, `seedProducts.ts`
- `recursos.ts`, `referrals.ts`, `propFirms.ts`
- `moderation.ts`, `chat.ts`, `lib/moderation.ts`

Cada TODO debe ser: resuelto, convertido en tarea del board, o eliminado con justificación.

**Aceptación**: `grep -r "TODO\|FIXME\|HACK" convex/ | wc -l` retorna 0.

---

### TEST-007 — Subir Coverage a 80%
**Prioridad**: 🟡 ALTA | **Swarm Code**: 23 (Tests) | **Archivos**: `__tests__/unit/*.test.ts`

Áreas sin tests unitarios:
- `convex/payments.ts` — cero tests de pagos
- `convex/webhooks.ts` — cero tests de webhooks
- `convex/communities.ts` — rate limiting sin tests
- `services/paymentOrchestrator.ts` — sin tests
- `services/feedback.ts` — sin tests
- `services/emailService.ts` — sin tests
- `lib/features.ts` — feature flags parcialmente testeados

**Aceptación**: `npm run test:coverage` muestra ≥ 80% en lines, functions, branches.

---

### PERF-009 — Lazy Loading de Routes en App.tsx
**Prioridad**: 🟡 ALTA | **Swarm Code**: 7 (Performance) | **Archivos**: `src/App.tsx`

App.tsx tiene 33KB con todos los imports estáticos. Implementar:
1. `React.lazy()` para todas las views
2. `Suspense` con skeleton loader
3. Mover imports pesados (TradingView, Charts) a dynamic imports
4. Code-split por route group: core, trading, admin, marketing

**Aceptación**: Bundle initial < 300KB. First contentful paint < 2s.

---

### SEC-009 — Auditoría de v.any() en Schema
**Prioridad**: 🔴 CRÍTICA | **Swarm Code**: 9 (Security) | **Archivos**: `convex/schema.ts`

Hay **múltiples** campos `v.any()` en schema que aceptan cualquier dato:
- `profiles.estadisticas` — debería ser un objeto tipado
- `profiles.Medellas` — typo + any[] → tipar
- `profiles.progreso` — debería ser objeto tipado
- `posts.zonaOperativa` — debería ser objeto con entry/tp/sl
- `posts.comentarios` — debería ser array de Comment con shape
- `posts.signalDetails` — debería tener tipo explícito
- `posts.ratings` — debería tener tipo explícito
- Varios más en achievements, notifications, etc.

**Aceptación**: 0 usos de `v.any()` en schema.ts (excepto `global_config.value` que es legítimo).

---

## 📊 TABLA DE TAREAS (Formato TASK_BOARD)

| TASK-ID | Estado | Código Swarm | Scope | Archivos | Objetivo | Aceptación |
|---------|--------|-------------|-------|----------|----------|------------|
| AURORA-INT-001 | pending | 15 | aurora_intelligence | scripts/aurora-intelligence-pipeline.mjs | Pipeline RETRIEVE→JUDGE→DISTILL→CONSOLIDATE | Pipeline end-to-end con output JSON verificable |
| AURORA-INT-002 | pending | 15 | aurora_intelligence | lib/aurora/memory-backend.mjs | Memory backend SQLite + JSONL | Búsqueda 10x más rápida, migration automática |
| AURORA-INT-003 | pending | 15 | aurora_intelligence | scripts/aurora-doctor.mjs | Health check estilo Ruflo Doctor | `npm run aurora:doctor` con ✅/⚠️/🔴 |
| AURORA-INT-004 | pending | 15 | aurora_intelligence | scripts/aurora-workers.mjs | 5 background workers (audit, testgaps, map, consolidate, refactor) | Workers priorizados con output en brain/db |
| AURORA-INT-005 | pending | 15 | aurora_intelligence | scripts/aurora-token-optimizer.mjs | Token optimizer 3 capas (-32% -15% -10%) | Reporta % ahorro real por tarea |
| AURORA-INT-006 | pending | 15 | aurora_intelligence | scripts/aurora-task-router.mjs | Routing inteligente de tareas por complejidad | JSON con complexity, agents, tier |
| CONV-001 | pending | 11 | convex_schema | convex/schema/*.ts | Partir schema.ts (1925 líneas) por dominio | Cada archivo < 300 líneas, deploy exitoso |
| REFAC-001 | pending | 5 | frontend_refactor | src/views/ | Partir 6 views > 40KB en sub-componentes | Cada archivo < 15KB, 0 cambios funcionales |
| CLEAN-001 | pending | 1 | code_quality | src/**/*.tsx, src/**/*.ts | Eliminar 26 archivos con console.log | 0 console.log en producción |
| CLEAN-002 | pending | 11 | code_quality | convex/*.ts | Resolver TODO/FIXME/HACK | 0 TODO/FIXME en convex/ |
| TEST-007 | pending | 23 | testing | __tests__/unit/*.test.ts | Coverage ≥ 80% | `npm run test:coverage` ≥ 80% |
| PERF-009 | pending | 7 | performance | src/App.tsx | Lazy loading de routes | Bundle initial < 300KB |
| SEC-009 | pending | 9 | security | convex/schema.ts | Eliminar v.any() → tipos explícitos | 0 v.any() en schema |

---

## 🎯 GUÍA PARA AGENTES — CÓMO EJECUTAR

### Orden de Prioridad Recomendado

```
FASE 1 (INMEDIATO — Deuda Técnica)
├── CLEAN-001  → console.log (1 agente, 1 sesión)
├── CLEAN-002  → TODO/FIXME (1 agente, 1 sesión)
└── SEC-009    → v.any() schema (1 agente, requiere deploy)

FASE 2 (SEMANA 1 — Refactoring)
├── CONV-001   → Partir schema.ts (swarm code 11)
├── REFAC-001  → Partir views gigantes (swarm code 5)
└── PERF-009   → Lazy loading routes

FASE 3 (SEMANA 2 — Aurora Intelligence)
├── AURORA-INT-001 → Pipeline de inteligencia
├── AURORA-INT-002 → Memory backend SQLite
├── AURORA-INT-003 → Doctor health check
├── AURORA-INT-005 → Token optimizer
└── AURORA-INT-006 → Task router

FASE 4 (SEMANA 3 — Hardening)
├── AURORA-INT-004 → Background workers
└── TEST-007       → Coverage 80%
```

### Protocolo por Tarea (OBLIGATORIO)

1. **Antes de tocar código**: Leer `CLAUDE.md` y `AGENTS.md`
2. **Reclamar**: Cambiar estado a `claimed` en `TASK_BOARD.md`
3. **Actualizar**: `CURRENT_FOCUS.md` con archivos a tocar
4. **Si >= 3 archivos**: Activar swarm con `/swarm_feature` (ver `.agent/workflows/swarm_feature.md`)
5. **Si tarea compleja**: Usar SPARC (ver `.agent/skills/SPARC_METHODOLOGY.md`)
6. **Al terminar**: `npm run lint && npm test && npm run build`
7. **Registrar**: Entry en `AGENT_LOG.md`
8. **Siguiente**: Si hay más `pending` → loop infinito

### Skills a Leer ANTES de Empezar

| Skill | Archivo | Cuándo |
|-------|---------|--------|
| Protocolo Inicio | `.agent/skills/inicio/inicio.md` | Siempre al iniciar |
| Swarm Protocol | `.agent/skills/SWARM_AUTO_START_PROTOCOL.md` | Tareas 3+ archivos |
| SPARC | `.agent/skills/SPARC_METHODOLOGY.md` | Tareas complejas |
| Agent Routing | `.agent/skills/TRADESHARE_AGENT_ROUTING.md` | Para saber qué agentes usar |
| Hive-Mind | `.agent/skills/HIVE_MIND_CONSENSUS.md` | Multi-agente |

---

## 💡 RECOMENDACIONES PARA MEJORAR EL FUNCIONAMIENTO

1. **Instalar `@claude-flow/cli@latest` globalmente** para que los hooks de Ruflo funcionen de verdad:
   ```bash
   npm install -g @claude-flow/cli@latest
   npx @claude-flow/cli@latest daemon start
   npx @claude-flow/cli@latest doctor --fix
   ```

2. **Configurar MCP servers** para que Aurora tenga herramientas reales:
   ```bash
   claude mcp add claude-flow -- npx -y @claude-flow/cli@latest
   claude mcp add ruv-swarm -- npx ruv-swarm mcp start
   ```

3. **Crear `.claude-flow.config.json`** en la raíz del repo para que Ruflo sepa la topología:
   ```json
   {
     "topology": "hierarchical",
     "maxAgents": 8,
     "strategy": "specialized",
     "consensus": "raft",
     "memory": { "backend": "hybrid", "path": ".agent/brain/db" }
   }
   ```

4. **Agregar pre-commit hook** que corra `npm run lint` automáticamente para evitar regresiones.

5. **Actualizar Convex a v1.35+** para soporte nativo de `paginate()` — actualmente en 1.32.0 que no lo soporta.

---

> [!IMPORTANT]
> Esta orden es de **lectura obligatoria** para cualquier agente que entre al repo. Ejecutar en el orden de fases propuesto. No saltar fases. Cada tarea debe dejar el board limpio antes de pasar a la siguiente.
