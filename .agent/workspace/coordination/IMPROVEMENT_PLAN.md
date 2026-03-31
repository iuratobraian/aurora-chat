# Plan de Mejoras - TradePortal 2025

## Resumen
4 mejoras de alto impacto para el producto, divididas para ejecución en paralelo por múltiples agentes.

| # | Mejora | Status | Tasks |
|---|--------|--------|-------|
| 1 | Onboarding Reforzado | ✅ COMPLETA | OBD-001 → OBD-006 |
| 2 | Notificaciones Push | ✅ COMPLETA | PUSH-001 → PUSH-008 |
| 3 | Gamificación Expandida | ✅ COMPLETA | GAME-001 → GAME-011 |
| 4 | Calidad del Código | 🔄 EN PROGRESO | PERF-001 ✅ PERF-002 ✅ CLOUD-001 ✅ |

---

## Arquitectura del Plan

| Agente | Mejora | Dependencias | Archivos Principales |
|--------|--------|--------------|---------------------|
| **AGENT-1** | Onboarding Reforzado | Ninguna | `App.tsx`, `components/OnboardingFlow.tsx`, `components/RetentionOverlay.tsx`, `hooks/useOnboardingAssistant.ts`, `components/AuthModal.tsx` |
| **AGENT-2** | Notificaciones Push | Depende de AGENT-1 (prefencias) | `convex/notifications.ts`, `convex/push.ts`, `convex/pushActions.ts`, `convex/userPreferences.ts`, `components/PushPreferences.tsx`, `hooks/useNotifications.ts`, `public/sw.js`, `.env.example`, `lib/pushNotifications.ts` |
| **AGENT-3** | Gamificación Expandida | Ninguna | `convex/gamification.ts`, `convex/achievements.ts`, `convex/lib/achievements.ts`, `convex/signals.ts`, `convex/profiles.ts`, `services/ranking/feedRanker.ts`, `services/ranking/trustLayer.ts`, `views/LeaderboardView.tsx`, `types.ts`, `lib/features.ts` (nuevo) |

**Regla de coordinación:** AGENT-2 depende parcialmente de AGENT-1 porque las preferencias de notificación se implementan en AGENT-1. AGENT-2 puede avanzar en paralelo con las partes de backend (VAPID, filtering, sync).

---

## MEJORA 1: Onboarding Reforzado

### Problema
- `RetentionOverlay.tsx` definido pero nunca renderizado en App.tsx
- `StayMotivatedWidget` nunca usado
- `useOnboardingAssistant` existe pero no conectado
- No hay selección de experiencia al registrarse
- Progreso de onboarding no persiste por pasos

### Solución
Reactivar componentes muertos, conectar hooks, mejorar experiencia de onboarding con selección de nivel.

### Tareas Detalladas

#### FASE 1A: Activar RetentionOverlay (AGENT-1)

**TASK-OBD-001: Activar RetentionOverlay en App.tsx**
- Archivos: `App.tsx`, `components/RetentionOverlay.tsx`
- Objetivo: Mostrar RetentionOverlay a usuarios inactivos
- Criterio: Usuarios sin login en 7+ días ven overlay motivacional
- Impacto: Reduce churn

**TASK-OBD-002: Activar StayMotivatedWidget**
- Archivos: `App.tsx`, `components/RetentionOverlay.tsx`
- Objetivo: Mostrar widget motivacional en sidebar/dashboard
- Criterio: Widget visible en ComunidadView para usuarios sin actividad en 3 días

#### FASE 1B: Integrar useOnboardingAssistant (AGENT-1)

**TASK-OBD-003: Wire useOnboardingAssistant**
- Archivos: `App.tsx`, `hooks/useOnboardingAssistant.ts`, `lib/ai/onboardingAgent.ts`
- Objetivo: Conectar hook de onboarding AI-driven
- Criterio: Hook genera pasos personalizados y el usuario puede completarlos

