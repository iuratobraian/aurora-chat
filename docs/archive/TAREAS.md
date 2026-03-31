# 📋 TAREAS - TradeHub 2026

## 📌 ÚLTIMA ACTUALIZACIÓN: 20/03/2026 - AGENT-3 PWA & TARGETING COMPLETADOS

---

## ✅ COMPLETADO (v1.0 - Sesiones Anteriores)

1. [x] **Restauración UI "Top"**: Recuperadas las Zonas Operativas, el Chat Global y el cargador eléctrico original.
2. [x] **Recuperación de Datos**: Reconexión exitosa a la base de datos de producción `rapid-rabbit-951`.
3. [x] **Estándar Visual Premium**: Creado el Skill `guia_visual` para mantener el estilo "Salud del Servidor" en toda la web.
4. [x] **Auth en Mutations**: 15 mutations protegidas con `ctx.auth.getUserIdentity()`
5. [x] **Stripe Checkout**: `convex/payments.ts`, `convex/webhooks.ts`
6. [x] **Búsqueda Comunidades**: `components/CommunitySearch.tsx`, `views/DiscoverCommunities.tsx`
7. [x] **Reviews System**: `convex/reviews.ts`, `components/CommunityReviews.tsx`
8. [x] **Rate Limiting**: `convex/lib/rateLimit.ts`, tabla `rateLimits` en schema
9. [x] **Onboarding Flow**: `components/OnboardingFlow.tsx`, 5 pasos
10. [x] **Toast Notifications**: `components/ToastProvider.tsx`, 4 tipos

---

## 🚀 PLAN v2.0 - TAREAS PENDIENTES

### 🎮 AGENT-2: PLATFORM FEATURES

| # | Tarea | Estado |
|---|-------|--------|
| 2.1 | Schema: competitions + trader_verification + user_preferences | ✅ Completado |
| 2.2 | CompetitionsView: Coming Soon UI + waitlist | ✅ Completado |
| 2.5 | Schema: trader_verification (ya en 2.1) | ✅ Completado |
| 2.6 | VerificationPanel + VerificationBadge components | ✅ Completado |
| 2.11 | i18n: Setup ES/EN/PT + translations | ✅ Completado |
| 2.12 | i18n: EN + PT translations | ✅ Completado |
| 2.13 | LanguageSelector component | ✅ Completado |
| 2.9 | Theme improvements (dark/light/system) | ✅ Completado |
| 2.10 | Appearance Settings panel | ✅ Completado |
| 2.7, 2.8 | KYC upload + Broker verification | ✅ Completado |
| 2.3, 2.4 | Sistema participación + Leaderboard | ✅ Completado |

**Archivos creados Agent-2:**
- `convex/schema.ts` - tablas competitions, trader_verification, user_preferences
- `convex/competitions.ts` - queries y mutations
- `convex/traderVerification.ts` - queries y mutations
- `convex/userPreferences.ts` - queries y mutations
- `i18n/index.ts`, `es.json`, `en.json`, `pt.json`
- `views/CompetitionsView.tsx` - con participación y leaderboard
- `components/LanguageSelector.tsx`, `VerificationBadge.tsx`, `VerificationPanel.tsx`
- `components/ThemeSelector.tsx`, `AppearancePanel.tsx`
- `components/KYCUpload.tsx`, `BrokerConnect.tsx`
- `components/JoinCompetition.tsx`, `Leaderboard.tsx`

---

### 🏆 AGENT-1: MARKET INTELLIGENCE ✅ COMPLETADO

| # | Tarea | Descripción | Prio | Estado |
|---|-------|-------------|------|--------|
| 1.1 | Schemas: economic_calendar + market_news | Crear tablas en schema.ts | P0 | ✅ Completado |
| 1.2 | CalendarioView | Vista mensual + diaria con filtros | P0 | ✅ Completado |
| 1.3 | Investing.com RSS | Integración con feeds RSS | P0 | ✅ Completado |
| 1.4 | MyFXBook API | Integración alternativa | P1 | ⏭️ Omitido (RSS suficiente) |
| 1.5 | NewsHubView | Vista principal de noticias | P0 | ✅ Completado |
| 1.6 | NewsCard + Categorías | Componentes de noticias | P0 | ✅ Completado |
| 1.7 | AI Agent Feed Sector | Sector dedicado para posts IA | P1 | ✅ Integrado en CalendarioView |
| 1.8 | Cron jobs | Actualización automática de datos | P0 | ✅ Completado |
| 1.9 | Filtros y búsqueda | Búsqueda avanzada en noticias | P1 | ✅ Completado |

**Archivos creados Agent-1:**
- `convex/schema.ts` - tablas economic_calendar, market_news, news_sources
- `convex/market/economicCalendar.ts` - Queries + RSS sync
- `convex/market/marketNews.ts` - News aggregation + sentiment analysis
- `views/CalendarioView.tsx` - Economic calendar UI (actualizado)
- `views/NewsHubView.tsx` - News hub UI (nuevo)
- `convex/crons.ts` - Actualizado con sync hourly jobs

---

### 📱 AGENT-3: MOBILE & ADS

| # | Tarea | Descripción | Prio | Estado |
|---|-------|-------------|------|--------|
| 3.1 | PWA manifest | Manifest + iconos | P0 | ✅ Completado |
| 3.2 | Service worker | SW mejorado con cache | P0 | ✅ Completado |
| 3.3 | Offline mode | Funcionar sin conexión | P1 | ✅ Completado |
| 3.4 | Install prompt | Prompt de instalación PWA | P0 | ✅ Completado |
| 3.5 | Push setup | Configuración de notificaciones | P0 | ✅ Completado |
| 3.6 | Push preferences UI | UI de preferencias de push | P0 | ✅ Completado |
| 3.7 | Schema: ad_auctions | Tablas de subastas | P0 | ✅ Completado |
| 3.8 | Auction dashboard UI | Dashboard de subastas | P0 | ✅ Completado |
| 3.9 | Bidding system | Sistema de pujas | P1 | ✅ Completado |
| 3.10 | Real-time updates | Actualizaciones en tiempo real | P2 | ✅ Completado |
| 3.11 | Ad targeting | Sistema de targeting | P1 | ✅ Completado |

---

### 🤖 AGENT-3: INSTAGRAM AUTOMATION (NEW)

| # | Tarea | Descripción | Prio | Estado |
|---|-------|-------------|------|--------|
| IG1 | Schema: Tablas Instagram | instagram_accounts, scheduled_posts, templates, reply_rules | P0 | ✅ Completado |
| IG2 | Instagram API Client | Cliente Graph API con rate limiting | P0 | ✅ Completado |
| IG3 | Account Connection | OAuth flow + token management | P0 | ✅ Completado |
| IG4 | Backend Functions | CRUD posts, scheduler, analytics | P0 | ✅ Completado |
| IG5 | AI Content Generator | OpenAI/Anthropic/Google integration | P1 | ✅ Completado |
| IG6 | InstagramDashboard View | Panel principal UI | P1 | ✅ Completado |
| IG7 | Scheduler Engine | Cron jobs para auto-publishing | P0 | ✅ Completado |
| IG8 | Content Templates | Plantillas de contenido | P2 | ✅ Completado |
| IG9 | Auto-reply Rules | Motor de respuestas automáticas | P1 | ✅ Completado |
| IG10 | Instagram Inbox UI | Gestión de mensajes | P1 | ✅ Completado |
| IG11 | Analytics Dashboard | Estadísticas de Instagram | P1 | ✅ Completado |

