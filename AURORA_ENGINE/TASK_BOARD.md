# 📋 TASK BOARD - TRADESHARE

> Sincronizado desde Notion — 1/4/2026, 05:21:57
> ⚠️  Este archivo se actualiza automáticamente al marcar tareas en Notion.

| ID | Tarea | Estado | Prioridad | Tipo | Dominio | Notas |
|:---|:---|:---:|:---:|:---:|:---|:---|
| DOCS-001 | Documentar instalación de Gemma Code Studio | ✅ done | Alta | Docs | Gemma | Guía de instalación y protocolos para el equipo. |
| FIX-011 | Reparar creación de comunidades (Discover & Admin) | ✅ done | Alta | Bug | Comunidad | Fallo en eventos de navegación y validación de rol en backend. |
| STAB-POST-PERSISTENCE | Reparación de Guardado de Posts y Estabilidad UI | ✅ done | Crítica | Estabilidad | Backend/UI | Refactor de savedPosts y protección defensiva en PostCard. |
| UI-CONTRAST | Refinamiento de Contraste y Definición Premium | ✅ done | Media | UI | Diseño | Fortalecimiento de bordes, sombras y contraste (Light Mode). |
| STAB-COM-DETAIL | Estabilización de CommunityDetailView y Routing | ✅ done | Alta | Estabilidad | Comunidad | Resolución de error React #185 y bucles de navegación infinita. |
| FIX-INT-001 | Restaurar interacciones (Posts, Comentarios, Communities) | ✅ done | Crítica | Bug | Seguridad | Bridge de Auth restaurado y mutations actualizadas. |

## 📌 Pendientes (Anteriores)

| ID | Tarea | Estado | Prioridad | Tipo | Dominio | Notas |
|:---|:---|:---:|:---:|:---:|:---|:---|
| SEC-001 | Type Safety - Eliminar 240+ 'as any' | ✅ done | Alta | Seguridad | Types | Antigravity - 17/04/2026 |
| SEC-002 | CSP Headers en server.ts | ✅ done | Alta | Seguridad | Headers | Content-Security-Policy implementado en server.ts |
| SEC-003 | Rate Limiting AI y Auth | ✅ done | Alta | Seguridad | RateLimit | Antigravity - 17/04/2026 |
| SEC-004 | XSS Sanitization (Input filtering) | ✅ done | Alta | Seguridad | XSS | Middleware global con DOMPurify aplicado |
| SEC-005 | Webhook Signature Verification (MercadoPago) | ✅ done | Alta | Seguridad | Webhooks | Antigravity - 17/04/2026 |
| STAB-001 | Error Boundaries en vistas críticas | ✅ done | Media | Estabilidad | Error Handling | Antigravity - 17/04/2026 |
| FEAT-001 | Integrar Ollama en Chat UI | ✅ done | Alta | Feature | AI | Antigravity - 17/04/2026 |
| FEAT-002 | Dashboard de costes AI | ✅ done | Media | Feature | Metrics | Antigravity - 17/04/2026 |
| FEAT-003 | Community Subscriptions & MercadoPago Flow | ✅ done | Crítica | Feature | Payments | Antigravity - 16/04/2026 |
| SEC-006 | Restricción IP-Lock (max 2 accounts/IP) | ✅ done | Crítica | Seguridad | Auth | Implementado en backend y frontend con ipify |
| FEAT-PWA | Notificaciones Push & Offline Caching (sw.js) | ✅ done | Alta | Feature | PWA | WebPush enabled + Aura Chime sound + Offline feed |
| FEAT-MKT | Segmentación de usuarios (Nivel Experiencia) | ✅ done | Media | Feature | Admin | Filtros de marketing añadidos al UsersSection |
| SESSION | SESIÓN: Hardening Seguridad & PWA | ✅ done | - | - | - | Despliegue de seguridad y optimización de experiencia |
| FIX-KEY-001 | Solucionar bloqueo de teclado global | ✅ done | Crítica | Bug | UI | Fixed in VideoProtection and ShortsPlayer |
| FEAT-REG-001 | Registro interactivo y personalizado (Aurora) | ✅ done | Alta | Feature | Auth | Multi-step interactive flow with preferences |

## 🛠️ PLAN MAESTRO DE REPARACIÓN (Activas)