**TASK-OBD-004: Selección de experiencia en registro**
- Archivos: `components/AuthModal.tsx`, `views/ComunidadView.tsx`
- Objetivo: Modal post-registro con 3 opciones: Beginner / Intermediate / Advanced
- Criterio: Selección guardada en `usuario.nivelExperiencia` y usada por onboardingAgent
- UI: 3 cards con iconos, descripción breve, botón "Comenzar"

#### FASE 1C: Persistencia y Re-engagement (AGENT-1)

**TASK-OBD-005: Per-step progress persistence**
- Archivos: `components/OnboardingFlow.tsx`
- Objetivo: Guardar progreso por paso en localStorage
- Criterio: Si usuario cierra onboarding y vuelve, continúa desde donde dejó (no desde cero)

**TASK-OBD-006: Re-engagement para abandonos**
- Archivos: `components/RetentionOverlay.tsx`, `App.tsx`
- Objetivo: Si usuario abandona onboarding, RetentionOverlay ofrece "Continuar onboarding"
- Criterio: Overlay shown si `onboarding_step < total_steps` y han pasado 3+ días

### Validación Global MEJORA 1
- `npm run lint` → 0 errores
- `npm run test:run` → todos pasan
- Manual: Registro → selección experiencia → onboarding → completion → no se repite

---

## MEJORA 2: Sistema de Notificaciones Push

### Problema
- VAPID keys vacías en `.env.local`
- Preferencias guardadas solo en `localStorage`, nunca se sync a Convex
- `createNotification` no filtra por preferencias
- Quiet hours en UI pero ignorados en backend
- Polling 30s en vez de realtime Convex

### Solución
Configurar VAPID, persistir preferencias en Convex, filtrar pushes por tipo, implementar quiet hours, migrar a realtime.

### Tareas Detalladas

#### FASE 2A: Configuración de VAPID (AGENT-2)

**TASK-PUSH-001: Documentar generación de VAPID keys**
- Archivos: `.env.example`, `README.md`
- Objetivo: Documentar proceso de generación con `npx web-push generate-vapid-keys`
- Criterio: `.env.example` tiene explicación clara del proceso y valores de ejemplo

**TASK-PUSH-002: Verificar generación de keys en pipeline**
- Archivos: `.env.local` (no commitear keys reales)
- Objetivo:确保 `.gitignore` excluye `.env.local`, solo `.env.example` en repo
- Criterio: VAPID keys nunca en el repo, solo en variables de entorno de Vercel

#### FASE 2B: Persistencia de Preferencias (AGENT-2)

**TASK-PUSH-003: Mutation updateNotificationPreferences**
- Archivos: `convex/userPreferences.ts` (crear o extender)
- Objetivo: Mutation que guarda preferencias de notificación en `user_preferences` table
- Criterio: `updateNotificationPreferences(userId, preferences)` persiste todos los tipos + quiet hours

**TASK-PUSH-004: Sync PushPreferences a Convex**
- Archivos: `components/PushPreferences.tsx`
- Objetivo: Al guardar preferencias, llamar mutation además de localStorage
- Criterio: Preferencias sobreviven cambio de dispositivo

#### FASE 2C: Filtrado en Backend (AGENT-2)

**TASK-PUSH-005: Filtrar por tipo antes de sendPush**
- Archivos: `convex/notifications.ts`, `convex/pushActions.ts`
- Objetivo: `createNotification` consulta preferencias y skip push si tipo deshabilitado
- Criterio: Usuario con `notifications.signals=false` no recibe pushes de señales

**TASK-PUSH-006: Implementar quiet hours en backend**
- Archivos: `convex/pushActions.ts`
- Objetivo: `sendPushNotification` respeta horario quieto del usuario
- Criterio: Push enviado solo entre `quietHours.start` y `quietHours.end` (o no enviado si fuera de rango)

#### FASE 2D: Realtime y Background Sync (AGENT-2)