**Archivos creados:**
- `convex/schema.ts` - tablas instagram_accounts, instagram_scheduled_posts, instagram_content_templates, instagram_auto_reply_rules, instagram_analytics, instagram_ai_queue, instagram_messages
- `convex/instagram/accounts.ts` - Account management + OAuth
- `convex/instagram/posts.ts` - Scheduled posts CRUD
- `convex/instagram/scheduler.ts` - Auto-publishing scheduler
- `convex/instagram/templates.ts` - Content templates CRUD
- `convex/instagram/autoReply.ts` - Auto-reply rules engine
- `convex/instagram/messages.ts` - Messages/threads management
- `convex/instagram/analytics.ts` - Analytics aggregation
- `lib/instagram/api.ts` - Instagram Graph API client
- `lib/instagram/contentGenerator.ts` - AI content generation
- `views/instagram/InstagramDashboard.tsx` - Main dashboard UI (Inbox + Analytics included)
- `.agent/skills/INSTAGRAM_PLAN.md` - Complete plan document

**Skills**: `.agent/skills/agent3_mobile_ads.md`, `.agent/skills/INSTAGRAM_PLAN.md`

**Implementaciones AGENT-3 (20/03/2026):**

- `components/mobile/OfflineIndicator.tsx` - Componente UI que muestra estado offline con banner animado
  - Detecta cambios de conexión online/offline
  - Banner de color ámbar cuando está offline
  - Banner verde cuando se reconecta
  - Páginas en caché visibles
  - Integrado en App.tsx

- `convex/adTargeting.ts` - Sistema de targeting de anuncios
  - `getTargetedAds`: Filtra ads según perfil de usuario (país, idioma, suscripción, intereses)
  - `getTargetingPreview`: Vista previa de targeting para subastas
  - `updateAdImpression`: Registra impresiones de anuncios
  - `updateAdClick`: Registra clics y calcula CTR
  - `getAudienceInsights`: Métricas y benchmarks de campañas

---

## 📊 RESUMEN

| Categoría | Total | Completadas | Pendientes |
|-----------|-------|-------------|------------|
| v1.0 | 10 | 10 | 0 |
| AGENT-1 | 9 | 9 | 0 ✅ |
| AGENT-2 | 13 | 13 | 0 |
| AGENT-3 (Mobile/Ads) | 11 | 11 | 0 |
| INSTAGRAM | 11 | 11 | 0 |
| **TOTAL** | **54** | **54** | **0** |

**Progreso Total: 100% 🎉**

---

## 🎯 VISIÓN LARGO PLAZO

### Meta: $100K MRR en 12 meses
1. **Fase 1** (Mes 1-3): Foundation + Features v2.0 + 500 usuarios activos
2. **Fase 2** (Mes 4-6): Monetización (Ad Auction) + Instagram Automation + 2000 usuarios
3. **Fase 3** (Mes 7-9): Gamificación (Competitions) + 5000 usuarios
4. **Fase 4** (Mes 10-12): Scale + 10000 usuarios

---

## 📁 ARCHIVOS DE PLANIFICACIÓN

```
.agent/skills/
├── agent1_market_intelligence.md    ← AGENT-1 Skills
├── agent2_platform_features.md       ← AGENT-2 Skills
├── agent3_mobile_ads.md            ← AGENT-3 Skills
├── INSTAGRAM_PLAN.md                ← Instagram System Plan (NEW)
├── MASTER_PLAN.md                   ← Plan completo
├── AGENT_TEAMS.md                   ← Estructura de equipos
└── COORDINATOR.md                   ← Progreso detallado
```

---

## 📁 ARCHIVOS DE INTEGRACIÓN INSTAGRAM

```
.agent/skills/
├── INSTAGRAM_PLAN.md                  ← Plan funcional del sistema
└── INSTAGRAM_INTEGRATION_PLAN.md    ← Plan de integración técnica (NUEVO)

scripts/
└── setup-instagram.sh                ← Script de setup automático (NUEVO)

views/
└── instagram/
    └── InstagramDashboard.tsx        ← Dashboard principal
```

---

## 🔄 HANDOFF TEMPLATE

```markdown
## 🔄 HANDOFF: [Tarea]

**De:** AGENT-[X]
**Para:** AGENT-[Y]
**Fecha:** [date]

### Resumen:
[Descripción breve]

### Archivos:
- Creados: [lista]
- Modificados: [lista]

### Estado:
✅ Completado / 🟡 Parcial

### Dependencias resueltas:
- ✅ [Dependencia 1]

### Pendientes para otros equipos:
- [Tarea para otro agente]
```

---

## 🤖 INTEGRACIONES DE IA CONFIGURADAS

### Providers Implementados:
| Provider | Modelo | Uso | API Key Variable |
|----------|--------|-----|-----------------|
| OpenAI | GPT-4o-mini | Captions, hashtags, replies | VITE_OPENAI_API_KEY |
| Anthropic | Claude 3.5 Haiku | Replies largos | VITE_ANTHROPIC_API_KEY |
| Google | Gemini 1.5 Flash | Análisis de imágenes | VITE_GOOGLE_AI_API_KEY |

### Environment Variables Requeridas:
```bash
# Instagram Graph API
INSTAGRAM_APP_ID=
INSTAGRAM_APP_SECRET=
INSTAGRAM_REDIRECT_URI=

# AI Providers
VITE_OPENAI_API_KEY=
VITE_ANTHROPIC_API_KEY=
VITE_GOOGLE_AI_API_KEY=
```

---

## 🎯 PRÓXIMOS PASOS - INTEGRACIÓN

### Para el equipo de desarrollo:

1. **Configurar Facebook Developer App**
   - Crear app en https://developers.facebook.com
   - Agregar producto Instagram Graph API
   - Configurar OAuth redirect

2. **Configurar Instagram Business Account**
   - Convertir a cuenta profesional
   - Vincular a Facebook Page

3. **Ejecutar script de setup**
   ```bash
   chmod +x scripts/setup-instagram.sh
   ./scripts/setup-instagram.sh
   ```

4. **Regenerar tipos Convex**
   ```bash
   npx convex codegen
   ```

5. **Probar flujo de conexión**
   - Navegar a /instagram
   - Conectar cuenta de prueba

### Documentación de referencia:
- `.agent/skills/INSTAGRAM_INTEGRATION_PLAN.md` - Plan técnico detallado
- `.agent/skills/INSTAGRAM_PLAN.md` - Plan funcional

---

*Documento actualizado: 19/03/2026*
*Versión: 2.2 - Integration Plan Added*

---

---

## 🚀 FASE 4: SPRINT FINAL PREMIUM — Plataforma Adictiva y Completa

> **📌 INSTRUCCIONES PARA AGENTES:** Marcar con `[/]` al iniciar, `[x]` al terminar. Respetar el estándar visual oscuro premium. Leer el `implementation_plan.md` para criterios de aceptación completos.

---

### 🎨 AGENT-2: FRONTEND & UX PREMIUM

#### M1 — Dashboard UX (P1) ✅ COMPLETADO
- [x] **Top Traders Podio:** Podio visual 🥇🥈🥉 con avatares, rings de color (oro/plata/bronce), nombre y stats de likes. Archivo: `views/DashboardView.tsx`
- [x] **Feed Manual (Pill Flotante):** Pill `↑ X Nuevas Publicaciones` con listener para `new-posts-available` event. Archivo: `views/DashboardView.tsx`
- [x] **Hero Buttons Funcionales:** Botones "Explorar" → `comunidad` y "Tutorial" → `academia` vía `CustomEvent('navigate')`. Archivo: `views/DashboardView.tsx`

#### M2 — Comunidad: Precios + Trending (P1) ✅ COMPLETADO
- [x] **Tab "Planes" en sidebar:** Botón "Ver Planes" que navega a `pricing`. Archivo: `views/ComunidadView.tsx`
- [x] **Comunidades Trending visible:** Ya existente `SidebarCommunitiesSection` con trending communities.
- [x] **Modal "Crear Comunidad":** Botón premium con requisitos (min 25 personas, $50 + 20% para plataforma). Archivo: `views/ComunidadView.tsx`

