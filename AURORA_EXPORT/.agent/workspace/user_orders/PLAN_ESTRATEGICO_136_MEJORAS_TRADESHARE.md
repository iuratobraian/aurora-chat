# 🗺️ PLAN ESTRATÉGICO DE INTEGRACIÓN — 100+ MEJORAS PARA TRADESHARE
## Auditoría Profunda & Hoja de Ruta Operativa

> **Generado**: 2026-03-24 | **Por**: Antigravity Mente Maestra
> **Estado del proyecto**: Lint ✅ | Build ✅ (456KB gz 133KB) | Tests ✅
> **Stack**: React 19 + Convex 1.32 + Express 5 + Vite 6 + TailwindCSS 4

---

# ⚡ PROTOCOLO DE EJECUCIÓN — Estructura `inicio` (Ruflo v3.5)

> [!IMPORTANT]
> **Toda sesión de trabajo sobre este plan DEBE comenzar con el comando `inicio`.**
> Este plan es ejecutable bajo la estructura de 8 pasos del protocolo `inicio` definido en `.agent/skills/inicio/inicio.md`.

## Cómo ejecutar este plan

Cada sprint se ejecuta en ciclos de **3 tareas** (3-Task Batching Law). Al escribir `inicio`, el agente:

### PASO 1 — Hooks de Sesión
```bash
npx @claude-flow/cli@latest hooks session-start --session-id "tradeshare-$(date +%Y%m%d-%H%M)"
npx @claude-flow/cli@latest hooks pre-task --description "Context recovery + session init"
node scripts/aurora-session-brief.mjs
```

### PASO 2 — Contexto (lectura paralela obligatoria)
Leer: `AGENTS.md`, `CLAUDE.md`, `CURRENT_FOCUS.md`, `AGENT_LOG.md` (últimas 3), `TASK_BOARD.md`, `SWARM_AUTO_START_PROTOCOL.md`, `TRADESHARE_AGENT_ROUTING.md`

### PASO 3 — Routing por Sprint
| Sprint | Swarm Code primario | Topología | Agentes mín. | Consenso |
|--------|---------------------|-----------|-------------|----------|
| S1 (Seguridad) | 9 (Security) | hierarchical | security-architect, auditor, coder, tester | raft |
| S2 (Refactoring) | 5 (Refactor) + 3 (Feature) | hierarchical | architect, coder, tester, reviewer | raft |
| S3 (UX/i18n/Backend) | 3 (Feature) + 11 (Convex) | hierarchical | coder, tester, reviewer | raft |
| S4 (Backlog) | 1 (Bug Fix) | single-agent | coder, tester | — |

### PASO 4 — Swarm Init (si ≥3 archivos afectados)
```bash
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 8 --strategy specialized
# Spawn todos los agentes en UN SOLO mensaje → STOP
```

### PASO 5 — Mejora Aurora (AMM)
Antes de cada batch, proponer 1 mejora para Aurora y anotarla en `AGENT_LOG.md`.

### PASO 6 — Batching
Elegir **3 tareas relacionadas** del sprint activo → marcar `claimed` en `TASK_BOARD.md` → actualizar `CURRENT_FOCUS.md`.

### PASO 7 — Ejecución
- Estética: Obsidian Ether (Glassmorphism, HSL curado)
- Complejidad alta: SPARC Methodology (`.agent/skills/SPARC_METHODOLOGY.md`)
- Multi-agente: Hive-Mind Consensus (`.agent/skills/HIVE_MIND_CONSENSUS.md`)

### PASO 8 — Cierre + Loop
```bash
npm run lint && npm test
# → AGENT_LOG.md con fecha, TASK-IDs, archivos, validación
npx @claude-flow/cli@latest hooks post-task --task-id "[id]" --success true
npx @claude-flow/cli@latest hooks session-end --export-metrics true
node scripts/aurora-integrator.mjs sync
# SI hay más tareas pending → volver al PASO 6. PROHIBIDO detenerse.
```

## Mapeo Sprint → Tareas del Plan

| Sprint | IDs del Plan | Dominio | Batch sugerido (3 por ciclo) |
|--------|-------------|---------|------------------------------|
| S1 | SEC-001..020, TEST-001, TEST-015, OPS-001 | Seguridad + Críticos | [SEC-001,SEC-002,SEC-010] → [SEC-003,SEC-013,SEC-005] → [SEC-004,SEC-006,SEC-007] → ... |
| S2 | ARCH-001..020, PERF-001..015 | Arquitectura + Perf | [ARCH-001,ARCH-002,ARCH-009] → [ARCH-003,ARCH-004,ARCH-005] → [ARCH-006,ARCH-007,ARCH-008] → ... |
| S3 | UX-001..020, I18N-001..010, DB-001..010, AI-001..010 | UX/i18n/DB/Aurora | [UX-001,UX-005,UX-013] → [DB-001,DB-005,DB-007] → [AI-001,AI-002,AI-003] → ... |
| S4 | FEAT-001..006, restantes | Features + Backlog | [FEAT-001,FEAT-002,FEAT-004] → [FEAT-005,FEAT-006,FEAT-003] |

---


# DOMINIO 1: SEGURIDAD & AUTENTICACIÓN (20 mejoras)

### SEC-001 — Reemplazar sistema de auth userId-as-token por JWT
**Impacto**: 🔴 CRÍTICO | **Archivos**: `server.ts:775-793`, `src/services/auth/`
**Problema**: La función `verifyTokenWithConvex` recibe el `userId` como token y lo busca en profiles. Esto significa que cualquiera que conozca un userId puede autenticarse como ese usuario. No hay firma criptográfica, no hay expiración, no hay refresh token.
**Solución**: Implementar JWT con `jsonwebtoken`, agregar refresh tokens, almacenar tokens hasheados en Convex. Agregar expiración de 15min para access y 7d para refresh.

### SEC-002 — Eliminar exposición de in-memory data vía WebSocket
**Impacto**: 🔴 CRÍTICO | **Archivos**: `server.ts:830`
**Problema**: Al conectarse un WS client, el server envía `{ type: 'init', data: { posts, ads, users } }` — esto expone TODOS los posts, ads y users en memoria a cualquier conexión WebSocket sin autenticación.
**Solución**: Requerir auth en WS connection. Enviar solo datos necesarios paginados. Nunca enviar lista completa de users.