**TASK-PUSH-007: Migrar polling a realtime Convex**
- Archivos: `hooks/useNotifications.ts`
- Objetivo: Usar suscripciones realtime de Convex en vez de `setInterval`
- Criterio: Notificaciones aparecen instantáneamente al crearse

**TASK-PUSH-008: Periodic background sync funcional**
- Archivos: `public/sw.js`
- Objetivo: `checkForUpdates()` y `syncData()` implementados
- Criterio: SW puede sincronizar datos en background

### Validación Global MEJORA 2
- `npm run lint` → 0 errores
- Push real recibido en navegador (probar local con keys generadas)
- Preferencias se guardan en Convex y sobreviven refresh
- Quiet hours respetados (verificar con logs de servidor)

---

## MEJORA 3: Gamificación Expandida

### Problema
- `reputation` almacenada pero no usada
- `accuracy` manual, no se calcula de señales
- Feature flags scattering (no centralizado)
- Beneficios Pro/Elite no aplicados en código
- Leaderboard solo por XP global
- Streak rewards limitados a XP

### Solución
Auto-calcular accuracy, feature flags centralizados, beneficios aplicados, leaderboards múltiples, streak rewards expandidos.

### Tareas Detalladas

#### FASE 3A: Feature Flags Centralizados (AGENT-3)

**TASK-GAME-001: Crear lib/features.ts**
- Archivos: `lib/features.ts` (nuevo)
- Objetivo: Sistema centralizado de feature flags por plan
- Criterio: `isFeatureEnabled(user, 'signals_feed')` → boolean
- Estructura:
```typescript
FEATURE_FLAGS = {
  signals_feed: { starter: false, pro: true, elite: true },
  ai_analysis: { starter: false, pro: true, elite: 'advanced' },
  private_communities: { starter: 0, pro: 5, elite: Infinity },
  // ...
}
```

**TASK-GAME-002: Reemplazar esPro checks scattered**
- Archivos: Múltiples (buscar todos los `esPro` checks)
- Objetivo: Centralizar checks con `isFeatureEnabled`
- Criterio: Todos los checks de plan usan `lib/features.ts`

#### FASE 3B: Accuracy Auto-calculado (AGENT-3)

**TASK-GAME-003: Recalcular accuracy desde resultados de señales**
- Archivos: `convex/signals.ts` (result mutation), `convex/profiles.ts`
- Objetivo: Cada vez que se marca resultado (profit/loss), recalcular accuracy del provider
- Criterio: `accuracy = (ganadas / total) * 100` actualizada automáticamente
- Fórmula: `accuracy = (subscribersWon / (subscribersWon + subscribersLost)) * 100`

**TASK-GAME-004: Badge award desde accuracy automático**
- Archivos: `convex/profiles.ts`, `types.ts`
- Objetivo: Cuando accuracy > 80%, dar badge 'TopAnalyst'; > 90% dar 'Whale'
- Criterio: Badges otorgados automáticamente sin intervención manual

#### FASE 3C: Beneficios Pro Aplicados (AGENT-3)

**TASK-GAME-005: Gating de signals feed**
- Archivos: `views/ComunidadView.tsx`, `views/SignalsView.tsx`
- Objetivo: Signal feed visible solo para usuarios con `isFeatureEnabled(user, 'signals_feed')`
- Criterio: Usuarios free ven banner de upgrade, no el feed

**TASK-GAME-006: Gating de private communities**
- Archivos: `views/ComunidadView.tsx`, `views/CommunityDetailView.tsx`
- Objetivo: Private communities visibles solo si `private_communities > 0`
- Criterio: Límite respetado según plan

**TASK-GAME-007: Gating de mentoring y API access**
- Archivos: `views/PricingView.tsx` (ya tiene UI, añadir lógica)
- Objetivo: Mentoring 1:1 y API Access visibles solo para Elite
- Criterio: UI coherente con feature flags