#### M3 — PostCard Refinements (P0) ✅ COMPLETADO
- [x] **Ocultar Follow en bots IA:** Condición `&& !post.isAiAgent` en el botón de seguir. Archivo: `components/PostCard.tsx`
- [x] **Share nativo (Web Share API):** Reemplazar alert con `navigator.share()` + fallback clipboard. Archivo: `components/PostCard.tsx`
- [x] **Like micro-animation:** Corazón flotante animado (+0.8s) al dar like. Ya existía `animate-like-flash`.

#### M4 — Navegación: Tabs Trading & Prop Firms (P0) ✅ COMPLETADO
- [x] **Tab "Trading":** Dropdown en nav con sub-items: Gráfico, Broker, Bitácora, Prop Firms. Archivo: `components/Navigation.tsx`
- [x] **PropFirmsView.tsx:** Vista premium que consume `api.propFirms.getPropFirms` y muestra firms como cards dark. Archivo: `views/PropFirmsView.tsx`
- [x] **Registrar ruta `propfirms`:** En `App.tsx` agregar case para renderizar `PropFirmsView`.

#### M8 — Gamification Loop (P2) ✅ COMPLETADO
- [x] **Streak diario:** `recordLogin` mejorado con tracking de `streakDays`, XP bonus por racha (10 XP/día, máx 100), notificación streak a partir de 3 días. Archivos: `convex/profiles.ts`, `convex/schema.ts`
- [x] **XP por primera publicación:** Toast animado `+50 XP ✨` aparece al crear post. Archivo: `views/ComunidadView.tsx`
- [x] **Notificación streak:** Tipo `streak` agregado a notifications con icono 🔥. Archivos: `convex/schema.ts`, `components/Notifications.tsx`

---

### 🤖 AGENT-1: BACKEND, IA & INFRA

#### M5 — Sistema de Referidos Completo (P0) ✅ COMPLETADO
- [x] **ReferralView completo:** Rediseñar el archivo con: link único `?ref=${usuario.id}`, contador de referidos traídos, ganancias estimadas, botón Copiar + Compartir. Archivo: `views/ReferralView.tsx`
- [x] **Query `getReferralStats`:** Backend ya existe en `convex/referrals.ts`
- [x] **Registrar `referredBy` al signup:** Al crear usuario con `?ref=CODE`, guardar el `referredBy` en su perfil. Archivo: `services/storage.ts` + `convex/profiles.ts`

**Implementación:**
- Schema: `referredBy: v.optional(v.string())` agregado a profiles
- Mutation: `registerWithReferral` en `convex/profiles.ts` (no requiere auth)
- Helpers: `captureReferralFromUrl`, `getPendingReferralCode`, `clearPendingReferralCode` en storage.ts
- Captura automática del código en `App.tsx` useEffect

#### M6 — Ads Rotativos en Sidebar (P2) ✅ COMPLETADO
- [x] **RotatingAdBanner component:** Nuevo componente con rotación automática cada 10s, fade transitions, dots indicadores y progress bar. Archivo: `components/AdBanner.tsx`
- [x] **Sidebar con ads rotativos:** `ComunidadView` usa `RotatingAdBanner` cuando hay 2+ ads en sector `sidebar`. Archivo: `views/ComunidadView.tsx`

#### M7 — IA Dual-Posting (P1) ✅ COMPLETADO
- [x] **Dual-Post:** Posts IA automáticamente replicados a comunidad `AI News`. Si no existe, se crea automáticamente. Archivos: `convex/posts.ts` + `convex/aiAgent.ts`

#### M9 — Deploy & QA Final (P3) ✅ COMPLETADO
- [x] **Build verificado:** `npm run build` exitoso sin errores
- [x] **Convex deploy:** `npx convex deploy` exitoso
- [x] **Rutas verificadas:** Todas las nuevas vistas registradas en App.tsx
- [x] **TAREAS.md actualizado:** Todos los módulos completados marcados

---

### 💬 AGENT-2 + AGENT-1: CHAT PRIVADO POR SUB-COMUNIDAD

#### M10 — Community Chat (P1) ✅ COMPLETADO
> **Nota técnica:** `LiveChatWidget.tsx` ya soporta canales via `channelId`. El trabajo es mínimo — solo conectar el ID de la comunidad como canal.

- [x] **Prop `initialChannel` en LiveChatWidget:** Agregar prop opcional que fuerza el `currentChannel` al montar y oculta el selector de canales globales. Archivo: `components/LiveChatWidget.tsx`
- [x] **Prop `communityName`:** Mostrar en el header `"CHAT: [Nombre]"` en lugar de `"TRADESHARE LIVE"`. Archivo: `components/LiveChatWidget.tsx`
- [x] **Botón "Chat Privado" en Comunidad:** Visible solo para miembros de la sub-comunidad activa. Al clic, abre `LiveChatWidget` con `initialChannel={communityId}`. Archivo: `views/ComunidadView.tsx`
- [x] **Validar `convex/chat.ts`:** Confirmar que `getMessages` filtra por `channelId` y `sendMessage` acepta cualquier string como channelId dinámico. Archivo: `convex/chat.ts`

---

## 📊 RESUMEN SPRINT FINAL

| Módulo | Agente | Prioridad | Estado |
|--------|--------|-----------|--------|
| **M10: Community Chat** | AGENT-2 | P1 🟡 | ✅ COMPLETADO |
| **M5: Referidos completo** | AGENT-1 | P0 🔴 | ✅ COMPLETADO |
| **M3: PostCard AI + Share + Like** | AGENT-2 | P0 🔴 | ✅ COMPLETADO |
| **M4: Nav Trading + Prop Firms** | AGENT-2 | P0 🔴 | ✅ COMPLETADO |
| **M1: Dashboard Podio + Feed pill** | AGENT-2 | P1 🟡 | ✅ COMPLETADO |
| **M2: Precios en Comunidad** | AGENT-2 | P1 🟡 | ✅ COMPLETADO |
| **M7: IA Dual-Posting** | AGENT-1 | P1 🟡 | ✅ COMPLETADO |
| **M6: Ads Rotativos** | Ambos | P2 🟢 | ✅ COMPLETADO |
| **M8: Gamification Loop** | AGENT-2 | P2 🟢 | ✅ COMPLETADO |
| **M9: Deploy Final** | AGENT-1 | P3 🔵 | ✅ COMPLETADO |

---

## 🎨 ESTÁNDAR VISUAL OBLIGATORIO
- **Dark Mode First:** `bg-[#0f1115]`, `glass`, `backdrop-blur-xl`
- **Micro-animations:** `animate-in fade-in duration-300`, `hover:scale-105`, `transition-all`
- **Typography:** `font-black uppercase tracking-widest` (títulos), `text-[10px]` (labels)
- **Colors:** Primary `#3b82f6`, Success `signal-green`, Alert `alert-red`
- **Borders:** `border border-white/10`, hover: `hover:border-primary/40`

*📅 Plan actualizado: 20/03/2026 — SPRINT FINAL COMPLETADO 100%*

---

## 🏰 FASE 5: ESTABILIDAD & ESCALABILIDAD (Largo Plazo)

> **Objetivo:** Preparar la plataforma para 1000+ usuarios sin cuellos de botella, con monitoreo real y cero deuda técnica crítica. Ver `implementation_plan.md` para código de referencia completo.

---

### 🤖 AGENT-1: BACKEND, INFRA & CALIDAD