### SEC-003 — Tipar todos los v.any() del schema Convex
**Impacto**: 🔴 CRÍTICO | **Archivos**: `convex/schema.ts`
**Problema**: `v.any()` acepta cualquier dato sin validación. Encontrado en: `estadisticas`, `Medellas`, `progreso`, `zonaOperativa`, `comentarios`, `signalDetails`, `ratings`, `requirement` (achievements), `data` (notifications), `content` (strategies), y más.
**Solución**: Definir interfaces TypeScript exactas para cada campo. Crear validators reutilizables en `convex/lib/validators.ts`.

### SEC-004 — Hashear passwords con bcrypt cost factor 12
**Impacto**: 🔴 ALTO | **Archivos**: `convex/profiles.ts`, `src/utils/passwordHash.ts`
**Problema**: Verificar que bcrypt usa cost factor ≥ 12 (actualmente tiene bcrypt en deps). Asegurar que no hay passwords en plaintext en ningún lugar.
**Solución**: Auditar todo uso de `password` en schema y mutations. Migrar cualquier password legacy.

### SEC-005 — Rate limiting en endpoints de pago
**Impacto**: 🔴 ALTO | **Archivos**: `server.ts:220-258`
**Problema**: Los endpoints `/api/payments/mercadopago/create` y `/api/payments/zenobank/create` no tienen rate limit específico (el general es 60/min, muy alto para pagos).
**Solución**: Agregar rate limit de 5/min por usuario para endpoints de pago. Logging detallado de intentos.

### SEC-006 — Validar input en todas las mutations de Convex
**Impacto**: 🟡 ALTO | **Archivos**: Todos los `convex/*.ts`
**Problema**: Algunas mutations reciben `args` sin validación suficiente antes de escribir a DB. Ejemplo: `posts.ts` puede recibir HTML malicioso en `contenido`.
**Solución**: Agregar sanitización con DOMPurify en mutations que reciben texto libre. Validar longitudes máximas.

### SEC-007 — CORS restrictivo por ambiente
**Impacto**: 🟡 ALTO | **Archivos**: `server.ts`
**Problema**: No se evidencia configuración CORS explícita en server.ts. Express 5 no tiene CORS por defecto, pero el middleware no se ve.
**Solución**: Agregar `cors` middleware con origins explícitos: producción → dominio real, dev → localhost.

### SEC-008 — Helmet para headers de seguridad HTTP
**Impacto**: 🟡 ALTO | **Archivos**: `server.ts`
**Solución**: Agregar `helmet` middleware para X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security automáticos.

### SEC-009 — Content Security Policy dinámico
**Impacto**: 🟡 ALTO | **Archivos**: `server.ts`, `index.html`
**Problema**: CSP básico puede bloquear TradingView widgets y otras integraciones externas.
**Solución**: CSP con nonces para scripts inline, whitelists para TradingView, YouTube, Google APIs.

### SEC-010 — Proteger WebSocket con token auth
**Impacto**: 🔴 ALTO | **Archivos**: `server.ts:824`
**Problema**: `wss.on('connection')` no verifica autenticación.
**Solución**: Verificar token en upgrade handshake via query param o subprotocol.

### SEC-011 — Audit log para acciones administrativas
**Impacto**: 🟡 MEDIO | **Archivos**: `convex/profiles.ts`, `convex/moderation.ts`
**Problema**: La tabla `auditLogs` existe pero no todas las acciones admin se registran.
**Solución**: Asegurar que role_change, profile_delete, moderation_action siempre escriban audit log.

### SEC-012 — INTERNAL_API_SHARED_KEY rotación
**Impacto**: 🟡 MEDIO | **Archivos**: `.env.example`, `server.ts`
**Solución**: Documentar proceso de rotación. Agregar expiración automática.

### SEC-013 — Path traversal en backup download
**Impacto**: 🟡 ALTO | **Archivos**: `server.ts:695-711`
**Problema**: `/api/backup/download/:date` usa `req.params.date` directamente en path. Un atacante podría enviar `../../etc/passwd`.
**Solución**: Validar que `date` matchee regex `/^\d{4}-\d{2}-\d{2}$/` antes de construir path.

### SEC-014 — Firma de webhooks Stripe
**Impacto**: 🟡 ALTO | **Archivos**: `server.ts`
**Problema**: Verificar que Stripe webhooks validan `stripe-signature` header como MP y Zenobank.
**Solución**: Agregar `stripe.webhooks.constructEvent()` con signing secret.

### SEC-015 — Sanitizar URLs de imágenes de usuario
**Impacto**: 🟡 MEDIO | **Archivos**: `convex/profiles.ts`, `convex/posts.ts`
**Solución**: Validar que URLs de avatar, banner, imagenUrl sean HTTPS y de dominios permitidos.

### SEC-016 — Proteger endpoints Aurora API
**Impacto**: 🟡 MEDIO | **Archivos**: `server.ts` (rutas `/api/aurora/*`)
**Solución**: Asegurar que todas las rutas Aurora requieran `requireInternalAuth`.

### SEC-017 — Deshabilitar debug logging en producción
**Impacto**: 🟢 BAJO | **Archivos**: `serverLogger.ts`
**Solución**: Logger con nivel dinámico: `debug` en dev, `info` en production.

### SEC-018 — Cookie seguridad flags
**Impacto**: 🟡 MEDIO | **Archivos**: `server.ts`
**Solución**: Si se usan cookies: HttpOnly, Secure, SameSite=Strict.

### SEC-019 — Expiración de sesiones WS inactivas
**Impacto**: 🟢 BAJO | **Archivos**: `server.ts:808-860`
**Problema**: Heartbeat cada 30s pero no desconecta tras X pongs fallidos.
**Solución**: Agregar counter de pongs fallidos, desconectar tras 3 misses.

### SEC-020 — Proteger contra request smuggling
**Impacto**: 🟢 BAJO | **Archivos**: `server.ts`
**Solución**: Limitar body size con `express.json({ limit: '1mb' })`.

---

# DOMINIO 2: ARQUITECTURA & REFACTORING (20 mejoras)