| ID | Tarea | Estado | Prioridad | Tipo | Dominio | Notas |
|:---|:---|:---:|:---:|:---:|:---|:---|
| **BLOQUE 1: CIMIENTOS Y SEGURIDAD** | | | | | | |
| PURGE-FOLLOWERS | Purga total de Seguidores y limpieza de tipos | ✅ done | Alta | Refactor | Types | Eliminar 'seguidores' y 'follow' de toda la app. |
| AUTH-GOOGLE | Reparación de Login con Google (Sesión no persiste) | ✅ done | Crítica | Bug | Auth | Usuario se crea pero no logra entrar. Logging agregado. |
| STAB-SAVEDPOSTS | Estabilización de mutation savedposts | ✅ done | Crítica | Bug | Backend | Resolver unhandled-promise en Convex. |
| STAB-DYNA | Reparación de errores failed-to-fetch-dyna | pending | Media | Bug | Network | Blindar endpoint dyna con fallbacks. |
| **BLOQUE 2: COMUNIDADES** | | | | | | |
| FIX-SUBCOM-CREATE | Reparar creación de subcomunidades | ✅ done | Alta | Bug | Comunidad | Resolver Server Error en createSubcommunity. Build exitoso. |
| FIX-COM-ADMIN | Corregir botón Admin de comunidades | pending | Media | Bug | UI | Dirigir al Panel de Control, no a Crear Comunidad. |
| FEAT-COM-SLUG | Implementar Slugs dinámicos para comunidades | pending | Media | Feature | UI/UX | Slug debe adaptarse al nombre de la comunidad. |
| FIX-SUB-STATE | Sincronización de estado Suscribirte -> Suscrito | pending | Media | Bug | UI | Cambio de estado inmediato en Descubrir. |
| FEAT-SUB-LIST | Sección "Mis Suscripciones" en Descubrir | pending | Media | Feature | UI | Acceso directo a comunidades suscritas. |
| FIX-TV-PRIVACY | Reparar visibilidad de ideas en TV (Privadas) | ✅ done | Alta | Bug | Comunidad | Mostrar idea al autor/miembros, no solo candado. |
| **BLOQUE 3: POSTS E INTERACCIONES** | | | | | | |
| FIX-POST-IMG | Reparar actualización de imagen al editar post | pending | Alta | Bug | Backend/UI | La imagen subida no se refleja en el post. |
| FEAT-POST-PASTE | Implementar pegado de imágenes en posts | pending | Media | Feature | UI | Permitir paste de imágenes en el editor. |
| FIX-POST-REPOST | Implementar Repost al feed global del portal | pending | Alta | Feature | Backend | Lógica de redistribución de contenido. |
| FIX-POST-PIN | Reparar togglePinPost y alerta Admin | pending | Alta | Bug | Backend/UI | Resolver Server Error y fix de alerta. |
| REMOVE-SAVE-POST | Eliminar botón y función de Guardar Post | pending | Baja | Refactor | UI | Quitar funcionalidad obsoleta. |
| FEAT-LIKE-HISTORY | Registro de Likes en perfil de usuario | pending | Media | Feature | Backend | Historial de favoritos (posts, comentarios). |
| **BLOQUE 4: ESPECIALIZADOS** | | | | | | |
| FIX-MKT-VIDEOS | Reparar query getVideos en Marketing Pro | pending | Alta | Bug | Backend | Resolver Server Error en query. |
| FEAT-NEWS-AUTO | Agente autónomo de extracción de noticias | pending | Media | Feature | AI/News | Extracción real cada 12h de portales. |
| FIX-WORKSPACE-ACCESS | Corregir acceso a Workspace (Admins/Creadores) | pending | Media | Bug | Auth | Evitar landing de ventas para usuarios internos. |
| FIX-TOKEN-PURCHASE | Reparar pantalla negra en Comprar Tokens | ✅ done | Crítica | Bug | UI | Diagnosticar fallo de carga total. |

## 🛠️ **BLOCK 5: ADMIN PANEL (Audit Results)** | | | | | |
| ID | Tarea | Estado | Prioridad | Tipo | Dominio | Notas |
|:---|:---|:---|:---|:---|:---|:---|
| **FIX-ADMIN-QUERIES** | Implementar paginación en AdminView (evitar carga 1000+ registros) | pending | Crítica | Bug | Performance | Queries simultáneas causan timeouts y lentitud extrema. |
| **FIX-ADMIN-AUTH** | Unificar chequeos de admin en convex/lib/auth.ts | pending | Alta | Bug | Auth | 3 funciones distintas (getCallerAdminStatus, getAdminOrNull, requireModeratorProfile). |
| **FIX-ADMIN-TYPING** | Eliminar 'any' types en useAdminActions.ts y AdminView.tsx | pending | Media | Refactor | Types | Fragilidad técnica - runtime crashes probables. |
| **FIX-ADMIN-PERF** | Optimizar Convex queries (usar índices, no .filter() en 1000+ records) | pending | Alta | Performance | Backend | moderation.ts y backup.ts filtran en JS en lugar de DB. |
| **FIX-ADMIN-UI** | Mejorar Suspense boundaries y loading states | pending | Media | UI/UX | Loading | Panel se siente "congelado" mientras carga. |
| **FIX-ADMIN-STATE** | Eliminar useState redundantes en AdminView.tsx | pending | Media | Refactor | State | Replican datos de useQuery innecesariamente. |