#### S1 — Refactorizar `storage.ts` (P0 🔴)
> `services/storage.ts` tiene 2000+ líneas mezclando todo. Un bug afecta toda la app.
- [ ] Crear `services/auth/authService.ts` → extraer login, logout, getCurrentSession, OAuth
- [ ] Crear `services/posts/postsService.ts` → extraer createPost, getPosts, updatePost, deletePost, likes
- [ ] Crear `services/communities/communityService.ts` → extraer joinCommunity, getCommunities
- [ ] Crear `services/users/userService.ts` → extraer getProfile, updateProfile, follow/unfollow
- [ ] Convertir `services/storage.ts` en barrel de re-exportación (`export * from './auth/authService'`)

#### S2 — Tests con Vitest (P0 🔴)
> Cero tests = bugs silenciosos en producción.
- [ ] Instalar: `npm install -D vitest @testing-library/react jsdom`
- [ ] Configurar `vite.config.ts` con entorno jsdom
- [ ] Crear `tests/auth.test.ts` — login, logout, sesión persistente
- [ ] Crear `tests/posts.test.ts` — crear, leer, eliminar post
- [ ] Crear `tests/storage.test.ts` — captureReferralFromUrl, sessionManager helpers
- [ ] Agregar script `"test": "vitest"` en `package.json`

#### S4 — Monitoreo Sentry (P1 🟡)
> Sin Sentry, los errores de usuarios reales son invisibles.
- [ ] Instalar: `npm install @sentry/react @sentry/vite-plugin`
- [ ] Configurar en `main.tsx` con `VITE_SENTRY_DSN` (variable de entorno)
- [ ] Agregar `VITE_SENTRY_DSN` en Vercel environment variables
- [ ] Wrappear `App` con `Sentry.ErrorBoundary`

#### S5 — Caching & Optimización Bandwidth Convex (P1 🟡)
> Convex cobra por lecturas. Reducir consultas innecesarias.
- [ ] Reducir `PAGE_SIZE` de posts de 15 → 10 en `views/ComunidadView.tsx`
- [ ] Deshabilitar queries pesadas cuando la ventana no está en foco (`"skip"` en useQuery)
- [ ] Auditar queries duplicadas entre `DashboardView` y `ComunidadView`

#### S8 — CDN para Imágenes Propio (P2 🟢)
> Las imágenes dependen de servicios externos que pueden caer.
- [ ] Configurar Supabase Storage (ya en el stack) como CDN propio
- [ ] Actualizar `services/imageUpload.ts` para subir a bucket propio
- [ ] Mantener dicebear/Unsplash solo como fallback

#### S9 — CI/CD con GitHub Actions (P3 🔵)
> Deploy manual = riesgo de romper producción.
- [ ] Crear `.github/workflows/ci.yml`
- [ ] Step 1: `npm run test` (Vitest) — si falla, bloquear deploy
- [ ] Step 2: `npm run build` — verificar compilación
- [ ] Step 3: `npx convex deploy --prod` — solo en push a `main`

---

### 🎨 AGENT-2: FRONTEND & PERFORMANCE

#### S3 — Dividir Componentes Gigantes (P1 🟡)
> `PostCard.tsx` (62KB), `ComunidadView.tsx` (64KB), `PerfilView.tsx` (66KB) pesan demasiado.
- [ ] **PostCard.tsx** → extraer `PostHeader.tsx`, `PostContent.tsx`, `PostActions.tsx`, `PostEditForm.tsx`
- [ ] **ComunidadView.tsx** → extraer `CommunityFeed.tsx`, `CommunitySidebar.tsx`, `CommunityLiveTV.tsx`
- [ ] **PerfilView.tsx** → extraer `ProfileHeader.tsx`, `ProfilePosts.tsx`, `ProfileStats.tsx`

#### S6 — Completar Migración de Sesiones (P1 🟡)
> Aún quedan referencias a `localStorage.getItem('local_session_user')` en algunos flujos.
- [ ] Buscar con `grep -r "local_session_user"` y eliminar todas las ocurrencias restantes
- [ ] Reemplazar con `getSessionUser()` / `saveSessionUser()` del sessionManager
- [ ] Verificar flujos secundarios de logout usan `clearSecureSession()`

#### S7 — SEO con Meta Tags Dinámicas (P2 🟢)
> TradeShare es SPA sin meta tags. Google no puede indexarlo.
- [ ] Instalar `react-helmet-async`
- [ ] Agregar `<Helmet>` en `DashboardView`, `ComunidadView`, `PerfilView`, `PricingView`
- [ ] Crear `public/og-image.png` (imagen de preview para redes sociales)

---

## 📊 RESUMEN FASE 5

| Módulo | Agente | Prioridad | Estado |
|--------|--------|-----------|--------|
| S1: Refactorizar storage.ts | AGENT-1 | P0 🔴 | ✅ COMPLETADO |
| S2: Tests Vitest | AGENT-1 | P0 🔴 | ✅ COMPLETADO |
| S4: Sentry monitoreo | AGENT-1 | P1 🟡 | [ ] |
| S5: Caching Convex | AGENT-1 | P1 🟡 | [ ] |
| S3: Dividir componentes | AGENT-2 | P1 🟡 | [ ] |
| S6: Migración sesiones | AGENT-2 | P1 🟡 | [ ] |
| S7: SEO meta tags | AGENT-2 | P2 🟢 | [ ] |
| S8: CDN imágenes | AGENT-1 | P2 🟢 | [ ] |
| S9: CI/CD GitHub Actions | AGENT-1 | P3 🔵 | [ ] |

### ⚡ Quick Wins (poca inversión, alto impacto):
1. **S4 Sentry** — 30 min setup, visibilidad total de errores en producción
2. **S6 Sesiones** — buscar/reemplazar `local_session_user`, menos de 1h
3. **S5 PAGE_SIZE** — cambiar `15` a `10` en una línea, -33% lecturas Convex
4. **S7 Meta tags** en Dashboard — 15 min, mejora SEO inmediatamente

---

## 🔧 FASE 6: REFACTORING & ESTABILIDAD (20/03/2026)

### AGENT-1: BACKEND & INFRAESTRUCTURA

| # | Tarea | Prioridad | Estado |
|---|-------|-----------|--------|
| S1.1 | Modularizar `convex/schema.ts` | P0 🔴 | ⚠️ REVERTIDO (Convex requiere schema monolítico) |
| S1.2 | Consolidar tipos duplicados | P1 🟡 | ✅ COMPLETADO |
| S1.3 | URLs centralizadas en config | P1 🟡 | ✅ COMPLETADO |
| S1.4 | Sentry DSN setup | P1 🟡 | ✅ COMPLETADO |
| S1.5 | Coverage tests mutations | P1 🟡 | ✅ COMPLETADO |
| S1.6 | Refactorizar storage.ts (P0) | P0 🔴 | ✅ COMPLETADO |

**Nota S1.1:** Convex requiere que `schema.ts` esté en la raíz del directorio `convex/`. 
La estructura modular fue probada pero Convex no soporta imports desde subdirectorios para el schema.
Se puede considerar migrar a Prisma/Postgres si se necesita schema modular.

**Configuración URLs creada:**
```
src/config/
├── index.ts        # Barrel exports
└── urls.ts        # URLs centralizadas con soporte para .env
```

**Tipos consolidados:**
- `types.ts` simplificado, eliminado duplicados con dataModel.d.ts
convex/schema/
├── index.ts              # Re-exporta todo
├── auth.ts              # profiles