### ARCH-001 — Partir server.ts (1620 líneas) en módulos
**Impacto**: 🔴 CRÍTICO | **Archivos**: `server.ts`
**Problema**: server.ts es un monolito con: webhooks, pagos, backups, AI relay, WebSocket, Aurora API, auth middleware, rate limiter, ads, notification clicks.
**Solución**: 
- `server/routes/payments.ts` — MP, Zenobank, Stripe
- `server/routes/webhooks.ts` — webhook handlers
- `server/routes/ai.ts` — AI relay, external providers
- `server/routes/backup.ts` — backup CRUD
- `server/routes/aurora.ts` — Aurora support API
- `server/middleware/auth.ts` — requireAuth, requireInternalAuth
- `server/middleware/rateLimit.ts` — rate limiter
- `server/ws/handler.ts` — WebSocket logic
- `server/index.ts` — orquestar todo

### ARCH-002 — Partir schema.ts (1925 líneas) por dominio
**Impacto**: 🔴 CRÍTICO | **Archivos**: `convex/schema.ts`
**Solución**: Módulos: profiles, content, social, commerce, trading, admin (ver CONV-001 de la orden anterior).

### ARCH-003 — Partir PerfilView.tsx (75KB)
**Impacto**: 🔴 ALTO | **Archivos**: `src/views/PerfilView.tsx`
**Solución**: ProfileHeader, ProfileStats, ProfileTabs, ProfilePurchases, ProfileSignals, ProfileAchievements.

### ARCH-004 — Partir ComunidadView.tsx (55KB)
**Impacto**: 🔴 ALTO | **Archivos**: `src/views/ComunidadView.tsx`
**Solución**: CommunityFeed, CommunitySidebar, CommunityModals, CommunityFilters, CommunityHeader.

### ARCH-005 — Partir MarketplaceView.tsx (51KB)
**Impacto**: 🔴 ALTO | **Archivos**: `src/views/MarketplaceView.tsx`
**Solución**: ProductGrid, ProductFilters, CheckoutFlow, CategoryNav, ProductSearch.

### ARCH-006 — Partir DashboardView.tsx (44KB)
**Impacto**: 🟡 ALTO | **Archivos**: `src/views/DashboardView.tsx`
**Solución**: DashboardStats, DashboardFeed, DashboardSignals, DashboardWidgets.

### ARCH-007 — Partir SignalsView.tsx (41KB)
**Impacto**: 🟡 ALTO | **Archivos**: `src/views/SignalsView.tsx`
**Solución**: SignalList, SignalCreate, SignalDetail, SignalFilters.

### ARCH-008 — Partir AdminView.tsx (40KB)
**Impacto**: 🟡 ALTO | **Archivos**: `src/views/AdminView.tsx`
**Solución**: AdminUsers, AdminContent, AdminAnalytics, AdminModeration, AdminSettings.

### ARCH-009 — React.lazy() para todas las rutas
**Impacto**: 🟡 ALTO | **Archivos**: `src/App.tsx`
**Problema**: App.tsx importa 39 views estáticamente → bundle monolítico.
**Solución**: `const PerfilView = React.lazy(() => import('./views/PerfilView'))` + `<Suspense fallback={<SkeletonLoader/>}>`

### ARCH-010 — Eliminar hook duplicado useNotifications
**Impacto**: 🟡 MEDIO | **Archivos**: `src/hooks/useNotifications.ts` (8.5KB), `src/hooks/useNotificationsOptimized.ts` (7.1KB)
**Problema**: Dos hooks de notificaciones. El `Optimized` parece un reemplazo que nunca se completó.
**Solución**: Migrar a uno solo, eliminar el otro.

### ARCH-011 — Extraer tipos compartidos a `types/` central
**Impacto**: 🟡 MEDIO | **Archivos**: `src/types.ts` (9.7KB), `src/types/`, `server.ts:260-292`
**Problema**: Tipos duplicados entre server.ts (interfaces Publicacion, Ad) y src/types.ts.
**Solución**: Un único source of truth en `src/types/`. Server importa de ahí.

### ARCH-012 — Mover datos estáticos hardcodeados a Convex
**Impacto**: 🟡 MEDIO | **Archivos**: `src/data/staticData.ts` (7.9KB)
**Problema**: Datos de cursos, categorías, niveles hardcodeados en frontend.
**Solución**: Migrar a tabla `app_config` en Convex para que sean editables desde admin.

### ARCH-013 — Crear barrel exports (index.ts) por dominio
**Impacto**: 🟢 BAJO | **Archivos**: `src/components/`, `src/views/`, `src/services/`
**Solución**: Un `index.ts` por directorio que re-exporte para imports más limpios.

### ARCH-014 — Feature flags centralizados
**Impacto**: 🟡 MEDIO | **Archivos**: `src/lib/features.ts` (2.8KB)
**Problema**: Feature flags existen pero son limitados.
**Solución**: Expandir a cubrir: Instagram, Aurora AI, Competitions, Gaming, Push, Ads. Agregar panel admin para togglear.

### ARCH-015 — Error boundaries por ruta/sección
**Impacto**: 🟡 ALTO | **Archivos**: `src/components/ErrorBoundary.tsx` (3KB)
**Problema**: Un solo error boundary global. Si falla un widget, cae toda la app.
**Solución**: Error boundary por cada route lazy y por cada widget crítico (Trading, Charts, Chat).

### ARCH-016 — Service Worker actualizado para offline
**Impacto**: 🟡 MEDIO | **Archivos**: `public/sw.js`
**Solución**: Cache-first para assets estáticos, network-first para API. Soporte offline básico para feed.

### ARCH-017 — Environment config centralizado
**Impacto**: 🟢 BAJO | **Archivos**: `src/config/`, `.env.example`
**Problema**: URLs y configs dispersas. CONVEX_URL hardcodeada en server.ts:20.
**Solución**: Centralizar en `src/config/env.ts` con validación Zod al startup.

### ARCH-018 — Database migrations strategy
**Impacto**: 🟡 MEDIO | **Archivos**: `convex/`
**Problema**: Schema changes no tienen proceso de migración documentado.
**Solución**: Crear `convex/migrations/` con scripts numerados y guía en README.

### ARCH-019 — Crear módulo compartido client/server
**Impacto**: 🟢 BAJO | **Archivos**: Nuevo `shared/`
**Solución**: Tipos, validadores y constantes usados por ambos lados en un solo lugar.