#### FASE 3D: Leaderboards y Rewards (AGENT-3)

**TASK-GAME-008: Leaderboards por tiempo**
- Archivos: `convex/gamification.ts`, `views/LeaderboardView.tsx`
- Objetivo: Tabs en LeaderboardView: Global (XP total) / Weekly / Monthly
- Criterio: Query de XP por período con `sumXP` o tabla `weeklyXP`
- UI: 3 tabs con switch animado

**TASK-GAME-009: XP multipliers**
- Archivos: `convex/gamification.ts`
- Objetivo: Campo `xpMultiplier` en usuario + lógica de weekend boost
- Criterio: Sábados y domingos 2x XP; eventos 3x configurable por admin

**TASK-GAME-010: Streak rewards expandidos**
- Archivos: `convex/gamification.ts`, `convex/lib/achievements.ts`
- Objetivo: Rewards por streak além de XP
- Criterio:
  - 7 días: badge 'Consistente'
  - 30 días: avatar frame exclusivo (guardar en `usuario.avatarFrame`)
  - 100 días: skin/comunidad exclusiva

#### FASE 3E: Reputation como Visibility Boost (AGENT-3)

**TASK-GAME-011: Usar reputation para ranking**
- Archivos: `services/ranking/feedRanker.ts`
- Objetivo: Posts de usuarios con reputation > 50 obtienen +10% visibility
- Criterio: Feed muestra posts de alta reputation ligeramente antes

### Validación Global MEJORA 3
- `npm run lint` → 0 errores
- Accuracy se actualiza al marcar resultado de señal
- Feature flags responden correctamente por plan
- Leaderboard muestra tabs Global/Weekly/Monthly
- Streak rewards desbloquean contenido

---

## División de Tareas por Agente

### AGENT-1: OPENCODE (Onboarding Reforzado)
```
TASK-OBD-001 → TASK-OBD-006
Dependencias: Ninguna
Orden: Secuencial dentro del agente (2A → 2B → 2C)
```

### AGENT-2: BIG-PICKLE (Notificaciones Push)
```
TASK-PUSH-001 → TASK-PUSH-008
Dependencias: TASK-PUSH-003 y TASK-PUSH-004 pueden esperar TASK-GAME-001
Orden: TASK-PUSH-001/002 (VAPID) → TASK-PUSH-003/004 (preferencias) → TASK-PUSH-005/006 (filtrado) → TASK-PUSH-007/008 (realtime)
```

### AGENT-3: ANTIGRAVITY (Gamificación)
```
TASK-GAME-001 → TASK-GAME-011
Dependencias: Ninguna
Orden: TASK-GAME-001 (features) → TASK-GAME-002 → TASK-GAME-003/004 → TASK-GAME-005/006/007 → TASK-GAME-008/009/010 → TASK-GAME-011
```

---

## MEJORA 4: CALIDAD DEL CÓDIGO (Code Quality Sprint)
**Estado: PENDIENTE DE INICIO**

### Arquitectura del Plan de Calidad

| Agente | Fase | Tracks | Tasks |
|--------|------|--------|-------|
| AGENT-A | 1, 2, 3 | Security Auth + Perf N+1 | AUTH-001, PERF-001, MEM-001, IDX-001, TEST-004 |
| AGENT-B | 1, 2, 3 | CI/CD + Multi-file Auth + Perf | CLOUD-001, TEST-003, AUTH-002, PERF-002, TEST-005 |
| AGENT-C | 1, 2 | Internal Mutations + API Keys | SEED-001, AUTH-003, API-001 |
| AGENT-D | 1 | React.memo + Polish | MEMO-001, POLISH-001 |

### Arquitectura de Ejecución