**Servicios refactorizados (S1.6):**
```
services/
├── auth/
│   ├── authService.ts    # login, register, logout, OAuth
│   └── index.ts
├── users/
│   ├── userService.ts    # CRUD usuarios, perfiles
│   └── index.ts
├── posts/
│   ├── postService.ts    # CRUD posts, likes, comments
│   └── index.ts
├── notifications/
│   ├── notificationService.ts  # Notificaciones
│   └── index.ts
├── backup/
│   ├── syncService.ts    # SyncManager, BackupManager
│   └── index.ts
├── index.ts             # Barrel exports
└── storage.ts           # Re-exporta todo (compatibilidad)
├── posts.ts             # posts, pendingPosts, aiAgentConfig
├── social.ts            # notifications, pushSubscriptions, achievements
├── communities.ts       # communities, communityMembers, communityPosts, etc.
├── chat.ts              # chat, chatChannels, chatTyping
├── moderation.ts        # spamReports, moderationConfig, moderationLogs, rateLimits
├── payments.ts          # payments, subscriptions, purchases, etc.
├── marketplace.ts       # products, strategies, wishlists
├── creators.ts          # creator_profiles, creator_earnings, etc.
├── signals.ts          # signal_plans, signals, signal_providers, etc.
├── competitions.ts     # competitions, competition_participants
├── verification.ts     # trader_verification, user_preferences
├── referrals.ts        # referrals, referralCodes, affiliates
├── instagram.ts        # instagram tables
├── ads.ts             # ad_slots, ad_auctions, ad_bids, ad_campaigns
├── market.ts          # economic_calendar, market_news, news_sources
└── platform.ts        # ads, global_config, recursos, videos, etc.
```

---

---

## 🏰 FASE 7: ESTABILIDAD & MONITOREO (20/03/2026)

> **Objetivo:** Implementar testing, monitoreo y CI/CD para prevenir bugs en producción y detectar errores en tiempo real.

---

### 🤖 AGENT-1: BACKEND, QUALITY & DEPLOY

| # | Tarea | Prio | Estado | Notas |
|---|-------|------|--------|-------|
| ST1 | Setup Sentry + DSN | P0 | ✅ COMPLETADO | src/sentry.ts, vite.config.ts, index.tsx |
| ST2 | GitHub Actions CI/CD | P0 | ✅ COMPLETADO | .github/workflows/ci.yml |
| ST3 | Tests E2E Playwright | P1 | 🔄 PENDIENTE | Requiere setup Playwright |
| ST4 | Bundle Splitting Vite | P1 | ✅ COMPLETADO | Ya existe en vite.config.ts |
| ST5 | Query Optimization | P1 | ✅ COMPLETADO | PAGE_SIZE 15→10 en ComunidadView |
| ST6 | Vitest Unit Tests | P1 | ✅ COMPLETADO | 73 tests passing, __tests__/unit/ |
| ST7 | Lighthouse CI | P2 | 🔄 PENDIENTE | Postpone hasta tener tests |

---

### 🎨 AGENT-2: FRONTEND & UX

| # | Tarea | Prio | Estado | Notas |
|---|-------|------|--------|-------|
| ST8 | Dividir ComunidadView | P0 | ✅ COMPLETADO | views/comunidad/ ya existe |
| ST9 | Dividir PerfilView | P0 | ✅ COMPLETADO | views/profile/ creado |
| ST10 | SEO Meta Tags | P1 | ✅ COMPLETADO | components/SEO.tsx + HelmetProvider |
| ST11 | PWA Offline Mode | P1 | 🔄 PENDIENTE | Mejorar service worker |
| ST12 | Analytics Dashboard | P2 | 🔄 PENDIENTE | Postpone hasta tener Sentry |

---

### 📊 RESUMEN FASE 7

| Agente | Tareas | Completadas | Progreso |
|--------|--------|-------------|----------|
| AGENT-1 | 7 | 6 | 86% |
| AGENT-2 | 5 | 3 | 60% |
| **TOTAL** | **12** | **9** | **75%** |

---

### ⚡ QUICK WINS

1. **Sentry** — 30 min setup, visibilidad total de errores
2. **CI/CD** — 1h setup, deploy automático
3. **ComunidadView** — Dividir en 4 componentes
4. **Meta tags** — 15 min en Dashboard

---

### 📁 SKILLS ACTUALIZADOS

```
.agent/skills/
├── MASTER_PLAN.md          # Orquestador
├── agent_frontend.md         # UI/UX + Performance ⚡ NUEVO
├── agent_backend.md        # Convex + API + Security ⚡ NUEVO
├── agent_monetize.md       # Revenue + Payments ⚡ NUEVO
├── agent_community.md       # Social + Gamification ⚡ NUEVO
├── agent_testing.md        # Playwright + Vitest ⚡ NUEVO
├── agent_monitoring.md     # Sentry + Analytics ⚡ NUEVO
├── agent_deploy.md         # CI/CD Pipeline ⚡ NUEVO
├── guia_visual/
│   └── SKILL.md            # Estándar visual
└── COORDINATOR.md          # Progreso
```

---

*📅 FASE 5 creada: 19/03/2026 — Escalabilidad y estabilidad a largo plazo*
*📅 FASE 6 iniciada: 20/03/2026 — Refactoring schema modularizado*
*📅 FASE 7 iniciada: 20/03/2026 — Testing, Monitoreo y CI/CD*
*Coordinador: Todas las tareas de FASE 7 marcadas como INICIADAS para evitar duplicación*

---

### 🎨 AGENT-2: COMMUNITY ADMIN PANEL (20/03/2026)

| # | Tarea | Prioridad | Estado |
|---|-------|-----------|--------|
| CAP-1 | Create CommunityAdminPanel component | P0 | ✅ COMPLETADO |
| CAP-2 | Add backend mutations (removeMember, block, role update) | P0 | ✅ COMPLETADO |
| CAP-3 | Register route in App.tsx | P0 | ✅ COMPLETADO |
| CAP-4 | Update Navigation to link to panel | P0 | ✅ COMPLETADO |

**Componente creado:** `components/CommunityAdminPanel.tsx`

**Funcionalidades:**
- Estadísticas: miembros, posts, ingresos, suscriptores
- Gestión de posts: ver, eliminar, ocultar, fijar
- Gestión de miembros: expulsar, cambiar roles (admin/moderator/member)
- Configuración: información de comunidad, enlaces rápidos

**Backend mutations agregadas:**
- `removeMember` - Expulsar miembros
- `updateMemberRole` - Cambiar roles
- `getOwnerCommunities` - Obtener comunidades del owner
- `getCommunityPostsAdmin` - Posts con información del autor
- `hidePost` - Ocultar posts
- `deletePostAdmin` - Eliminar posts (con permisos)

---

### 🎨 AGENT-2: CSP & AVATARS (20/03/2026)

| # | Tarea | Prioridad | Estado |
|---|-------|-----------|--------|
| CSP-1 | Fix CSP in vite.config.ts | P0 | ✅ COMPLETADO |
| CSP-2 | Create CSS-only Avatar component | P0 | ✅ COMPLETADO |
| CSP-3 | Replace DiceBear in Navigation | P0 | ✅ COMPLETADO |
| CSP-4 | Replace DiceBear in NotificationPanel | P0 | ✅ COMPLETADO |
| CSP-5 | Replace DiceBear in PostCardHeader | P0 | ✅ COMPLETADO |
| CSP-6 | Replace DiceBear in remaining views | P0 | ✅ COMPLETADO |

**Componente Avatar creado:**
```
components/
├── Avatar.tsx              # Componente CSS-only con:
│                          # - Iniciales basadas en nombre
│                          # - Colores consistentes por seed
│                          # - Fallback a imagen real si proveída
│                          # - 10 colores predefinidos
│                          # - Tamaños: xs, sm, md, lg, xl, 2xl
│                          # - Esquinas: none, sm, md, lg, xl, full
```