### ARCH-020 — Eliminar in-memory database del server
**Impacto**: 🟡 MEDIO | **Archivos**: `server.ts:294-297`
**Problema**: `let posts = []; let ads = []; let users = [];` — datos in-memory duplican Convex.
**Solución**: Eliminar. Todo dato viene de Convex queries. Server es stateless.

---

# DOMINIO 3: PERFORMANCE & BUNDLE (15 mejoras)

### PERF-001 — Code splitting por route group
**Impacto**: 🔴 ALTO | **Archivos**: `src/App.tsx`, `vite.config.ts`
**Solución**: Chunks: core (auth, feed), trading (signals, charts), admin, marketing, community.

### PERF-002 — Tree-shaking de Convex queries
**Impacto**: 🟡 MEDIO | **Archivos**: `convex/_generated/api.js`
**Solución**: Import específicos `api.posts.getById` en vez de `api` completo.

### PERF-003 — Image lazy loading con IntersectionObserver
**Impacto**: 🟡 ALTO | **Archivos**: `src/components/ImageLazyLoad.tsx` (1.5KB)
**Problema**: Componente existe pero es muy básico.
**Solución**: Agregar blur placeholder, progressive loading, WebP/AVIF format detection.

### PERF-004 — Virtualizar listas largas (posts, signals, users)
**Impacto**: 🟡 ALTO | **Archivos**: Feed, SignalList, Leaderboard
**Solución**: `react-window` o `@tanstack/virtual` para listas > 50 items.

### PERF-005 — Memoizar componentes pesados con React.memo
**Impacto**: 🟡 MEDIO | **Archivos**: `PostCard.tsx`, `Navigation.tsx`
**Problema**: Re-renders innecesarios en el feed al interactuar (like, comment).
**Solución**: `React.memo()` + `useMemo` para datos derivados.

### PERF-006 — Optimizar queries Convex con paginación
**Impacto**: 🟡 ALTO | **Archivos**: `convex/posts.ts`, `convex/communities.ts`
**Problema**: Algunas queries traen todos los registros sin paginación.
**Solución**: Implementar cursor-based pagination en queries que devuelven listas.

### PERF-007 — Preload de rutas críticas
**Impacto**: 🟢 BAJO | **Archivos**: `src/components/Navigation.tsx`
**Solución**: `<link rel="prefetch">` para las 3 rutas más visitadas basado en analytics.

### PERF-008 — Debounce en SearchBar y filtros
**Impacto**: 🟡 MEDIO | **Archivos**: `src/components/SearchBar.tsx`, `CommunitySearch.tsx`
**Solución**: 300ms debounce para prevenir queries excesivas.

### PERF-009 — Bundle analyzer para detectar deps grandes
**Impacto**: 🟢 BAJO | **Archivos**: `vite.config.ts`
**Solución**: Agregar `rollup-plugin-visualizer` para inspeccionar bundle.

### PERF-010 — Font subsetting
**Impacto**: 🟢 BAJO | **Archivos**: `src/index.css`, `index.html`
**Solución**: Cargar solo subsets latin/latin-ext de Google Fonts. `font-display: swap`.

### PERF-011 — Critical CSS inline
**Impacto**: 🟢 BAJO | **Archivos**: `index.html`
**Solución**: Inline el CSS above-the-fold para First Contentful Paint.

### PERF-012 — Reducir re-renders del ticker
**Impacto**: 🟡 MEDIO | **Archivos**: `src/components/Ticker.tsx`
**Problema**: Ticker de precios puede causar re-renders constantes.
**Solución**: Aislar estado del ticker en su propio contexto.

### PERF-013 — Preconnect a servicios externos
**Impacto**: 🟢 BAJO | **Archivos**: `index.html`
**Solución**: `<link rel="preconnect" href="https://notable-sandpiper-279.convex.cloud">` + TradingView, Google Fonts.

### PERF-014 — Comprimir backups con gzip
**Impacto**: 🟢 BAJO | **Archivos**: `server.ts:629-676`
**Solución**: Comprimir backups JSON con `zlib.gzipSync` antes de escribir.

### PERF-015 — Cache de TradingView widgets
**Impacto**: 🟡 MEDIO | **Archivos**: `src/components/TradingViewWidget.tsx`
**Solución**: Cachear widget instances para evitar re-init al navegar entre tabs.

---

# DOMINIO 4: UX & FRONTEND (20 mejoras)

### UX-001 — Skeleton loaders por sección (no global)
**Impacto**: 🟡 ALTO | **Archivos**: `src/components/SkeletonLoader.tsx` (8KB)
**Problema**: Skeleton genérico para todo. No se parece al contenido real.
**Solución**: Skeleton específicos: PostCardSkeleton, ProfileSkeleton, SignalSkeleton.

### UX-002 — Onboarding interactivo con tooltips progresivos
**Impacto**: 🟡 ALTO | **Archivos**: `src/components/OnboardingFlow.tsx` (6.9KB)
**Problema**: Onboarding es un modal estático.
**Solución**: Tour con tooltips que señalan funciones reales de la UI (post, señal, perfil, comunidad).

### UX-003 — Notificaciones toast con undo action
**Impacto**: 🟡 MEDIO | **Archivos**: `src/components/ToastProvider.tsx` (2.8KB)
**Solución**: Agregar acción "Deshacer" en toasts para acciones destructivas (delete post, unfollow).

### UX-004 — Dark/Light mode persistente
**Impacto**: 🟡 MEDIO | **Archivos**: `src/hooks/useTheme.ts` (2.2KB), `src/components/ThemeSelector.tsx`
**Solución**: Persisitir preferencia en localStorage y en profile Convex. Sincronizar across devices.

### UX-005 — Infinite scroll en feed con pull-to-refresh
**Impacto**: 🟡 ALTO | **Archivos**: `src/hooks/usePostsFeed.ts`
**Solución**: Cursor-based infinite scroll + pull-to-refresh gesture en mobile.

### UX-006 — Animaciones de transición entre vistas
**Impacto**: 🟡 MEDIO | **Archivos**: `src/components/ViewTransition.tsx` (2.6KB)
**Problema**: Componente existe pero no se usa en todas las rutas.
**Solución**: Integrar con todos los `React.lazy()` routes para fade/slide transitions.