```
SESIÓN 1 (Fase 1 - Paralelo total, 4 tracks):
  ├─ AGENT-A → MEM-001 + IDX-001 → commit "perf: fix memory leaks + add missing DB indexes"
  ├─ AGENT-B → CLOUD-001 + TEST-003 → commit "ci: add lint + audit to CI + E2E skeleton"
  ├─ AGENT-C → SEED-001 → commit "security: convert seed mutations to internal"
  └─ AGENT-D → MEMO-001 → commit "perf: add React.memo to large components"

SESIÓN 2 (Fase 2 - Paralelo, 3 tracks):
  ├─ AGENT-A → AUTH-001 → commit "security: fix auth ownership in posts.ts"
  ├─ AGENT-B → AUTH-002 → commit "security: fix auth ownership across backend"
  └─ AGENT-C → AUTH-003 + API-001 → commit "security: move API keys to server-side relay"

SESIÓN 3 (Fase 3 - Paralelo, 2 tracks):
  ├─ AGENT-A → PERF-001 (batch only) → commit "perf: batch profile lookups in posts.ts"
  └─ AGENT-B → PERF-002 → commit "perf: batch lookups in communities.ts"

SESIÓN 4 (Fase 3 - Continuar):
  └─ AGENT-A → PERF-001 (pagination) + PERF-003 → commit "perf: native cursor pagination in posts + profiles"

SESIÓN 5 (Fase 4 - Paralelo, 2 tracks):
  ├─ AGENT-A → TEST-004 → commit "test: gamification + achievements + signalsRanker tests"
  └─ AGENT-B → TEST-005 + POLISH-001 → commit "test: signalsRanker tests + optimistic updates"
```

### Validación por Fase

| Fase | Validación |
|------|-----------|
| **Fase 1** | `npm run lint` + `npm run test:run` + memory profiler en dev |
| **Fase 2** | Manual: probar crear/editar/borrar como usuario diferente → debe fallar con 403 |
| **Fase 3** | Benchmark: medir latency de queries antes/después con 100+ posts |
| **Fase 4** | `npm run test:coverage` debe pasar thresholds actualizados (líneas 70%) |

### Archivos Clave — Análisis Previo

#### N+1 Query Patterns (CRÍTICOS)
| File | Line | Patrón | Query Count (worst) | Fix |
|------|------|--------|--------------------|-----|
| convex/posts.ts | 24-29 | Promise.all profile lookup | 20/page | Batch Map lookup |
| convex/posts.ts | 86-94 | collect() + slice() | Todos los posts | Convex paginate() |
| convex/communities.ts | 187-192 | Promise.all community lookup | N=memberships | ctx.db.getMany() |
| convex/communities.ts | 640-656 | Promise.all member profile lookup | N=members | Batch filter/or |

#### Auth Ownership (CRÍTICOS — 18 vulnerabilidades HIGH)
| File | Mutation | Missing Check |
|------|----------|---------------|
| posts.ts:312 | updatePost | ctx.auth.getUserIdentity() |
| posts.ts:488 | deletePost | args.adminId del cliente (IDOR) |
| profiles.ts:174 | updateProfile | Sin auth alguno |
| signals.ts:324 | updateSignalStatus | Sin ownership check |
| videos.ts:37 | deleteVideo | Sin auth alguno |
| comunidades.ts:324 | likePost | Sin auth alguno |

#### Memory Leaks (CRÍTICO)
| File | Line | Bug |
|------|------|-----|
| hooks/useEngagementTracker.ts | 127-128 | clearInterval faltante (usa clearTimeout) |

### Dependencias Entre Tasks

```
MEM-001 ──┐
IDX-001 ──┼──→ PERF-001 → PERF-003 → TEST-004
SEED-001 ─┤
MEMO-001 ─┘

AUTH-001 ─┐
AUTH-002 ─┼──→ AUTH-003 ──→ API-001
SEED-001 ─┘

CLOUD-001 ─┐
TEST-003 ──┼──→ TEST-005
TEST-004 ──┘

MEMO-001 ──→ POLISH-001
```

---

## Criterios de Aceptación del Plan Completo