**Archivos actualizados con Avatar:**
- `components/Navigation.tsx`
- `components/NotificationPanel.tsx`
- `components/postcard/PostCardHeader.tsx`
- `views/profile/ProfileHeader.tsx`
- `views/DashboardView.tsx`
- `views/MarketplaceView.tsx`
- `views/PerfilView.tsx`
- `components/CommunityReviews.tsx`
- `components/admin/CommunityManagement.tsx`
- `components/instagram/InstagramAccountCard.tsx`
- `components/Leaderboard.tsx`
- `views/CreatorDashboard.tsx`
- `App.tsx`

**Resultado:** Build exitoso (556 modules), 69 tests passing

---

## 🏰 FASE 8: STABILIZATION & CODE QUALITY (20/03/2026)

> **📌 AGENTE: AGENT-4 (opencode/mimo-v2-pro-free)**
> **⚠️ NO DUPLICAR ESTAS TAREAS — AGENT-4 ESTÁ ACTIVAMENTE TRABAJANDO EN ELLAS**

### 🤖 AGENT-4: FULL-STACK QUALITY

#### Sprint 1: Estabilización (COMPLETADO)
| # | Tarea | Prioridad | Estado | Notas |
|---|-------|-----------|--------|-------|
| A4-1 | Audit: lint + tests + build | P0 | ✅ COMPLETADO | 372 issues, informe generado |
| A4-2 | Corregir errores TypeScript | P0 | [/] EN PROGRESO | sessionManager claves alineadas (`local_session`) |
| A4-3 | Fix tests placeholders | P0 | ✅ COMPLETADO | 5/8 eliminados, 3 reales restantes |
| A4-4 | Verificar .env en .gitignore | P0 | ✅ COMPLETADO | Ya excluido (línea 29) |
| A4-5 | Build limpio verificado | P0 | 🔄 PENDIENTE | Node.js no instalado localmente |

#### Sprint 2: Modularización de Componentes
> **DELEGADO** — ✅ Completado por otro agente (ver SPRINT 2 abajo)

#### Sprint 2.5: Consolidación & Fixes
| # | Tarea | Prioridad | Estado | Notas |
|---|-------|-----------|--------|-------|
| A4-9 | Consolidar imports storage.ts | P1 | 🔄 PENDIENTE | Servicios modulares ya existen |
| A4-17 | Fix localStorage → sessionManager | P1 | [/] PARCIAL | userService.ts ✅, auth.ts getCurrentSession ✅, login/register pendientes por conflicto |
| A4-18 | Reemplazar console.* por logger | P1 | ✅ COMPLETADO | config.ts, ReferralPanel, analytics, ErrorBoundary |

#### Sprint 3: Testing & Coverage
| # | Tarea | Prioridad | Estado | Notas |
|---|-------|-----------|--------|-------|
| A4-10 | Tests authService | P1 | 🔄 PENDIENTE | Login, register, logout |
| A4-11 | Tests userService | P1 | 🔄 PENDIENTE | CRUD perfiles |
| A4-12 | Tests postService | P1 | 🔄 PENDIENTE | CRUD posts |
| A4-13 | Target coverage 60%+ | P2 | 🔄 PENDIENTE | Medir con vitest |

#### Sprint 4: Features Pendientes
| # | Tarea | Prioridad | Estado | Notas |
|---|-------|-----------|--------|-------|
| A4-14 | SEO meta tags completos | P1 | 🔄 PENDIENTE | react-helmet-async |
| A4-15 | Query optimization Convex | P2 | 🔄 PENDIENTE | Auditoría duplicadas |
| A4-16 | CI/CD GitHub Actions | P2 | 🔄 PENDIENTE | Test + build + deploy |

### 📊 RESUMEN FASE 8

| Agente | Tareas | Completadas | Progreso |
|--------|--------|-------------|----------|
| AGENT-4 | 16 | 0 | 0% (recién iniciado) |

*📅 FASE 8 iniciada: 20/03/2026 — Agent-4 incorporado para estabilización y calidad*
*⚠️ Tarea A4-1 EN PROGRESO — No interferir con lint/tests/build*

---

## 🏗️ SPRINT 2: MODULARIZACIÓN DE COMPONENTES (20/03/2026)

> **Objetivo:** Dividir componentes grandes en sub-componentes y hooks reutilizables.

---

### ✅ TAREAS COMPLETADAS

| # | Tarea | Estado | Notas |
|---|-------|--------|-------|
| M1 | AdminView modularizado | ✅ COMPLETADO | components/admin/ ya existe |
| M2 | PerfilView modularizado | ✅ COMPLETADO | views/profile/ creado |
| M3 | Hooks custom para ComunidadView | ✅ COMPLETADO | hooks/usePostsFeed.ts, useLiveStream.ts, usePostFilters.ts, useFeedEvents.ts |
| M4 | Exports centralizados | ✅ COMPLETADO | hooks/index.ts actualizado |

### 📁 ESTRUCTURA MODULAR CREADA

```
hooks/
├── usePostsFeed.ts        # Lógica del feed de posts
├── useFilteredPosts.ts    # Filtrado de posts
├── usePostFilters.ts      # Estado de filtros
├── useLiveStream.ts       # Estado del stream en vivo
├── useFeedEvents.ts       # Eventos del feed (refresh, create)
└── index.ts              # Exports centralizados

views/
├── profile/              # Perfil modularizado
│   ├── ProfileHeader.tsx
│   ├── ProfileTabs.tsx
│   ├── ProfilePosts.tsx
│   ├── ProfileAchievements.tsx
│   ├── ProfileConfig.tsx
│   └── index.ts
└── comunidad/           # Comunidad modularizado
    ├── CommunityFeed.tsx
    ├── CommunityHeader.tsx
    ├── SidebarAdSection.tsx
    ├── SidebarCommunitiesSection.tsx
    ├── FilterButton.tsx
    ├── DailyPollWidget.tsx
    ├── PartnerCard.tsx
    ├── LiveTVSection.tsx
    ├── Modals.tsx
    ├── PostDetailModal.tsx
    └── index.ts

components/admin/         # Admin modularizado
├── AdminDashboard.tsx
├── UserManagement.tsx
├── AdManagement.tsx
├── CommunityManagement.tsx
├── ModerationPanel.tsx
├── PropFirmManagement.tsx
├── PostManagement.tsx
├── AIAgentSection.tsx
├── SettingsPanel.tsx
├── BackupPanel.tsx
└── index.ts
```

### 🔄 PRÓXIMOS PASOS

| # | Tarea | Prioridad |
|---|-------|----------|
| M5 | Consolidar storage.ts → servicios modulares | P1 |
| M6 | Consumir hooks nuevos en ComunidadView | P2 |
| M7 | Consumir hooks nuevos en AdminView | P2 |
| M8 | Tests para nuevos hooks | P2 |

---

*📅 Sprint 2: 20/03/2026 — Modularización de componentes*
*Estado: En progreso - Hooks creados, listo para consumir*

---

## 🏰 FASE 9: SUBCOMUNIDADES PRIVADAS (20/03/2026)

> **Objetivo:** Crear sistema de subcomunidades privadas con TV, chat, publicidad configurable por plan.
> **Responsable:** Pendiente asignar agente
> **Dependencias:** Sistema de comunidades existente (`communities.ts`, `communityMembers`)

---

### 📋 ARQUITECTURA PROPUESTA

#### Concepto
Las subcomunidades son **espacios privados dentro de una comunidad principal**. El owner de una comunidad puede crear subcomunidades y cada una tiene:
- Su propio feed de posts (solo miembros)
- Su propio chat privado (solo miembros)
- Su propia TV en vivo (solo miembros)
- Configuración de publicidad según plan pagado
- Roles separados (owner/admin/mod/member de la sub)