### UX-007 — Empty states para todas las listas
**Impacto**: 🟡 MEDIO | **Archivos**: Múltiples views
**Problema**: Listas vacías muestran "nada" sin guía.
**Solución**: Ilustración + CTA en cada lista vacía (posts, signals, communities, notifications).

### UX-008 — Accesibilidad WCAG 2.1 AA
**Impacto**: 🟡 ALTO | **Archivos**: Global
**Solución**: aria-labels en botones icon-only, contraste mínimo 4.5:1, focus visible, skip-to-content.

### UX-009 — Responsive design audit
**Impacto**: 🟡 ALTO | **Archivos**: 6 views principales
**Solución**: Auditar breakpoints 320px, 768px, 1024px, 1440px. Fixear overflow en mobile.

### UX-010 — Keyboard shortcuts para power users
**Impacto**: 🟢 BAJO | **Archivos**: Nuevo `src/hooks/useKeyboardShortcuts.ts`
**Solución**: `N` nueva señal, `P` nuevo post, `F` buscar, `D` dashboard, `S` settings.

### UX-011 — Loading states consistentes
**Impacto**: 🟡 MEDIO | **Archivos**: Global
**Problema**: Algunos componentes muestran spinner, otros skeleton, otros nada.
**Solución**: Estandarizar: skeleton para contenido, spinner para acciones, progress para uploads.

### UX-012 — Confirmación en acciones destructivas
**Impacto**: 🟡 MEDIO | **Archivos**: Global
**Solución**: Modal de confirmación para: delete post, leave community, cancel subscription.

### UX-013 — Optimistic updates en likes y follows
**Impacto**: 🟡 ALTO | **Archivos**: `src/components/PostCard.tsx`
**Problema**: Like espera respuesta de Convex antes de actualizar UI.
**Solución**: Update UI inmediato, revert on error.

### UX-014 — Form validation visual (inline errors)
**Impacto**: 🟡 MEDIO | **Archivos**: AuthModal, CreatePostInline, ConfiguracionView
**Solución**: Errores inline debajo del campo con transición. No solo toast.

### UX-015 — Badge count en navegación
**Impacto**: 🟢 BAJO | **Archivos**: `src/components/Navigation.tsx`
**Solución**: Badge rojo con count de: notificaciones unread, messages unread, tareas pendientes.

### UX-016 — Feedback háptico en mobile
**Impacto**: 🟢 BAJO | **Archivos**: Capacitor integration
**Solución**: Vibración sutil en like, achievement unlock, level up.

### UX-017 — Scroll to top en cambio de ruta
**Impacto**: 🟢 BAJO | **Archivos**: `src/App.tsx`
**Solución**: `window.scrollTo(0,0)` en cada route change.

### UX-018 — Image cropper para avatares
**Impacto**: 🟡 MEDIO | **Archivos**: `src/services/imageUpload.ts`
**Solución**: Crop circular para avatar, rectangular para banner. Preview antes de upload.

### UX-019 — Rich text editor para posts
**Impacto**: 🟡 MEDIO | **Archivos**: `src/components/CreatePostInline.tsx` (43KB)
**Solución**: Markdown preview, bold, italic, links, code blocks, emoji picker.

### UX-020 — Global command palette (Ctrl+K)
**Impacto**: 🟡 MEDIO | **Archivos**: Nuevo componente
**Solución**: Cmd+K abre búsqueda universal: personas, comunidades, señales, secciones.

---

# DOMINIO 5: INTERNACIONALIZACIÓN & CONTENIDO (10 mejoras)

### I18N-001 — Expandir traducciones a cobertura completa
**Impacto**: 🟡 ALTO | **Archivos**: `src/i18n/es.json` (2.4KB), `en.json` (2.3KB), `pt.json` (2.4KB)
**Problema**: Solo ~80 keys traducidas. La app tiene cientos de strings hardcodeados.
**Solución**: Auditar todos los strings visibles → agregar a los 3 JSON. Meta: > 500 keys.

### I18N-002 — Agregar idiomas: Francés, Italiano, Alemán
**Impacto**: 🟡 MEDIO | **Archivos**: `src/i18n/`
**Solución**: Crear `fr.json`, `it.json`, `de.json`. Agregar selector en ConfiguracionView.

### I18N-003 — Formateo de números y monedas por locale
**Impacto**: 🟡 MEDIO | **Archivos**: Global
**Solución**: `Intl.NumberFormat` con locale del usuario para precios, XP, saldos.

### I18N-004 — Fechas relativas localizadas
**Impacto**: 🟢 BAJO | **Archivos**: PostCard, notifications
**Solución**: "hace 5 min" / "5 minutes ago" con `Intl.RelativeTimeFormat`.

### I18N-005 — SEO meta tags por idioma
**Impacto**: 🟡 MEDIO | **Archivos**: `src/components/SEO.tsx`
**Solución**: `hreflang` alternates, meta description en idioma activo.

### I18N-006 — Strings en convex functions
**Impacto**: 🟢 BAJO | **Archivos**: `convex/*.ts`
**Problema**: Error messages en español hardcodeados en mutations.
**Solución**: Centralizar error codes y dejar que el frontend traduzca.

### I18N-007 — RTL support preparation
**Impacto**: 🟢 BAJO | **Archivos**: `src/index.css`
**Solución**: CSS logical properties (margin-inline-start vs margin-left) para futuro soporte árabe.

### I18N-008 — Pluralización correcta
**Impacto**: 🟢 BAJO | **Archivos**: `src/i18n/`
**Solución**: Usar `i18next` plural rules en vez de `{count} seguidores`.

### I18N-009 — Email templates localizados
**Impacto**: 🟡 MEDIO | **Archivos**: `src/services/emailService.ts`
**Solución**: Templates de email en 3+ idiomas basado en preferencia del usuario.

### I18N-010 — Contenido legal por jurisdicción
**Impacto**: 🟡 MEDIO | **Archivos**: `src/views/LegalView.tsx`
**Solución**: Términos y privacidad adaptados por país (AR, US, BR, EU).

---

# DOMINIO 6: TESTING & CALIDAD (15 mejoras)