1. Las 3 mejoras implementadas con lint sin errores
2. Tests pasan: `npm run test:run`
3. No regressions en features existentes
4. Feature flags centralizados y usados consistentemente
5. Onboarding completo ejecutable sin errores
6. Push notifications funcionales en staging
7. Gamificación con accuracy automático y leaderboards múltiples
8. **Calidad**: 0 vulnerabilidades HIGH de auth (AUTH-001/002), 0 memory leaks (MEM-001), coverage ≥70% líneas, lint en CI

---

## Notas de Coordinación

- **Git strategy**: Cada agente trabaja en su directorio de mejoras sin conflictar
- **Code review**: Antes de merge, ejecutar `npm run lint` localmente
- **AGENT_LOG.md**: Cada agente documenta progreso en `.agent/workspace/coordination/AGENT_LOG.md`
- **TASK_BOARD.md**: Tasks creadas con prefijo OBD/PUSH/GAME para las 3 mejoras + MEM/IDX/CLOUD/TEST/SEED/MEMO/AUTH/API/PERF/POLISH para calidad
- **Calidad Sprint**: Risk appetite ALTO, equipo completo. Commits separados por archivo para facilitar rollback en PERFORMANCE (Fase 3)
- **Validación manual de auth**: Después de AUTH-001/002, probar manualmente: crear post como USER_A → intentar editar/borrar como USER_B → debe retornar 403

---

## Prioridad de Inicio Recomendada

1. **AGENT-1** (Onboarding) — Componentes muertos ya existen, wiring rápido, alto impacto inmediato
2. **AGENT-3** (Gamificación) — Sistema maduro, solo expandir features, impacto en engagement
3. **AGENT-2** (Push) — Más complejo, requiere coordinación VAPID + backend + frontend

---

## 🚀 Roadmap de Infraestructura - TradePortal 2025

### Estado Actual del Proyecto
- **Arquitectura**: Monolítica (Node.js + Express + MongoDB + WebSockets)
- **Deployment**: Vercel (serverless functions)
- **Caching**: Redis-ready (configuración pendiente)

### ¿Por qué mejorar la infraestructura?
Actualmente TradePortal funciona bien como MVP, pero para escalar a **10,000+ usuarios activos** y manejar el volumen de trading en tiempo real, necesitamos una infraestructura más robusta. Los consejos de infraestructura cloud-native nos ayudará a:

- **Escalar automáticamente** según la demanda
- **Reducir latencia** para operaciones de trading
- **Mejorar seguridad** con Zero-Trust
- **Optimizar costos** con auto-scaling y Spot instances

---

### 📋 Plan de Implementación por Fases

#### ✅ Fase 1: Dockerización y CI/CD (INMEDIATO - 2 semanas)
**Objetivo:** Contenedorizar la aplicación y establecer pipeline de deployment automatizado.

| Item | Descripción | Estado |
|------|-------------|--------|
| Dockerfile | Contenedor multi-stage optimizado para producción | Pendiente |
| docker-compose.yml | Desarrollo local containerizado | Pendiente |
| GitHub Actions | Pipeline: test → security → build → deploy | Pendiente |
| SAST | Security scanning en CI (Dependency Check) | Pendiente |

**Comandos Docker sugeridos:**
```bash
# Build
docker build -t tradeportal:latest .

# Run local
docker-compose up -d

# Push to registry
docker push registry.tradeportal.com/tradeportal:latest
```

**Pipeline CI/CD propuesto:**
```yaml
# .github/workflows/deploy.yml
stages:
  - test (unit + integration)
  - security-scan (SAST, Dependency Scanning)
  - build (Docker image)
  - deploy-staging
  - integration-tests
  - deploy-production
```

---

#### 🔄 Fase 2: Kubernetes con Auto-scaling (CORTO PLAZO - 1 mes)
**Objetivo:** Migrar a K8s para manejo dinámico de carga.