#### Modelo de planes y publicidad
```
Plan Free    → Subcomunidades ilimitadas + Publicidad FORZADA (no se puede desactivar)
Plan Starter → 3 subcomunidades + Publicidad opcional (owner decide)
Plan Growth  → 10 subcomunidades + Sin publicidad por defecto (owner puede activar)
Plan Scale   → Ilimitadas + Sin publicidad + TV HD + Chat encriptado
Plan Enterprise → Todo ilimitado + Whitelabel + API access
```

---

### 🗄️ NUEVAS TABLAS EN SCHEMA

#### 1. `subcommunities` — Subcomunidades
```typescript
subcommunities: defineTable({
  parentId: v.id("communities"),       // Comunidad padre
  ownerId: v.string(),                 // Owner de la subcomunidad
  name: v.string(),                    // Nombre visible
  slug: v.string(),                    // URL: /c/{parentSlug}/{subSlug}
  description: v.string(),
  visibility: v.union(v.literal("private"), v.literal("invite_only")),
  coverImage: v.optional(v.string()),
  plan: v.string(),                    // Plan heredado del padre
  
  // Publicidad (controlado por owner según plan)
  adsEnabled: v.boolean(),             // ¿Mostrar ads en esta sub?
  adFrequency: v.number(),             // Cada N posts (0 = sin ads)
  allowedAdTypes: v.array(v.string()), // ['feed', 'sidebar'] o []
  
  // Configuración TV
  tvEnabled: v.boolean(),
  tvStreamUrl: v.optional(v.string()),
  tvIsLive: v.boolean(),
  
  maxMembers: v.number(),
  currentMembers: v.number(),
  status: v.string(),                  // active | archived
  createdAt: v.number(),
})
.index("by_parent", ["parentId"])
.index("by_owner", ["ownerId"])
.index("by_slug", ["slug"])
.index("by_parent_slug", ["parentId", "slug"])
```

#### 2. `subcommunityMembers` — Miembros de subcomunidad
```typescript
subcommunityMembers: defineTable({
  subcommunityId: v.id("subcommunities"),
  userId: v.string(),
  role: v.union(v.literal("owner"), v.literal("admin"), v.literal("moderator"), v.literal("member")),
  joinedAt: v.number(),
})
.index("by_subcommunity", ["subcommunityId"])
.index("by_user", ["userId"])
.index("by_subcommunity_user", ["subcommunityId", "userId"])
```

#### 3. `subcommunityChat` — Chat privado de subcomunidad
```typescript
// Se reutiliza chatChannels con type "subcommunity"
// Nueva variante en chatChannels.type:
type: v.union(v.literal("global"), v.literal("community"), v.literal("direct"), v.literal("subcommunity"))
```

#### 4. `communityPlanSettings` — Configuración de plan por comunidad
```typescript
communityPlanSettings: defineTable({
  communityId: v.id("communities"),
  plan: v.string(),
  
  // Límites
  maxSubcommunities: v.number(),
  maxMembersPerSub: v.number(),
  
  // Publicidad
  adsAllowed: v.boolean(),
  canDisableAds: v.boolean(),          // Solo Growth+
  defaultAdFrequency: v.number(),
  
  // TV
  tvAllowed: v.boolean(),
  tvMaxViewers: v.number(),
  
  // Features
  chatAllowed: v.boolean(),
  analyticsEnabled: v.boolean(),
  customBranding: v.boolean(),
  
  updatedAt: v.number(),
})
.index("by_community", ["communityId"])
```

---

### 🔧 BACKEND (Convex)

#### Archivos a crear/modificar

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `convex/schema.ts` | MODIFICAR | Agregar 4 tablas nuevas |
| `convex/subcommunities.ts` | CREAR | CRUD completo de subcomunidades |
| `convex/subcommunityChat.ts` | CREAR | Chat privado por subcomunidad |
| `convex/subcommunityTV.ts` | CREAR | TV privada por subcomunidad |
| `convex/communityPlans.ts` | CREAR | Gestión de planes y publicidad |
| `convex/chat.ts` | MODIFICAR | Agregar soporte `type: "subcommunity"` |

#### Queries principales
```typescript
// Listar subcomunidades de una comunidad
getSubcommunities(parentId)

// Obtener subcomunidad por slug
getSubcommunity(parentId, slug)

// Verificar acceso de usuario
hasSubcommunityAccess(subcommunityId, userId)

// Obtener miembros de subcomunidad
getSubcommunityMembers(subcommunityId)

// Configuración de plan
getCommunityPlanSettings(communityId)
```

#### Mutations principales
```typescript
// CRUD subcomunidades
createSubcommunity(parentId, name, slug, description, visibility)
updateSubcommunity(subcommunityId, data)
deleteSubcommunity(subcommunityId)

// Miembros
inviteToSubcommunity(subcommunityId, userId)
joinSubcommunity(subcommunityId, userId)
removeFromSubcommunity(subcommunityId, userId)
changeSubcommunityRole(subcommunityId, userId, newRole)

// Publicidad (owner/admin)
toggleSubcommunityAds(subcommunityId, enabled)
setAdFrequency(subcommunityId, frequency)
setAllowedAdTypes(subcommunityId, types)

// TV
startSubcommunityTV(subcommunityId, streamUrl)
stopSubcommunityTV(subcommunityId)

// Planes
updatePlanSettings(communityId, planData)
canDisableAds(communityId) → boolean (según plan)
```

---

### 🖥️ FRONTEND

#### Estructura de archivos
```
views/subcommunity/
├── SubcommunityView.tsx         # Vista principal de subcomunidad
├── SubcommunityFeed.tsx         # Feed de posts (solo miembros)
├── SubcommunityChat.tsx         # Chat privado integrado
├── SubcommunityTV.tsx           # TV privada (solo miembros)
├── SubcommunitySettings.tsx     # Settings (ads, TV, roles)
├── SubcommunityMembers.tsx      # Lista de miembros
├── CreateSubcommunityModal.tsx  # Modal crear subcomunidad
└── index.ts

components/
├── SubcommunityCard.tsx         # Card para listado
├── SubcommunityNav.tsx          # Navegación interna
├── AdToggleControl.tsx          # Toggle publicidad por plan
├── PrivateTVPlayer.tsx          # Player TV privado
└── SubcommunityChatPanel.tsx    # Panel chat lateral

components/admin/
├── PlanManagement.tsx           # Gestión de planes (admin global)
└── CommunityAdSettings.tsx      # Config ads por comunidad
```

#### Navegación — "Explorar" arriba
```tsx
// Modificar Navigation.tsx o el layout principal
// Mover el botón/link "Explorar Comunidades" al top nav

<nav className="flex items-center gap-4">
  <Link to="/explore" className="...">Explorar</Link>  // ← ARRIBA
  <Link to="/comunidad">Comunidad</Link>
  <Link to="/dashboard">Dashboard</Link>
  ...
</nav>
```

#### Rutas nuevas
```tsx
// App.tsx — agregar rutas
<Route path="/c/:parentSlug/:subSlug" element={<SubcommunityView />} />
<Route path="/c/:parentSlug/:subSlug/chat" element={<SubcommunityChat />} />
<Route path="/c/:parentSlug/:subSlug/tv" element={<SubcommunityTV />} />
<Route path="/c/:parentSlug/:subSlug/settings" element={<SubcommunitySettings />} />
<Route path="/c/:parentSlug/:subSlug/members" element={<SubcommunityMembers />} />
<Route path="/explore" element={<ExploreView />} />
```

#### Flujo de UI

```
Usuario entra a Comunidad
  └─> Ve lista de Subcomunidades en sidebar
      └─> Click en Subcomunidad
          └─> Si es miembro → Acceso completo (feed, chat, TV)
          └─> Si no es miembro → Página de bienvenida + botón "Unirse"
              └─> Si requiere aprobación → Estado "pending"
```

