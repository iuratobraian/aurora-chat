# TradeShare - Implementation Plan

**Fecha:** 21/03/2026  
**Versión:** 1.0  
**Estado:** En progreso

---

## 📊 Resumen Ejecutivo

TradeShare es una plataforma de comunidad de trading con características de trading social, educación, y monetización. Este plan define las próximas iteraciones para llevar el producto de su estado actual a producción estable.

## ✅ Estado Actual

### Completado Recientemente

| Categoría | Items |
|-----------|-------|
| **AI Platform** | Rate limiter, Aurora Support, Morning Briefing, Daily Coach, External Agents |
| **Performance** | Convex singleton, WebSocket reconnection, Retry library, Query optimization |
| **Ranking** | 8 surfaces implementadas (feed, comments, signals, discover, profile, notifications, search, academia) |
| **UX/UI** | Onboarding mejorado, session persistence, admin community creation |
| **Documentation** | Ranking surfaces, product shell hierarchy, brand book |

### Pendiente

| Prioridad | Tareas |
|-----------|--------|
| 🔴 Alta | PAY-001 (Backend pagos), PWA Offline, Testing E2E |
| 🟡 Media | Feed ranking UI, Trust layer, Creator flywheel |
| 🟢 Baja | Marketing automation, Future products specs |

---

## 🎯 Sprint 1: Foundation (Completado)

### Objetivos
- [x] Sistema de ranking completo
- [x] Agentes IA externos
- [x] Persistencia de sesión
- [x] Performance optimizations

### Entregables
- 8 surfaces de ranking implementadas
- 3 agentes IA (Community, Onboarding, Search)
- Login persiste 7 días
- UI carga en ~1.5s

---

## 🎯 Sprint 2: Payments & Testing

### Objetivos
- Cerrar runtime de pagos con webhooks
- Tests end-to-end para flujos críticos
- Optimización de queries Convex

### Tareas

#### PAY-001: Backend de Pagos
**Owner:** AGENT-STABILITY  
**Scope:** server.ts, webhooks, runtime  
**Entregables:**
- Webhook handler para MercadoPago
- Webhook handler para Zenobank
- Idempotencia verificada
- Runtime ejecutable 24/7

**Pasos:**
1. Implementar handlers de webhook
2. Agregar verification de firmas
3. Configurar retry logic
4. Deploy a producción
5. Monitoring y alertas

#### ST3: Tests E2E Playwright
**Owner:** AGENT-STABILITY  
**Scope:** tests/e2e/  
**Entregables:**
- Login flow
- Create post flow
- Navigation flow
- Community join flow

#### ST5: Query Optimization
**Owner:** AGENT-STABILITY  
**Scope:** convex/  
**Entregables:**
- Reducir reads en queries frecuentes
- Implementar pagination
- Agregar índices

---

## 🎯 Sprint 3: Product Core

### Objetivos
- PWA con offline mode
- Feed ranking con feedback visual
- Trust layer implementado
- Creator dashboard mejorado

### Tareas

#### ST11: PWA Offline Mode
**Owner:** AGENT-EXPERIENCE  
**Scope:** service worker, cache strategy  
**Entregables:**
- Service worker configurado
- Cache strategy implementada
- Offline fallback UI
- Background sync

#### CORE-002A: Feed Ranking UI
**Owner:** AGENT-EXPERIENCE  
**Scope:** ComunidadView, PostCard  
**Entregables:**
- Visual indicators de ranking
- Boost badges en posts
- Filter controls
- Sort options

#### CORE-003A: Trust Score Layer
**Owner:** AGENT-EXPERIENCE  
**Scope:** ProfileView, signals, posts  
**Entregables:**
- Trust tier visible
- Author verification badges
- Content quality indicators

#### CORE-006A: Creator Flywheel
**Owner:** AGENT-EXPERIENCE  
**Scope:** CreatorDashboard, distribution  
**Entregables:**
- Distribution metrics
- Content calendar
- Engagement tools

---

## 🎯 Sprint 4: Growth & AI

### Objetivos
- Analytics en admin
- Marketing automation
- Idea lab para productos futuros

### Tareas

#### ST12: Analytics Dashboard
**Owner:** AGENT-GROWTH-AI  
**Scope:** AdminView, services/analytics  
**Entregables:**
- Usage metrics
- Engagement rates
- Conversion funnels
- DAU/MAU tracking

#### MKT-006: Marketing Automation
**Owner:** AGENT-GROWTH-AI  
**Scope:** scripts/marketing/, social accounts  
**Entregables:**
- Content calendar automation
- Social posting
- Growth loops
- Reporting

#### FUT-003: Idea Lab
**Owner:** AGENT-GROWTH-AI  
**Scope:** docs/, future_products/  
**Entregables:**
- 50 ideas priorizadas
- Top 5 specs ejecutables
- Product roadmap

---

## 🔧 Stack Técnico

### Frontend
- React 18 + TypeScript
- Vite (build)
- Tailwind CSS
- React Router v6

### Backend
- Express.js (API)
- Convex (Database + Real-time)
- Vercel (hosting)

### External Services
- OpenAI / Anthropic / Google AI
- MercadoPago
- Zenobank
- Binance (market data)

---

## 📈 Métricas de Éxito

| Sprint | Métrica | Target |
|--------|---------|--------|
| 2 | Payment success rate | > 99% |
| 2 | E2E test coverage | > 80% flows |
| 3 | PWA Lighthouse score | > 90 |
| 3 | Feed engagement | +20% |
| 4 | DAU/MAU ratio | > 30% |

---

## 🚀 Deployment Checklist

- [ ] npm run lint (0 errores)
- [ ] npm run test:run (todos pasan)
- [ ] npm run build (successful)
- [ ] Convex deploy
- [ ] Vercel deploy --prod
- [ ] Smoke tests en producción

---

## 📝 Notas

### Dependencias
- PAY-001 debe completarse antes de MKT-008 (Revenue architecture)
- ST5 (Query optimization) habilita ST11 (PWA)
- CORE-002A requiere FEED_RANKING_SURFACES.md (completado ✅)

### Bloqueos
- Ninguno actualmente

---

## 🔗 Referencias

- Task Board: `.agent/workspace/coordination/TASK_BOARD.md`
- Ranking Spec: `.agent/workspace/plans/FEED_RANKING_SURFACES.md`
- Shell Hierarchy: `.agent/workspace/plans/PRODUCT_SHELL_HIERARCHY.md`
- Agent Orders: `.agent/ORDEN_AGENTE_ANTIGRAVITI.md`