| Item | Descripción | Estado |
|------|-------------|--------|
| K8s Deployment | Manifests para desplegar en cluster | Pendiente |
| HPA | HorizontalPodAutoscaler (min: 3, max: 50 replicas) | Pendiente |
| Service Mesh | Istio para comunicación segura entre servicios | Pendiente |
| Ingress | Controller para routing externo | Pendiente |

**Configuración de Auto-scaling:**
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: trading-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: trading-api
  minReplicas: 3
  maxReplicas: 50
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

---

#### 💾 Fase 3: Base de Datos y Caching (MEDIO PLAZO - 2 meses)
**Objetivo:** Optimizar rendimiento de base de datos y caché.

| Item | Descripción | Prioridad | Estado |
|------|-------------|----------|--------|
| Redis | Cache de sesiones y datos en tiempo real | Alta | Pendiente |
| Read Replicas | Para queries analíticos pesados | Media | Pendiente |
| Sharding | Datos de trading por símbolo/región | Baja | Pendiente |
| CDC | Change Data Capture para sincronización | Baja | Pendiente |

**Stack de caching propuesto:**
```yaml
# Redis Cluster para alta disponibilidad
redis:
  mode: cluster
  nodes: 3
  maxmemory: 2gb
  evictionPolicy: allkeys-lru
```

---

#### 📊 Fase 4: Monitoreo y Observabilidad (MEDIO PLAZO - 1 mes)
**Objetivo:** Visibilidad completa del sistema.

| Componente | Herramienta | Propósito |
|------------|-------------|-----------|
| Metrics | Prometheus | Recolección de métricas |
| Visualización | Grafana | Dashboards en tiempo real |
| Tracing | Jaeger | Distributed tracing |
| Logs | Loki | Agregación de logs |
| Alertas | AlertManager | Notificaciones proactivas |

**Dashboards sugeridos:**
- Trading performance (latencia, throughput)
- Sistema (CPU, memoria, red)
- Negocio (usuarios activos, transacciones)
- Seguridad (intentos de login, rate limits)

---

#### 🔐 Fase 5: Seguridad Enterprise (LARGO PLAZO - 3 meses)
**Objetivo:** Protegernos contra amenazas y cumplir estándares.

| Item | Descripción | Prioridad | Estado |
|------|-------------|----------|--------|
| API Gateway | Kong / AWS API Gateway | Rate limiting, auth | Pendiente |
| WAF | Web Application Firewall | Protección contra ataques | Pendiente |
| Zero-Trust | Arquitectura basada en identidad | Seguridad | Pendiente |
| Secrets | HashiCorp Vault / AWS Secrets Manager | Gestión de secretos | Pendiente |

**Arquitectura Zero-Trust propuesta:**
```
Usuario → WAF → API Gateway → [Auth Service] → Microservicio
                                   ↓
                            Identity Provider (OAuth2/OIDC)
```

---

### 💰 Optimización de Costos

| Estrategia | Ahorro estimado |
|------------|-----------------|
| Spot Instances ( workloads no críticos) | 60-70% |
| Auto-scaling (solo cuando se necesita) | 30-40% |
| Reserved Instances (base stable) | 20-30% |
| Resource Quotas por namespace | 15-25% |
| **Total potencial** | **40-60%** |

---

### 📈 Métricas Objetivo

| Métrica | Actual | Objetivo | Plazo |
|---------|--------|----------|-------|
| Uptime | 99.5% | 99.9% | 6 meses |
| Latencia p50 | 200ms | <50ms | 3 meses |
| Latencia p99 | 800ms | <200ms | 3 meses |
| Tiempo de deploy | Manual | <5 min | 1 mes |
| Coste mensual | $XXX | -30% con auto-scaling | 6 meses |

---

### 👥 Responsables Sugeridos