### TEST-001 — Tests unitarios para pagos (0% actual)
**Impacto**: 🔴 CRÍTICO | **Archivos**: `convex/payments.ts`, `convex/webhooks.ts`
**Solución**: Tests con mocks para MP, Zenobank, Stripe. Casos: éxito, fallo, duplicado, timeout.

### TEST-002 — Tests de integración para auth flow
**Impacto**: 🔴 ALTO | **Archivos**: `src/components/AuthModal.tsx`
**Solución**: Tests de login, register, Google Sign-In con mocks de Convex.

### TEST-003 — Tests de rate limiting
**Impacto**: 🟡 ALTO | **Archivos**: `convex/moderation.ts`
**Solución**: Verificar que rate limit funciona en chat, posts, likes.

### TEST-004 — Tests de signal creation y lifecycle
**Impacto**: 🟡 ALTO | **Archivos**: `convex/signals.ts`
**Solución**: Test completo: crear señal → hit TP → calcular accuracy → actualizar perfil.

### TEST-005 — Smoke tests con Playwright
**Impacto**: 🟡 ALTO | **Archivos**: Nuevo `e2e/`
**Solución**: Smoke tests: login, crear post, ver feed, ver perfil, navegar secciones.

### TEST-006 — Tests para services/ (0% actual)
**Impacto**: 🟡 ALTO | **Archivos**: `src/services/`
**Solución**: paymentOrchestrator, emailService, newsService, imageUpload.

### TEST-007 — Coverage ≥ 80%
**Impacto**: 🟡 ALTO | **Archivos**: Global
**Solución**: Configurar threshold en vitest.config. CI falla si baja de 80%.

### TEST-008 — Snapshot tests para componentes UI
**Impacto**: 🟢 BAJO | **Archivos**: Componentes clave
**Solución**: Snapshots de PostCard, Navigation, AuthModal, SkeletonLoader.

### TEST-009 — Test de mutations idempotentes
**Impacto**: 🟡 MEDIO | **Archivos**: `convex/posts.ts`, `convex/payments.ts`
**Solución**: Verificar que llamar una mutation dos veces no duplica datos.

### TEST-010 — Load testing del WebSocket
**Impacto**: 🟡 MEDIO | **Archivos**: `server.ts`
**Solución**: Script que simule 100 clientes WS simultáneos y mida latencia/memory.

### TEST-011 — Validar schemas antes de deploy
**Impacto**: 🟡 MEDIO | **Archivos**: `convex/schema.ts`
**Solución**: Pre-deploy hook que corra `npx convex dev --typecheck` sin push.

### TEST-012 — Tests de deep linking
**Impacto**: 🟢 BAJO | **Archivos**: `src/utils/deeplink.ts`
**Solución**: Tests para las 25+ rutas de deep link.

### TEST-013 — Visual regression tests
**Impacto**: 🟢 BAJO | **Archivos**: Nuevo
**Solución**: Screenshots comparativos en desktop y mobile con Playwright.

### TEST-014 — Tests de Aurora scripts
**Impacto**: 🟡 MEDIO | **Archivos**: `scripts/aurora-*.mjs`
**Solución**: Tests para session-brief, drift-report, inicio. Verificar que no crashean.

### TEST-015 — Mutation auth guards tests
**Impacto**: 🔴 ALTO | **Archivos**: `convex/*.ts`
**Solución**: Verificar que mutations admin-only realmente verifican role antes de ejecutar.

---

# DOMINIO 7: CONVEX & BACKEND (10 mejoras)

### DB-001 — Índices faltantes en tablas frecuentes
**Impacto**: 🟡 ALTO | **Archivos**: `convex/schema.ts`
**Problema**: Queries filtran post-fetch sin usar índices.
**Solución**: Auditar todas las queries `.filter()` y agregar índices correspondientes.

### DB-002 — Soft delete consistente
**Impacto**: 🟡 MEDIO | **Archivos**: `convex/posts.ts`, `convex/profiles.ts`
**Problema**: Algunas tablas usan `isDeleted`, otras `status: 'deleted'`.
**Solución**: Estandarizar en `status: 'deleted'` con timestamp `deletedAt`.

### DB-003 — Cron jobs para limpieza de datos
**Impacto**: 🟡 MEDIO | **Archivos**: `convex/crons.ts` (875 bytes — casi vacío)
**Solución**: Crons para: limpiar rateLimits expirados, archivar posts viejos, reset weekly XP.

### DB-004 — Denormalizar contadores frecuentes
**Impacto**: 🟡 MEDIO | **Archivos**: `convex/posts.ts`, `convex/communities.ts`
**Problema**: Contar likes/comentarios requiere leer el array completo.
**Solución**: Campos `likesCount` y `commentsCount` que se actualizan atómicamente.

### DB-005 — Webhooks persistence en Convex
**Impacto**: 🟡 ALTO | **Archivos**: `convex/webhooks.ts`
**Problema**: Webhooks procesados se guardan in-memory en server.ts (se pierden al restart).
**Solución**: Guardar ID procesados en tabla Convex con TTL de 24h.

### DB-006 — Backup real de Convex data
**Impacto**: 🟡 ALTO | **Archivos**: `server.ts:629-676`
**Problema**: El backup actual solo guarda los últimos 500 registros de 2 tablas.
**Solución**: Backup completo de todas las tablas con paginación. Export a S3/GCS.

### DB-007 — Optimizar queries N+1
**Impacto**: 🟡 ALTO | **Archivos**: `convex/posts.ts`, `convex/communities.ts`
**Problema**: Al traer posts, se hace query individual por cada userId para obtener perfil.
**Solución**: Batch profiles lookup con `Promise.all()` + cache in-memory durante la query.

### DB-008 — Schema versioning
**Impacto**: 🟡 MEDIO | **Archivos**: `convex/schema.ts`
**Solución**: Agregar campo `_schemaVersion` a tablas que cambian frecuentemente.

### DB-009 — Eliminar tabla posts in-memory de server
**Impacto**: 🟡 MEDIO | **Archivos**: `server.ts:294-297`
**Solución**: Server no necesita copia local de posts/ads/users. Todo vía Convex.

### DB-010 — Validar foreign keys en mutations
**Impacto**: 🟡 MEDIO | **Archivos**: `convex/*.ts`
**Problema**: Algunos mutations usan `string` para IDs de relación en vez de `v.id("tabla")`.
**Solución**: Migrar a `v.id()` donde sea posible para integridad referencial.