## 🛠️ **BLOCK 6: AUDITORÍA DE CÓDIGO (Nuevas tareas)** | | | | | |
| ID | Tarea | Estado | Prioridad | Tipo | Dominio | Notas |
|:---|:---|:---:|:---:|:---:|:---|:---|
| **FIX-NOTIF-PRIORITY** | Corregir prioridad de 'follow' en NotificationRanker | ✅ done | Alta | Bug | Ranking | AGENT: opencode 28/04 | follow devuelve 'medium' pero test espera 'low'. Ajustar PRIORITY_WEIGHTS. |
| **FIX-NOTIF-GROUP** | Reparar groupByPriority (contabilidad incorrecta) | ✅ done | Alta | Bug | Ranking | AGENT: opencode 28/04 | Misma causa raíz que FIX-NOTIF-PRIORITY. |
| **FIX-ERROR-BOUNDARY** | Migrar require a import en errorBoundary.test.tsx | 🏗️ in_progress | Media | Bug | Tests | AGENT: AntiGravity 28/04 | Navigation.tsx no carga con require (CommonJS vs ESM). |
| **FIX-CONVEX-AUTHZ** | Reparar 4 fallos en communities.authz.test.ts | ✅ done | Alta | Bug | Seguridad | AGENT: opencode 28/04 | 22/22 tests pasan tras corregir resolveOptionalCallerId. |
| **FIX-IDEA-RESILIENCE** | Corregir tests de tradingIdeas.ideaHistory | pending | Media | Bug | Backend | Orden descendente y manejo de errores Convex. |
| **FIX-PROFILE-RANKER** | Reparar cálculo de estadísticas en profileRanker | pending | Media | Bug | Ranking | should calculate profile stats falla. |
| **FIX-TRUST-LAYER** | Corregir asignación de tier en trustLayer | pending | Media | Bug | Ranking | Usuario con actividad mínima no obtiene nuevo tier. |
| **OPT-MEMORY-TESTS** | Resolver OOM (Out of Memory) en ejecución de tests | pending | Crítica | Performance | Infraestructura | Configurar --max-old-space-size y mocks de Convex. |
| **SEC-CSP-UNSAFE** | Eliminar 'unsafe-inline' y 'unsafe-eval' del CSP | pending | Alta | Seguridad | Security | server.ts y securityHeaders.ts deben usar hash/nonce. |
| **REF-STRICT-TYPES** | Activar strict en tsconfig y eliminar 'any' restantes | pending | Alta | Refactor | Types | >100 usos de any en Convex y servicios. |
| **FEAT-ARIA-LABELS** | Añadir aria-label a iconos Material Symbols | pending | Media | Accesibilidad | UI | Cumplimiento WCAG 2.1 AA en Navigation y menús. |
| **FEAT-KEYBOARD-NAV** | Implementar navegación con teclado en menús | pending | Media | Accesibilidad | UI | Arrow keys y Esc en MobileMenuSection. |
| **FIX-IMPORT-PATHS** | Reemplazar imports relativos por alias (@/...) | pending | Baja | Refactor | Infraestructura | Mejorar mantenibilidad y evitar rutas rotas. |
| **FEAT-ESLINT** | Instalar y configurar ESLint + Prettier | pending | Media | Tooling | Infraestructura | Reglas no-any, no-unused-vars, react-hooks. |
| **FEAT-VERIFY-SESSION** | Crear script verify-session.mjs automatizado | ✅ done | Alta | Tooling | AGENT: opencode 28/04 | Script creado en scripts/verify-session.mjs. npm run deploy ejecuta verificación automática. |
| **FIX-NAV-DUPLICATION** | Unificar handleClickOutside en Navigation.tsx | pending | Baja | Refactor | UI | Eliminar lógica duplicada desktop/móvil. |
| **DOC-AUDIT-VAULT** | Documentar hallazgos en Neural Vault | pending | Baja | Docs | Knowledge | notification-ranker-bug.md, csp-unsafe-eval.md. |