| Rol | Responsabilidades |
|-----|-----------------|
| **Infra Lead** | Diseño Kubernetes, CI/CD, arquitectura |
| **DevOps** | Pipeline, monitoreo, automation |
| **Backend Dev** | Microservicios, database optimization |
| **Security** | Zero-trust, secrets, compliance |

---

### 🔗 Recursos Externos

- **Kubernetes**: https://kubernetes.io/docs/
- **Docker**: https://docs.docker.com/
- **Prometheus**: https://prometheus.io/docs/
- **Grafana**: https://grafana.com/docs/
- **Istio**: https://istio.io/latest/docs/

---

*Última actualización: 2026-03-26 | Traducido y expandido para el equipo*

---

## 💳 Mejoras de MercadoPago - TradePortal 2025

### Estado Actual (Verificado 26-Marzo-2026)

| Componente | Estado | Ubicación |
|------------|--------|------------|
| Backend (mercadopago.ts) | ✅ Implementado | `convex/lib/mercadopago.ts` |
| API Endpoint | ✅ Implementado | `server.ts:1066` |
| Webhook Handler | ✅ Implementado | `server.ts:1072` |
| Frontend (PaymentModal) | ✅ Implementado | `src/components/PaymentModal.tsx` |
| Tabla payments | ✅ Implementada | `convex/schema.ts:408` |
| Schema subscriptions | ✅ Implementado | `convex/schema.ts:429` |
| Saldo usuario | ✅ Implementado | `profiles.saldo` |

### Funcionalidades Disponibles
- ✅ Pagos simples (`processPayment`)
- ✅ Preferencias de checkout (`createPreference`)
- ✅ Órdenes (`createOrder`)
- ✅ Suscripciones (`createSubscription`)
- ✅ Devoluciones (`refundPayment`)
- ✅ Historial de pagos por usuario

### Tareas Pendientes para Producción

#### MP-ENH-001: Componente UserWallet
- **Descripción**: Crear componente de wallet con balance y depósito
- **Archivos**: `src/components/payments/UserWallet.tsx`
- **Estado**: Pendiente
- **DEPENDENCIAS**: Ninguna

#### MP-ENH-002: Hook useMercadoPago
- **Descripción**: Hook personalizado para facilitar integraciones
- **Archivos**: `src/hooks/useMercadoPago.ts`
- **Estado**: Pendiente

#### MP-ENH-003: Actualizar Balance Post-Pago
- **Descripción**: Cuando webhook confirma pago, actualizar saldo del usuario
- **Archivos**: `server.ts`, `convex/profiles.ts`
- **Lógica**: webhook approved → obtener externalReference → patch user.saldo += amount
- **Estado**: Pendiente

#### MP-ENH-004: Plan IDs de Suscripción
- **Descripción**: Obtener y configurar MP_PLAN_BASIC, MP_PLAN_PRO, MP_PLAN_VIP desde MercadoPago Dashboard
- **Estado**: Pendiente (requiere cuenta Business)

#### MP-ENH-005: Webhook Signature Validation
- **Descripción**: Implementar validación HMAC en webhook handler
- **Estado**: Parcial (ya implementado en server.ts)
- **MEJORAR**: Agregar logging detallado y alertas

### Flujo de Pago Actual
```
1. usuario presiona "Depositar" 
2. Frontend llama /api/mercadopago/preference
3. Backend crea preference en MP y retorna init_point
4. Usuario redirected a MercadoPago
5. Usuario completa pago
6. MP envía webhook a /webhooks/mercadopago
7. Server procesa y guarda en tabla payments
8. (Falta) Actualizar saldo del usuario
```

### Para Implementar el Flujo Completo

```typescript
// En server.ts - handleMercadoPagoWebhook - mejorar para actualizar saldo
if (payment.status === 'approved') {
  const userId = payment.external_reference?.split('_')[0];
  if (userId) {
    // 1. Obtener payment de la DB por external_reference
    // 2. Patch user.saldo += payment.amount
  }
}
```

---

*Estado: 2026-03-26*