---

# DOMINIO 8: AURORA & AGENTES IA (10 mejoras)

### AI-001 — Pipeline RETRIEVE→JUDGE→DISTILL→CONSOLIDATE
**Impacto**: 🔴 ALTO | **Archivos**: `scripts/aurora-intelligence-pipeline.mjs`
**Detalle**: Ver AURORA-INT-001 en orden maestra.

### AI-002 — Memory backend SQLite + HNSW
**Impacto**: 🔴 ALTO | **Archivos**: `lib/aurora/memory-backend.mjs`
**Detalle**: Ver AURORA-INT-002 en orden maestra.

### AI-003 — Doctor health check
**Impacto**: 🟡 ALTO | **Archivos**: `scripts/aurora-doctor.mjs`
**Detalle**: Ver AURORA-INT-003 en orden maestra.

### AI-004 — Background workers
**Impacto**: 🟡 ALTO | **Archivos**: `scripts/aurora-workers.mjs`
**Detalle**: Ver AURORA-INT-004 en orden maestra.

### AI-005 — Token optimizer 3 capas
**Impacto**: 🟡 ALTO | **Archivos**: `scripts/aurora-token-optimizer.mjs`
**Detalle**: Ver AURORA-INT-005 en orden maestra.

### AI-006 — Task router inteligente
**Impacto**: 🟡 ALTO | **Archivos**: `scripts/aurora-task-router.mjs`
**Detalle**: Ver AURORA-INT-006 en orden maestra.

### AI-007 — AI Room con multi-provider failover
**Impacto**: 🟡 MEDIO | **Archivos**: `server.ts:507-535`
**Problema**: Failover existe pero no guarda métricas de qué provider falló y por qué.
**Solución**: Logging estructurado + metrics per provider para elegir mejor fallback order.

### AI-008 — Aurora context injection antes de cada sesión
**Impacto**: 🟡 MEDIO | **Archivos**: `scripts/aurora-context-injector.mjs`
**Solución**: Al iniciar sesión AI, inyectar knowledge relevante automáticamente.

### AI-009 — Aurora auto-validation post-deploy
**Impacto**: 🟡 MEDIO | **Archivos**: `scripts/aurora-auto-validate.mjs`
**Solución**: Post-deploy smoke test automático que verifica que rutas críticas responden.

### AI-010 — Embeddings para búsqueda semántica en posts
**Impacto**: 🟡 MEDIO | **Archivos**: `convex/posts.ts`, Nuevo servicio
**Solución**: Generar embeddings de cada post al crear. Buscar posts similares por semántica.

---

# DOMINIO 9: INFRAESTRUCTURA & DEVOPS (10 mejoras)

### OPS-001 — CI/CD pipeline con GitHub Actions
**Impacto**: 🔴 ALTO | **Archivos**: `.github/workflows/ci.yml`
**Solución**: PR checks: lint, typecheck, tests, build. Deploy: auto-deploy a Vercel+Convex on merge to main.

### OPS-002 — Pre-commit hooks (husky + lint-staged)
**Impacto**: 🟡 ALTO | **Archivos**: `package.json`, `.husky/`
**Solución**: `lint-staged` corre `tsc --noEmit` y prettier en archivos tocados.

### OPS-003 — Monitoring con Sentry error tracking
**Impacto**: 🟡 ALTO | **Archivos**: `src/sentry.ts` (657 bytes)
**Problema**: Sentry está configurado pero probablemente con setup mínimo.
**Solución**: Agregar breadcrumbs, user context, performance traces en routes críticas.

### OPS-004 — Health check endpoint completo
**Impacto**: 🟡 MEDIO | **Archivos**: `server.ts:571`
**Problema**: `/health-metrics` devuelve métricas básicas.
**Solución**: Agregar: Convex connectivity check, WebSocket status, disk space, memory usage, uptime.

### OPS-005 — Structured logging con JSON
**Impacto**: 🟡 MEDIO | **Archivos**: `serverLogger.ts`
**Solución**: Logs JSON con: timestamp, level, requestId, userId, action, duration. Compatible con CloudWatch/Datadog.

### OPS-006 — Environment validation al startup
**Impacto**: 🟡 ALTO | **Archivos**: `server.ts`
**Solución**: Verificar al arrancar que todas las env vars requeridas existen. Listar las faltantes y fallar rápido.

### OPS-007 — Docker compose para dev local
**Impacto**: 🟢 BAJO | **Archivos**: `docker-compose.yml`
**Solución**: Container con Node, Convex CLI. `docker compose up` para onboarding instantáneo.

### OPS-008 — Dependencias: Actualizar Convex a 1.35+
**Impacto**: 🟡 MEDIO | **Archivos**: `package.json`
**Problema**: Convex 1.32.0 tiene bugs conocidos con paginación.
**Solución**: Update gradual, test de deploy en staging.

### OPS-009 — Bundle size budget en CI
**Impacto**: 🟡 MEDIO | **Archivos**: CI config
**Solución**: Fallar CI si bundle gzip > 200KB. Alertar si crece > 10% entre PRs.

### OPS-010 — Staging environment
**Impacto**: 🟡 ALTO | **Archivos**: Vercel + Convex
**Solución**: Branch `staging` con su propio Convex project para testing pre-prod.

---

# DOMINIO 10: FUNCIONALIDADES SUELTAS (5+ mejoras)

### FEAT-001 — Instagram integration incompleta
**Impacto**: 🟡 MEDIO | **Archivos**: `src/instagram/`, `convex/instagram/`
**Problema**: Carpeta Instagram existe con código parcial. Callback, tokens, pero flujo no terminado.
**Solución**: Completar OAuth flow, Media Graph API, scheduled posting.

### FEAT-002 — Competitions sin lifecycle completo
**Impacto**: 🟡 MEDIO | **Archivos**: `convex/competitions.ts` (3.6KB)
**Problema**: Solo 3.6KB — probablemente tiene CRUD básico sin scoring automático.
**Solución**: Crear leaderboard automático, premios, timeline, notificaciones.

### FEAT-003 — Gaming room básica
**Impacto**: 🟢 BAJO | **Archivos**: `src/components/GamingRoom.tsx` (9.2KB)
**Solución**: Agregar mini-juegos de trading: quiz de patterns, simulador de scalping.

