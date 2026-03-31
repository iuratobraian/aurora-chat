# 🎯 PLAN MAESTRO — TradeShare Launch

> **Objetivo:** Dejar la web 100% funcional para lanzamiento
> **Fecha de inicio:** 2026-03-31
> **Fuente de verdad:** Notion (https://www.notion.so/33142b008df080f8b6b3db69d36e84d5)

---

## 📊 Resumen Ejecutivo

| Sector | Tareas | Críticas | Altas | Estado |
|--------|--------|----------|-------|--------|
| Auth & Profiles | 7 | 2 | 3 | ⏳ Backlog |
| Communities & Subcommunities | 11 | 3 | 7 | ⏳ Backlog |
| Payments & Subscriptions | 7 | 4 | 3 | ⏳ Backlog |
| Content & Psicotrading | 5 | 0 | 3 | ⏳ Backlog |
| Admin Panel | 8 | 3 | 4 | ⏳ Backlog |
| Bitácora & Data Validation | 4 | 1 | 2 | ⏳ Backlog |
| Optimization & Launch | 6 | 3 | 2 | ⏳ Backlog |
| Agent Coordination | 3 | 0 | 1 | ⏳ Backlog |
| **TOTAL** | **52** | **16** | **25** | ⏳ Backlog |

---

## 🏗️ Arquitectura de Sectores (Anti-Conflict)

Cada sector tiene archivos y responsabilidades separadas para que los agentes no se pisen:

### SECTOR 1: Auth & User Management
- **Archivos:** `src/services/auth/`, `src/services/users/`, `src/views/PerfilView.tsx`, `src/components/AuthModal.tsx`
- **Convex:** `convex/auth.ts`, `convex/profiles.ts`
- **Agentes:** Auth Agent + Profile Agent
- **Delegación:** Cada uno puede usar 2 sub-agentes

### SECTOR 2: Communities & Subcommunities
- **Archivos:** `src/views/ComunidadView.tsx`, `src/views/CommunityDetailView.tsx`, `src/views/subcommunity/`, `src/components/CommunityAdminPanel.tsx`
- **Convex:** `convex/communities.ts`, `convex/subcommunities.ts`, `convex/subcommunityChat.ts`, `convex/subcommunityInvites.ts`
- **Agentes:** Community Agent + Subcommunity Agent
- **Delegación:** Cada uno puede usar 2 sub-agentes

### SECTOR 3: Payments & Subscriptions
- **Archivos:** `src/views/PricingView.tsx`, `src/views/CheckoutSuccessView.tsx`, `src/components/PaymentButton.tsx`
- **Convex:** `convex/payments.ts`, `convex/subscriptions.ts`, `convex/paymentOrchestrator.ts`, `convex/mercadopagoApi.ts`
- **Server:** `server.ts` (rutas de MercadoPago, webhooks)
- **Agentes:** Payments Agent + Subscriptions Agent
- **Delegación:** Cada uno puede usar 2 sub-agentes

### SECTOR 4: Content & Psicotrading
- **Archivos:** `src/views/PsicotradingView.tsx`, `src/views/CursosView.tsx`, `src/views/AcademiaView.tsx`, `src/services/youtube/`
- **Convex:** `convex/videos.ts`, `convex/posts.ts`, `convex/crons.ts`
- **Agentes:** Content Agent + Psicotrading Agent
- **Delegación:** Cada uno puede usar 2 sub-agentes

### SECTOR 5: Admin Panel
- **Archivos:** `src/views/AdminView.tsx`, `src/components/admin/`
- **Convex:** `convex/schema.ts` (solo si necesita cambios), todos los archivos de convex para CRUD
- **Agentes:** Admin Agent
- **Delegación:** Puede usar 2 sub-agentes (CRUD users, CRUD communities)

### SECTOR 6: Bitácora & Data Validation
- **Archivos:** `src/views/BitacoraView.tsx`, `src/services/bitacora/`
- **Convex:** `convex/traderVerification.ts`, `convex/stats.ts`
- **Agentes:** Bitacora Agent
- **Delegación:** Puede usar 2 sub-agentes (conexión, validación)

### SECTOR 7: Optimization & Launch
- **Archivos:** Todos los que necesiten optimización
- **Agentes:** Performance Agent + Security Agent
- **Delegación:** Cada uno puede usar 2 sub-agentes

### SECTOR 8: Agent Coordination
- **Archivos:** `.agent/workspace/coordination/`, `.agent/skills/`
- **Agentes:** Coordinator Agent (Aurora)

---

## 🚦 Orden de Ejecución

### FASE 1: Cimientos (Semana 1) — CRÍTICO
1. **Resolver bloqueos técnicos** → Fix merge conflicts, deploy Convex, fix build
2. **Auth funcional** → Login, registro, sesiones persistentes
3. **Payments funcional** → MercadoPago working, webhooks, checkout
4. **Control de acceso** → Solo suscriptos entran a comunidades

### FASE 2: Core Features (Semana 2) — ALTA PRIORIDAD
5. **Communities completas** → Crear, unirse, publicar, comentar
6. **Subcommunities** → Crear, gestionar, contenido
7. **Suscripciones a la carta** → Elegir servicios, botones de pago
8. **Perfiles Landing Page** → Bio, stats, links compartibles

### FASE 3: Content & Engagement (Semana 3) — MEDIA PRIORIDAD
9. **Academia en comunidades** → Cursos, mentorías
10. **Psicotrading Shorts** → Videos filtrados estilo TikTok
11. **Sistema de puntos** → XP, ranking, gamification
12. **TV Live privada** → Para comunidades

### FASE 4: Polish & Launch (Semana 4) — PRE-LANZAMIENTO
13. **Admin panel completo** → Full-width, CRUD total
14. **Bitácora verificada** → Sync automática, perfiles premium
15. **Optimización** → Performance, security audit, tests
16. **Launch prep** → SEO, analytics, meta tags

---

## 🐝 Reglas de Delegación (Colmena)

Cada agente puede delegar a **2 sub-agentes** por tarea:

```
Agente Principal
├── Sub-agente 1 → Tarea específica A
└── Sub-agente 2 → Tarea específica B
```

### Ejemplo:
```
Community Agent (TSK-010: Crear comunidad)
├── Sub-agent 1 → UI del formulario de creación
└── Sub-agent 2 → Convex mutation + validaciones
```

### Reglas:
1. El agente principal **siempre** coordina
2. Los sub-agentes **no** tocan los mismos archivos
3. El agente principal **integra** los cambios
4. Todo se documenta en `AGENT_HIVE.md`

---

## 🧠 Uso de Aurora

- **Consultar antes de bloquearse** → Aurora tiene contexto del proyecto
- **Usar para code review** → Aurora revisa cambios antes de commit
- **Usar para debugging** → Aurora ayuda a encontrar errores
- **Documentar soluciones** → Guardar en knowledge base del Hive

---

## 📝 Documentación Obligatoria

Cada agente debe:

1. **Al resolver algo importante** → Crear entry en `AGENT_HIVE.md` → Knowledge Base
2. **Al tener una duda** → Publicar en `AGENT_HIVE.md` → Q&A
3. **Al terminar tarea** → Publicar daily update en `AGENT_HIVE.md`
4. **Al delegar** → Registrar delegación en `AGENT_HIVE.md`

### Skills de Conocimiento

Crear skills reutilizables en `.agent/skills/technical/` para:
- Patrones de auth
- Integración MercadoPago
- Creación de comunidades
- Sistema de permisos
- Optimizaciones de performance
- Patrones de UI reutilizables

---

## ⚠️ Bloqueos Actuales

| Bloqueo | Impacto | Solución |
|---------|---------|----------|
| Merge conflict en `storage.ts` | Build falla | ✅ Resuelto |
| Convex `_generated` no existe | Dev server no arranca | Deploy Convex |
| API keys expuestas en repo | Seguridad | Rotar keys |
| JWT secret fallback débil | Auth vulnerable | Fix en server.ts |
| Webhook parser conflict | Pagos pueden fallar | Fix orden de middleware |

---

## 🎯 Definición de "Listo"

Una tarea está **DONE** cuando:

1. ✅ Código implementado y funcional
2. ✅ `npm run lint` pasa sin errores
3. ✅ Tests relevantes pasan
4. ✅ No hay archivos modificados prohibidos
5. ✅ No hay mocks/placeholders/toasts "en desarrollo"
6. ✅ Documentado en `AGENT_HIVE.md`
7. ✅ Marcado como "Listo" en Notion
8. ✅ Commit y push realizados

---

*Plan creado: 2026-03-31*
*Última actualización: 2026-03-31*