#### Publicidad en UI
```
Cada SubcommunityCard muestra:
  🟢 Publicidad: ACTIVA (cada 8 posts)
  🔴 Publicidad: DESACTIVADA
  
Owner/Admin ve toggle:
  ☐ Mostrar publicidad en esta subcomunidad
  └── Frecuencia: [slider cada 3-15 posts]
  └── Tipos permitidos: [feed] [sidebar] [banner]
  
Si plan FREE → Toggle bloqueado, siempre ON
Si plan GROWTH+ → Toggle libre
```

---

### 🧪 TESTING

| Test | Tipo | Archivo |
|------|------|---------|
| Crear subcomunidad | Integration | `__tests__/convex/subcommunities.test.ts` |
| Unirse a subcomunidad | Integration | `__tests__/convex/subcommunities.test.ts` |
| Chat privado (enviar/recibir) | Integration | `__tests__/convex/subcommunityChat.test.ts` |
| Toggle ads según plan | Unit | `__tests__/unit/adToggle.test.ts` |
| TV stream start/stop | Integration | `__tests__/convex/subcommunityTV.test.ts` |
| Acceso denegado (no miembro) | E2E | `__tests__/e2e/subcommunityAccess.test.ts` |

---

### 📊 ESTIMACIÓN

| Fase | Tareas | Tiempo estimado |
|------|--------|-----------------|
| Schema + Backend | 8 | 3-4 horas |
| Chat privado | 3 | 1-2 horas |
| TV privada | 3 | 1-2 horas |
| Publicidad por plan | 4 | 2-3 horas |
| Frontend (vistas) | 6 | 3-4 horas |
| Testing | 4 | 2-3 horas |
| **TOTAL** | **28** | **12-18 horas** |

---

### 📋 TAREAS DESGLOSADAS

| # | Tarea | Prioridad | Estado | Dependencia |
|---|-------|-----------|--------|-------------|
| SC-1 | Agregar tablas al schema (4 tablas) | P0 | ✅ COMPLETADO | - |
| SC-2 | Crear `subcommunities.ts` (CRUD) | P0 | ✅ COMPLETADO | SC-1 |
| SC-3 | Crear `communityPlans.ts` (planes) | P0 | ✅ COMPLETADO | SC-1 |
| SC-4 | Modificar `chat.ts` (type subcommunity) | P0 | ✅ COMPLETADO | SC-1 |
| SC-5 | Crear `subcommunityChat.ts` | P0 | ✅ COMPLETADO | SC-4 |
| SC-6 | Crear `subcommunityTV.ts` | P0 | ✅ COMPLETADO | SC-1 |
| SC-7 | Crear `SubcommunityView.tsx` | P1 | ✅ COMPLETADO | SC-2 |
| SC-8 | Crear `SubcommunityFeed.tsx` | P1 | ✅ COMPLETADO | SC-7 |
| SC-9 | Crear `SubcommunityChat.tsx` | P1 | ✅ COMPLETADO | SC-5 |
| SC-10 | Crear `SubcommunityTV.tsx` | P1 | ✅ COMPLETADO | SC-6 |
| SC-11 | Crear `SubcommunitySettings.tsx` (ads toggle) | P1 | ✅ COMPLETADO | SC-3, SC-7 |
| SC-12 | Crear `CreateSubcommunityModal.tsx` | P1 | ✅ COMPLETADO | SC-2 |
| SC-13 | Crear `SubcommunityCard.tsx` | P1 | ✅ COMPLETADO | SC-2 |
| SC-14 | Mover "Explorar" al top nav | P1 | ✅ COMPLETADO | - |
| SC-15 | Crear `AdToggleControl.tsx` | P1 | ✅ COMPLETADO | SC-3 |
| SC-16 | Crear `PlanManagement.tsx` (admin) | P2 | ✅ COMPLETADO | SC-3 |
| SC-17 | Agregar rutas a `App.tsx` | P1 | ✅ COMPLETADO | SC-7..SC-12 |
| SC-18 | Tests backend subcomunidades | P2 | ✅ COMPLETADO | SC-2, SC-5 |
| SC-19 | Tests publicidad por plan | P2 | ✅ COMPLETADO | SC-3 |
| SC-20 | Integrar TV privada en SubcommunityView | P2 | ✅ COMPLETADO | SC-10 |
| SC-21 | Integrar chat privado en SubcommunityView | P2 | ✅ COMPLETADO | SC-9 |
| SC-22 | Explorar subcomunidades (discover) | P2 | ✅ COMPLETADO | SC-2 |
| SC-23 | Invitaciones a subcomunidades | P2 | ✅ COMPLETADO | SC-2 |
| SC-24 | Notificaciones subcomunidad | P3 | 🔄 PENDIENTE | SC-2 |
| SC-25 | Analytics subcomunidad (views, activity) | P3 | 🔄 PENDIENTE | SC-2 |
| SC-26 | Moderación de contenido subcomunidad | P3 | 🔄 PENDIENTE | SC-2 |
| SC-27 | Export/import datos subcomunidad | P3 | 🔄 PENDIENTE | SC-2 |
| SC-28 | QA final + edge cases | P1 | 🔄 PENDIENTE | Todo |

---

### 🔗 DEPENDENCIAS VISUALES

```
SC-1 (Schema)
├── SC-2 (CRUD subcommunities)
│   ├── SC-7 (SubcommunityView)
│   │   ├── SC-8 (Feed)
│   │   ├── SC-11 (Settings con ads toggle)
│   │   ├── SC-12 (Create modal)
│   │   ├── SC-13 (Card)
│   │   └── SC-17 (Rutas App.tsx)
│   └── SC-22 (Explorar)
├── SC-3 (Planes)
│   ├── SC-11 (Settings)
│   ├── SC-15 (AdToggleControl)
│   └── SC-16 (Admin plan management)
├── SC-4 (Chat type)
│   └── SC-5 (subcommunityChat)
│       └── SC-9 (SubcommunityChat UI)
│           └── SC-21 (Integrar en View)
└── SC-6 (TV)
    └── SC-10 (SubcommunityTV UI)
        └── SC-20 (Integrar en View)
```

---

*📅 FASE 9: 20/03/2026 — Subcomunidades Privadas*
*Estado: EN PROGRESO — 23/28 tareas completadas (82%)*
*✅ Backend completo (6 archivos)*
*✅ Frontend completo (9 archivos)*
*✅ Invitaciones, PlanManagement, Tests, Discover integration*

---

## 🚀 FASE 10: INNOVACIÓN & PWA — TradeHub 3.0 (20/03/2026)

> **🎯 Meta:** Estabilidad total, compromiso diario vía IA y herramientas de negocio para creadores. Ver `.agent/skills/FASE_10_INNOVACION_PWA.md` para briefing detallado.

### 🚨 EMERGENCIA PROTOCOLO (P0)
- [ ] **Fix CSP e Iconos:** Reparar carga de Material Symbols y persistencia de login entre dispositivos.
- [ ] **Ajuste sessionManager:** Eliminar colisiones entre `local_session` y `local_session_user`.

### 📱 PWA & OFFLINE-FIRST (P1)
- [ ] **Offline Feed:** Cachear últimos 20 posts en IndexedDB/Convex local.
- [ ] **Sync Manager:** Reentrancia de posts encolados al recuperar conexión.

### 🤖 IA INTELLIGENCE (P1)
- [ ] **Morning Briefing:** Texto y audio con resumen de Watchlist + News (Investing.com).
- [ ] **Daily Coach:** Recomendación de "Siguiente mejor acción" basada en progreso.

### 📊 CREATOR ANALYTICS (P2)
- [ ] **Engagement Dashboard:** Métricas de conversión (Visitas → Unirse) para comunidades.
- [ ] **Revenue Analytics:** ROI de referidos vs. suscripciones.

---