### FEAT-004 — Push notifications sin test de entrega
**Impacto**: 🟡 MEDIO | **Archivos**: `convex/push.ts`, `convex/pushActions.ts`
**Solución**: Test panel en admin para enviar push de prueba. Reportar delivery rate.

### FEAT-005 — Referral system testing
**Impacto**: 🟡 MEDIO | **Archivos**: `convex/referrals.ts` (19KB)
**Problema**: Lógica compleja (19KB) que necesita tests.
**Solución**: Tests end-to-end del flujo: crear código → registrarse con código → acreditar bonus.

### FEAT-006 — Trader verification workflow incompleto
**Impacto**: 🟡 MEDIO | **Archivos**: `convex/traderVerification.ts` (5.3KB)
**Solución**: Conectar con KYCUpload, workflow de aprobación admin, badge de verificado.

---

# 📊 RESUMEN EJECUTIVO

| Dominio | Cantidad | Críticas | Altas | Medias | Bajas |
|---------|----------|----------|-------|--------|-------|
| 🔒 Seguridad & Auth | 20 | 5 | 8 | 5 | 2 |
| 🏗️ Arquitectura & Refactoring | 20 | 3 | 6 | 7 | 4 |
| ⚡ Performance & Bundle | 15 | 1 | 5 | 4 | 5 |
| 🎨 UX & Frontend | 20 | 0 | 5 | 10 | 5 |
| 🌍 Internacionalización | 10 | 0 | 2 | 4 | 4 |
| 🧪 Testing & Calidad | 15 | 3 | 5 | 4 | 3 |
| 🗄️ Convex & Backend | 10 | 0 | 4 | 5 | 1 |
| 🧠 Aurora & Agentes IA | 10 | 2 | 5 | 3 | 0 |
| 🔧 Infraestructura & DevOps | 10 | 1 | 4 | 3 | 2 |
| ✨ Funcionalidades Sueltas | 6 | 0 | 0 | 4 | 2 |
| **TOTAL** | **136** | **15** | **44** | **49** | **28** |

---

# 🎯 ORDEN DE EJECUCIÓN — Protocolo `inicio` (8 Pasos)

> Cada sprint se ejecuta en ciclos de 3-Task Batching. Escribir `inicio` antes de cada ciclo.
> Referencia completa: `.agent/skills/inicio/inicio.md`

```
SPRINT 1 (URGENTE) — Swarm Code 9 (Security)
┌── inicio → Paso 1-2: Hooks + Contexto
├── Paso 3: Routing → Code 9, topología hierarchical, consenso raft
├── Paso 4: Swarm Init → security-architect, auditor, coder, tester
├── Paso 5: AMM → 1 mejora Aurora
├── Paso 6: Batch 1 [SEC-001, SEC-002, SEC-010]
│   ├── SEC-001 Auth JWT
│   ├── SEC-002 WS auth + no data dump
│   └── SEC-010 Proteger WS con token
├── Paso 7: SPARC para cada tarea
├── Paso 8: lint + test + AGENT_LOG → loop
├── Batch 2 [SEC-003, SEC-013, SEC-005]
├── Batch 3 [SEC-004, SEC-006, SEC-007]
├── Batch 4 [ARCH-001, ARCH-002, SEC-014]
├── Batch 5 [TEST-001, TEST-015, OPS-001]
└── Paso 8 final: session-end → export-metrics → aurora sync

SPRINT 2 (SEMANA 1-2) — Swarm Code 5 (Refactor) + 3 (Feature)
┌── inicio → Paso 1-2: Hooks + Contexto
├── Paso 3: Routing → Code 5+3, topología hierarchical
├── Paso 4: Swarm Init → architect, coder, tester, reviewer
├── Batch 1 [ARCH-003, ARCH-004, ARCH-005]       (Views gigantes)
├── Batch 2 [ARCH-006, ARCH-007, ARCH-008]       (Más views)
├── Batch 3 [ARCH-009, PERF-001, ARCH-015]       (Lazy + splitting)
├── Batch 4 [UX-001, UX-005, UX-013]             (Skeleton + feed)
├── Batch 5 [AI-001, AI-002, AI-003]             (Aurora intelligence)
├── Batch 6 [TEST-002, TEST-004, TEST-006]       (Tests críticos)
└── Paso 8 final: session-end

SPRINT 3 (SEMANA 3-4) — Swarm Code 3 (Feature) + 11 (Convex)
┌── inicio → Paso 1-2
├── Batch 1 [DB-001, DB-005, DB-007]             (Índices + N+1)
├── Batch 2 [I18N-001, I18N-003, I18N-005]      (Traducciones)
├── Batch 3 [UX-006, UX-008, UX-009]            (Animaciones + a11y)
├── Batch 4 [AI-004, AI-005, AI-006]            (Workers + optimizer)
├── Batch 5 [FEAT-001, FEAT-002, FEAT-004]      (Instagram + comps)
└── Paso 8 final: session-end

SPRINT 4 (BACKLOG) — Swarm Code 1 (Bug Fix), single-agent
┌── inicio (modo simplificado, sin swarm)
├── Batch 1 [PERF-010, PERF-011, PERF-013]     (Font + CSS + preconnect)
├── Batch 2 [UX-010, UX-016, UX-017]           (Shortcuts + haptic)
├── Batch 3 [FEAT-003, FEAT-005, FEAT-006]     (Gaming + referral)
└── Paso 8 final: session-end + ZERO LOSS backup
```

> [!CAUTION]
> **REGLAS DE ORO (del protocolo `inicio`):**
> - `AUTONOMÍA`: No preguntar si el plan es claro cuando hay tareas pending
> - `EVOLUCIÓN`: 1 mejora Aurora por sesión mínimo (AMM obligatorio)
> - `ANTI-DRIFT`: Máx 8 agentes, topología `hierarchical`, consenso `raft`
> - `ZERO LOSS`: Cerrar sesión con hook + sync Aurora + commit
> - `INMUTABILIDAD`: No alterar este plan sin orden del Usuario
> - `3-TASK BATCH`: Siempre 3 tareas por ciclo, nunca más
> - `SINGLE-MESSAGE SPAWN`: Init → Spawn All → STOP (nunca poll)

