# 📋 TASK BOARD - TRADESHARE

> Sincronizado desde Notion — 31/3/2026, 09:37:36
> ⚠️  Este archivo se actualiza automáticamente al ejecutar npm run inicio
> 🔄 Cada 5 tareas terminadas → git push para sincronizar equipo

## 📊 Resumen

| Total | Críticas | Altas | Medias | Bajas |
|-------|----------|-------|--------|-------|
| 61 | 14 | 27 | 18 | 2 |

---

## 📁 Auth (3 tareas)

| # | Tarea | Prioridad | Estado | Archivos |
|---|-------|-----------|--------|----------|
| 1 | **Fix: Login JWT — verificar que tokens se firman y validan correctamente** | 🔴 Critical | ⏳ Backlog | src/services/auth/authService.ts, server.ts (requireAuth), src/components/AuthModal.tsx |
| 2 | **Fix: Registro — validar email, password mínimo 6 chars, username único** | 🔴 Critical | ⏳ Backlog | src/services/auth/authService.ts (register), src/components/AuthModal.tsx (form validation) |
| 3 | **Fix: Persistencia de sesión — que no se pierda al recargar la página** | 🟡 High | ⏳ Backlog | src/services/auth/authService.ts (getCurrentSession), src/utils/sessionManager.ts |

## 📁 Profiles (3 tareas)

| # | Tarea | Prioridad | Estado | Archivos |
|---|-------|-----------|--------|----------|
| 4 | **Feature: Perfiles estilo Landing Page con bio, stats y links compartibles** | 🟡 High | ⏳ Backlog | src/views/PerfilView.tsx, src/components/ProfileCard.tsx, convex/profiles.ts |
| 5 | **Feature: Sistema de Follow/Seguir usuarios** | 🟡 High | ⏳ Backlog | src/views/PerfilView.tsx, convex/profiles.ts (follow/unfollow mutations) |
| 6 | **Feature: Perfiles premium con datos verificados de bitácora** | 🟢 Medium | ⏳ Backlog | src/views/PerfilView.tsx, convex/profiles.ts, convex/traderVerification.ts |

## 📁 Communities (11 tareas)

| # | Tarea | Prioridad | Estado | Archivos |
|---|-------|-----------|--------|----------|
| 7 | **Fix: Crear comunidad — formulario completo con nombre, descripción, precio** | 🔴 Critical | ⏳ Backlog | src/views/ComunidadView.tsx, convex/communities.ts (createCommunity mutation) |
| 8 | **Feature: Unirse a comunidad — verificar suscripción antes de entrar** | 🔴 Critical | ⏳ Backlog | src/views/ComunidadView.tsx, convex/communities.ts (checkAccess), convex/subscriptions.ts |
| 9 | **Feature: Publicar posts en comunidades (solo miembros)** | 🟡 High | ⏳ Backlog | src/views/ComunidadView.tsx, convex/posts.ts (createPost), convex/communities.ts |
| 10 | **Feature: Comentarios en posts de comunidades** | 🟡 High | ⏳ Backlog | src/views/ComunidadView.tsx, convex/posts.ts (addComment mutation), src/components/CommentSection.tsx |
| 11 | **Feature: Botones de Like y Reacciones en todos los posts** | 🟡 High | ⏳ Backlog | src/components/PostCard.tsx, convex/posts.ts (toggleLike mutation), src/views/ComunidadView.tsx |
| 12 | **Feature: Crear subcomunidades dentro de comunidades** | 🟡 High | ⏳ Backlog | src/views/ComunidadView.tsx, convex/subcommunities.ts, convex/communities.ts |
| 13 | **Feature: Publicar posts en subcomunidades (solo miembros)** | 🟡 High | ⏳ Backlog | src/views/ComunidadView.tsx, convex/subcommunities.ts, convex/posts.ts |
| 14 | **Feature: Comentarios en posts de subcomunidades** | 🟢 Medium | ⏳ Backlog | src/views/ComunidadView.tsx, convex/subcommunities.ts, convex/posts.ts |
| 15 | **Feature: Chat privado de comunidad (solo miembros)** | 🟡 High | ⏳ Backlog | src/views/ComunidadView.tsx, convex/subcommunityChat.ts, server.ts (WebSocket) |
| 16 | **Feature: TV Live privada para comunidades** | 🟡 High | ⏳ Backlog | src/views/ComunidadView.tsx, src/components/TVLive.tsx, convex/communities.ts |
| 17 | **Feature: Sección Academia dentro de comunidades (cursos y mentorías)** | 🟡 High | ⏳ Backlog | src/views/ComunidadView.tsx, src/views/CursosView.tsx, convex/courses.ts, convex/communities.ts |

## 📁 Payments (7 tareas)

| # | Tarea | Prioridad | Estado | Archivos |
|---|-------|-----------|--------|----------|
| 18 | **Fix: Integrar MercadoPago — checkout, webhooks, preferencias** | 🔴 Critical | ⏳ Backlog | convex/mercadopagoApi.ts, server.ts (webhook handler), convex/payments.ts |
| 19 | **Fix: Sector Suscripciones — planes, pricing, beneficios visibles** | 🔴 Critical | ⏳ Backlog | src/views/PricingView.tsx, convex/subscriptions.ts, convex/payments.ts |
| 20 | **Feature: Suscripciones a la carta — elegir servicios individualmente** | 🔴 Critical | ⏳ Backlog | src/views/PricingView.tsx, convex/subscriptions.ts, convex/mercadopagoApi.ts |
| 21 | **Feature: Botones de suscripción en todos los lugares necesarios** | 🟡 High | ⏳ Backlog | src/views/ComunidadView.tsx, src/views/PerfilView.tsx, src/components/ContentLock.tsx |
| 22 | **Feature: Solo Feed gratuito — todo lo demás requiere suscripción** | 🔴 Critical | ⏳ Backlog | src/views/ComunidadView.tsx, src/components/ContentLock.tsx, convex/subscriptions.ts |
| 23 | **Feature: Sistema de comisiones para la plataforma** | 🟡 High | ⏳ Backlog | convex/payments.ts, convex/communities.ts, server.ts (webhook handler) |
| 24 | **Feature: Organizar pagos y cobros a creadores** | 🟡 High | ⏳ Backlog | src/views/CreatorDashboard.tsx, convex/payments.ts, convex/communities.ts |

## 📁 Content (4 tareas)

| # | Tarea | Prioridad | Estado | Archivos |
|---|-------|-----------|--------|----------|
| 25 | **Fix: Sistema de publicación de posts — texto, imágenes, tags** | 🟡 High | ⏳ Backlog | src/components/CreatePostModal.tsx, convex/posts.ts, src/views/FeedView.tsx |
| 26 | **Fix: Extractor de YouTube con filtro Psicotrading — auto-publicar videos** | 🟡 High | ⏳ Backlog | convex/crons.ts, convex/videos.ts, src/views/PsicotradingView.tsx |
| 27 | **Feature: Estilo Shorts en sección Psicotrading** | 🟢 Medium | ⏳ Backlog | src/views/PsicotradingView.tsx, src/components/ShortsPlayer.tsx, convex/videos.ts |
| 28 | **Feature: Sistema de mentorías para creadores** | 🟢 Medium | ⏳ Backlog | src/views/ComunidadView.tsx, convex/courses.ts, convex/payments.ts |

## 📁 Admin (8 tareas)

| # | Tarea | Prioridad | Estado | Archivos |
|---|-------|-----------|--------|----------|
| 29 | **Fix: Admin panel full-width — ocupar todo el ancho de pantalla** | 🟡 High | ⏳ Backlog | src/views/AdminView.tsx, src/components/admin/AdminPanelDashboard.tsx |
| 30 | **Feature: Admin CRUD usuarios — crear, editar, banear, eliminar** | 🔴 Critical | ⏳ Backlog | src/components/admin/AdminPanelDashboard.tsx, convex/profiles.ts (banUser, updateProfile, deleteProfile) |
| 31 | **Feature: Admin CRUD comunidades — crear, editar, eliminar comunidades** | 🔴 Critical | ⏳ Backlog | src/components/admin/AdminPanelDashboard.tsx, convex/communities.ts |
| 32 | **Feature: Admin CRUD posts — moderar, editar, eliminar posts** | 🟡 High | ⏳ Backlog | src/components/admin/AdminPanelDashboard.tsx, convex/posts.ts |
| 33 | **Feature: Admin gestión de pagos y suscripciones** | 🔴 Critical | ⏳ Backlog | src/components/admin/AdminPanelDashboard.tsx, convex/payments.ts, convex/subscriptions.ts |
| 34 | **Feature: Admin gestión de extractor YouTube** | 🟡 High | ⏳ Backlog | src/components/admin/AdminPanelDashboard.tsx, convex/crons.ts, convex/videos.ts |
| 35 | **Feature: Admin dashboard de métricas globales** | 🟡 High | ⏳ Backlog | src/components/admin/AdminPanelDashboard.tsx, convex/stats.ts |
| 36 | **Feature: Admin gestión de contenido y moderación** | 🟢 Medium | ⏳ Backlog | src/components/admin/AdminPanelDashboard.tsx, convex/profiles.ts, convex/posts.ts |

## 📁 Bitacora (3 tareas)

| # | Tarea | Prioridad | Estado | Archivos |
|---|-------|-----------|--------|----------|
| 37 | **Feature: Conexión directa a bitácora de trading** | 🟡 High | ⏳ Backlog | src/views/BitacoraView.tsx, src/services/bitacora/, convex/traderVerification.ts |
| 38 | **Feature: Extracción automática de datos de trading** | 🟡 High | ⏳ Backlog | src/services/bitacora/, convex/traderVerification.ts, convex/stats.ts |
| 39 | **Feature: Validación segura de datos — no editable manualmente** | 🔴 Critical | ⏳ Backlog | convex/traderVerification.ts, convex/profiles.ts, src/views/PerfilView.tsx |

## 📁 Infra (3 tareas)

| # | Tarea | Prioridad | Estado | Archivos |
|---|-------|-----------|--------|----------|
| 40 | **Fix: Deploy Convex — generar _generated y desplegar schema** | 🔴 Critical | ⏳ Backlog | convex/schema.ts, convex/* (todas las mutations/queries) |
| 41 | **Fix: Optimizar performance general del sitio** | 🟡 High | ⏳ Backlog | src/App.tsx, src/components/PostCard.tsx, convex/* (queries con pagination) |
| 42 | **Fix: Resolver vulnerabilidades npm audit restantes** | 🟡 High | ⏳ Backlog | package.json, vite.config.ts |

## 📁 Realtime (2 tareas)

| # | Tarea | Prioridad | Estado | Archivos |
|---|-------|-----------|--------|----------|
| 43 | **Feature: Realtime señales — actualizaciones en tiempo real** | 🔴 Critical | ⏳ Backlog | server.ts (WebSocket), src/views/SeñalesView.tsx, convex/signals.ts |
| 44 | **Feature: WebSockets base — infraestructura de realtime** | 🟡 High | ⏳ Backlog | server.ts (WebSocket setup), src/services/websocket.ts |

## 📁 Notifications (1 tareas)

| # | Tarea | Prioridad | Estado | Archivos |
|---|-------|-----------|--------|----------|
| 45 | **Feature: Sistema de notificaciones push y en-app** | 🟢 Medium | ⏳ Backlog | src/components/NotificationBell.tsx, convex/notifications.ts, server.ts (push) |

## 📁 Gamification (2 tareas)

| # | Tarea | Prioridad | Estado | Archivos |
|---|-------|-----------|--------|----------|
| 46 | **Feature: Sistema de puntos XP por publicaciones y actividad** | 🟢 Medium | ⏳ Backlog | convex/profiles.ts, src/views/PerfilView.tsx, convex/gamification.ts |
| 47 | **Feature: Premios — redención de tokens por recompensas** | 🟢 Medium | ⏳ Backlog | src/views/PremiosView.tsx, convex/gamification.ts, convex/payments.ts |

## 📁 UI (10 tareas)

| # | Tarea | Prioridad | Estado | Archivos |
|---|-------|-----------|--------|----------|
| 48 | **Fix: Consolidar controles bottom a UN solo botón de menú flotante** | 🟡 High | ⏳ Backlog | src/Navigation.tsx, src/components/BottomMenu.tsx |
| 49 | **Fix: Global Styling — icons, avatars, light/dark modes, Negocios cards** | 🟢 Medium | ⏳ Backlog | src/index.css, src/components/, src/views/ |
| 50 | **Fix: Mover Mi Comunidad/Observatory al Creator Admin Panel** | 🟢 Medium | ⏳ Backlog | src/Navigation.tsx, src/views/CreatorDashboard.tsx |
| 51 | **Fix: Señales & Trading — dynamic background, neon loaders, VIP style** | 🟢 Medium | ⏳ Backlog | src/views/SeñalesView.tsx, src/components/ElectricLoader.tsx |
| 52 | **Fix: Noticias — estilo newspaper y calendario económico** | 🟢 Medium | ⏳ Backlog | src/views/NoticiasView.tsx, src/components/NewsCard.tsx |
| 53 | **Fix: Renombrar Marketplace a Negocios, mover Publicidad dentro** | 🟢 Medium | ⏳ Backlog | src/Navigation.tsx, src/views/NegociosView.tsx |
| 54 | **Fix: Reconfigurar secciones del menú superior** | 🟢 Medium | ⏳ Backlog | src/Navigation.tsx |
| 55 | **Fix: Ocultar Pricing del nav, renombrar a Suscripciones, integrar** | 🟢 Medium | ⏳ Backlog | src/Navigation.tsx, src/views/PricingView.tsx |
| 56 | **Fix: Eliminar iconos flotantes de AI en Navigation.tsx** | ⚪ Low | ⏳ Backlog | src/Navigation.tsx |
| 57 | **Fix: AdminView full-width, eliminar floating AI, mostrar stats** | ⚪ Low | ⏳ Backlog | src/views/AdminView.tsx |

## 📁 Testing (1 tareas)

| # | Tarea | Prioridad | Estado | Archivos |
|---|-------|-----------|--------|----------|
| 58 | **Feature: Tests end-to-end de flujos críticos** | 🟡 High | ⏳ Backlog | tests/*.test.ts, tests/*.spec.ts |

## 📁 Launch (1 tareas)

| # | Tarea | Prioridad | Estado | Archivos |
|---|-------|-----------|--------|----------|
| 59 | **Feature: Preparar launch — SEO, meta tags, analytics** | 🟢 Medium | ⏳ Backlog | index.html, vite.config.ts, public/manifest.json, public/robots.txt |

## 📁 Coordination (2 tareas)

| # | Tarea | Prioridad | Estado | Archivos |
|---|-------|-----------|--------|----------|
| 60 | **Feature: Crear skills de conocimiento compartido para agentes** | 🟢 Medium | ⏳ Backlog | .agent/skills/technical/*, .agent/workspace/coordination/KNOWLEDGE_BASE.md |
| 61 | **Feature: Configurar delegación de sub-agentes (2 por agente)** | 🟢 Medium | ⏳ Backlog | .agent/workspace/coordination/AGENT_HIVE.md, AGENTS.md |

---

## 📝 DETALLE DE TAREAS

> Cada tarea incluye descripción, archivos a editar, archivos prohibidos y definición de Done.

### TSK-001: Fix: Login JWT — verificar que tokens se firman y validan correctamente

- **ID:** TSK-001
- **Estado:** Backlog
- **Prioridad:** Critical
- **Tipo:** Feature
- **Dominio:** Auth
- **Orden:** 1

📝 DESCRIPCIÓN:
Revisar el flujo completo de login: el usuario ingresa credenciales → se verifica en Convex → se genera token JWT → se almacena en localStorage → se usa en requests. Verificar que JWT_SECRET esté configurado en .env.local y que los tokens se validen correctamente en server.ts.

📂 ARCHIVOS A EDITAR:
src/services/auth/authService.ts, server.ts (requireAuth), src/components/AuthModal.tsx

🚫 ARCHIVOS PROHIBIDOS:
convex/schema.ts, src/App.tsx, src/Navigation.tsx

✅ DEFINICIÓN DE DONE:
Login funciona con JWT válido, token expirado pide re-login, credenciales incorrectas muestran error claro

---

### TSK-002: Fix: Registro — validar email, password mínimo 6 chars, username único

- **ID:** TSK-002
- **Estado:** Backlog
- **Prioridad:** Critical
- **Tipo:** Feature
- **Dominio:** Auth
- **Orden:** 2

📝 DESCRIPCIÓN:
El registro debe validar: email con formato válido, password mínimo 6 caracteres, username alfanumérico de 3+ chars, verificar unicidad en Convex antes de crear. El password debe hashearse ANTES de enviar a Convex (nunca plaintext).

📂 ARCHIVOS A EDITAR:
src/services/auth/authService.ts (register), src/components/AuthModal.tsx (form validation)

🚫 ARCHIVOS PROHIBIDOS:
convex/schema.ts, server.ts

✅ DEFINICIÓN DE DONE:
Registro rechaza emails inválidos, passwords cortos, usernames duplicados. Password se hashea antes de enviar a Convex.

---

### TSK-003: Fix: Persistencia de sesión — que no se pierda al recargar la página

- **ID:** TSK-003
- **Estado:** Backlog
- **Prioridad:** High
- **Tipo:** Feature
- **Dominio:** Auth
- **Orden:** 3

📝 DESCRIPCIÓN:
Al recargar la página, el usuario debe seguir logueado. Verificar que getCurrentSession() en authService.ts lee correctamente el token de localStorage y lo valida. Si el token expiró, pedir re-login.

📂 ARCHIVOS A EDITAR:
src/services/auth/authService.ts (getCurrentSession), src/utils/sessionManager.ts

🚫 ARCHIVOS PROHIBIDOS:
server.ts, convex/schema.ts

✅ DEFINICIÓN DE DONE:
Usuario logueado persiste al recargar F5. Token expirado redirige a login. Sesión se limpia al cerrar sesión.

---

### TSK-004: Feature: Perfiles estilo Landing Page con bio, stats y links compartibles

- **ID:** TSK-004
- **Estado:** Backlog
- **Prioridad:** High
- **Tipo:** Feature
- **Dominio:** Profiles
- **Orden:** 10

📝 DESCRIPCIÓN:
Crear vista de perfil público estilo landing page: foto, nombre, bio, estadísticas de trading (win rate, PnL), seguidores/siguiendo, comunidades que creó, cursos que ofrece. URLs compartibles tipo /perfil/username. Si el visitante no está registrado, mostrar promo de suscripción.

📂 ARCHIVOS A EDITAR:
src/views/PerfilView.tsx, src/components/ProfileCard.tsx, convex/profiles.ts

🚫 ARCHIVOS PROHIBIDOS:
src/App.tsx, src/Navigation.tsx

✅ DEFINICIÓN DE DONE:
Perfil público visible sin login, muestra datos del usuario, URL compartible, no registrados ven promo de suscripción

---

### TSK-005: Feature: Sistema de Follow/Seguir usuarios

- **ID:** TSK-005
- **Estado:** Backlog
- **Prioridad:** High
- **Tipo:** Feature
- **Dominio:** Profiles
- **Orden:** 11

📝 DESCRIPCIÓN:
Los usuarios pueden seguir/dejar de seguir a otros. Mostrar contador de seguidores y siguiendo. El feed puede filtrar posts de usuarios seguidos. Datos almacenados en Convex (perfil.seguidores, perfil.siguiendo).

📂 ARCHIVOS A EDITAR:
src/views/PerfilView.tsx, convex/profiles.ts (follow/unfollow mutations)

🚫 ARCHIVOS PROHIBIDOS:
src/App.tsx, src/Navigation.tsx

✅ DEFINICIÓN DE DONE:
Botón seguir/dejar de seguir funciona, contadores actualizan en tiempo real, lista de seguidores visible en perfil

---

### TSK-006: Feature: Perfiles premium con datos verificados de bitácora

- **ID:** TSK-006
- **Estado:** Backlog
- **Prioridad:** Medium
- **Tipo:** Feature
- **Dominio:** Profiles
- **Orden:** 12

📝 DESCRIPCIÓN:
Usuarios que conectan su bitácora de trading y verifican sus datos reciben badge premium en su perfil. Mostrar estadísticas reales verificadas (no editables): win rate, operaciones totales, PnL. Perfil destacado en búsquedas.

📂 ARCHIVOS A EDITAR:
src/views/PerfilView.tsx, convex/profiles.ts, convex/traderVerification.ts

🚫 ARCHIVOS PROHIBIDOS:
src/App.tsx

✅ DEFINICIÓN DE DONE:
Badge premium visible, stats verificadas mostradas, datos no editables manualmente

---

### TSK-007: Fix: Crear comunidad — formulario completo con nombre, descripción, precio

- **ID:** TSK-007
- **Estado:** Backlog
- **Prioridad:** Critical
- **Tipo:** Feature
- **Dominio:** Communities
- **Orden:** 20

📝 DESCRIPCIÓN:
Revisar el flujo de crear comunidad: nombre, descripción, imagen, precio de suscripción, categoría. Validar que el creador esté logueado. Guardar en Convex communities table. Mostrar preview antes de crear.

📂 ARCHIVOS A EDITAR:
src/views/ComunidadView.tsx, convex/communities.ts (createCommunity mutation)

🚫 ARCHIVOS PROHIBIDOS:
src/App.tsx, src/Navigation.tsx, server.ts

✅ DEFINICIÓN DE DONE:
Formulario crea comunidad en Convex, validación de campos, imagen subida, precio configurado, creador asignado como admin

---

### TSK-008: Feature: Unirse a comunidad — verificar suscripción antes de entrar

- **ID:** TSK-008
- **Estado:** Backlog
- **Prioridad:** Critical
- **Tipo:** Feature
- **Dominio:** Communities
- **Orden:** 21

📝 DESCRIPCIÓN:
Al intentar entrar a una comunidad, verificar si el usuario tiene suscripción activa. Si no tiene, mostrar pantalla de pago con botón de suscripción. Si tiene acceso, entrar directamente. Solo el feed del portal es gratuito.

📂 ARCHIVOS A EDITAR:
src/views/ComunidadView.tsx, convex/communities.ts (checkAccess), convex/subscriptions.ts

🚫 ARCHIVOS PROHIBIDOS:
src/App.tsx, src/Navigation.tsx

✅ DEFINICIÓN DE DONE:
Usuario sin suscripción ve pantalla de pago, con suscripción entra directo, feed del portal siempre accesible

---

### TSK-009: Feature: Publicar posts en comunidades (solo miembros)

- **ID:** TSK-009
- **Estado:** Backlog
- **Prioridad:** High
- **Tipo:** Feature
- **Dominio:** Communities
- **Orden:** 22

📝 DESCRIPCIÓN:
Los miembros de una comunidad pueden crear posts con texto, imágenes y tags. Verificar membresía antes de permitir publicar. Posts aparecen en el feed de la comunidad. Notificar a otros miembros.

📂 ARCHIVOS A EDITAR:
src/views/ComunidadView.tsx, convex/posts.ts (createPost), convex/communities.ts

🚫 ARCHIVOS PROHIBIDOS:
src/App.tsx, src/Navigation.tsx

✅ DEFINICIÓN DE DONE:
Miembro puede crear post con texto/imagen, no miembro ve mensaje de 'solo miembros', post aparece en feed de comunidad

---

### TSK-010: Feature: Comentarios en posts de comunidades

- **ID:** TSK-010
- **Estado:** Backlog
- **Prioridad:** High
- **Tipo:** Feature
- **Dominio:** Communities
- **Orden:** 23

📝 DESCRIPCIÓN:
Sistema de comentarios en posts de comunidades. Solo miembros pueden comentar. Comentarios anidados (respuestas a respuestas). Mostrar avatar, nombre, fecha. Like en comentarios.

📂 ARCHIVOS A EDITAR:
src/views/ComunidadView.tsx, convex/posts.ts (addComment mutation), src/components/CommentSection.tsx

🚫 ARCHIVOS PROHIBIDOS:
src/App.tsx, src/Navigation.tsx

✅ DEFINICIÓN DE DONE:
Miembro comenta en post, comentarios anidados funcionan, likes en comentarios, no miembro no puede comentar

---

### TSK-011: Feature: Botones de Like y Reacciones en todos los posts

- **ID:** TSK-011
- **Estado:** Backlog
- **Prioridad:** High
- **Tipo:** Feature
- **Dominio:** Communities
- **Orden:** 24

📝 DESCRIPCIÓN:
Agregar botón de like (❤️) en posts del feed, posts de comunidades, comentarios. Contador visible. Toggle on/off al hacer click. Reacciones adicionales: 🔥, 💡, 👏.

📂 ARCHIVOS A EDITAR:
src/components/PostCard.tsx, convex/posts.ts (toggleLike mutation), src/views/ComunidadView.tsx

🚫 ARCHIVOS PROHIBIDOS:
src/App.tsx, src/Navigation.tsx

✅ DEFINICIÓN DE DONE:
Like funciona en todos los posts, contador actualiza, toggle funciona, reacciones adicionales disponibles

---

### TSK-012: Feature: Crear subcomunidades dentro de comunidades

- **ID:** TSK-012
- **Estado:** Backlog
- **Prioridad:** High
- **Tipo:** Feature
- **Dominio:** Communities
- **Orden:** 25

📝 DESCRIPCIÓN:
Los admins de comunidad pueden crear subcomunidades (ej: 'Forex', 'Crypto', 'Opciones' dentro de 'Trading Pro'). Cada subcomunidad tiene su propio feed, chat y academia. Hereda acceso de la comunidad padre.

📂 ARCHIVOS A EDITAR:
src/views/ComunidadView.tsx, convex/subcommunities.ts, convex/communities.ts

🚫 ARCHIVOS PROHIBIDOS:
src/App.tsx, src/Navigation.tsx

✅ DEFINICIÓN DE DONE:
Admin crea subcomunidad, miembros ven subcomunidades, cada una tiene feed separado, acceso heredado

---

### TSK-013: Feature: Publicar posts en subcomunidades (solo miembros)

- **ID:** TSK-013
- **Estado:** Backlog
- **Prioridad:** High
- **Tipo:** Feature
- **Dominio:** Communities
- **Orden:** 26

📝 DESCRIPCIÓN:
Igual que publicar en comunidades pero aplicado a subcomunidades. Verificar membresía en la comunidad padre. Posts aparecen en feed de la subcomunidad.

📂 ARCHIVOS A EDITAR:
src/views/ComunidadView.tsx, convex/subcommunities.ts, convex/posts.ts

🚫 ARCHIVOS PROHIBIDOS:
src/App.tsx, src/Navigation.tsx

✅ DEFINICIÓN DE DONE:
Miembro publica en subcomunidad, post aparece en feed correcto, no miembro bloqueado

---

### TSK-014: Feature: Comentarios en posts de subcomunidades

- **ID:** TSK-014
- **Estado:** Backlog
- **Prioridad:** Medium
- **Tipo:** Feature
- **Dominio:** Communities
- **Orden:** 27

📝 DESCRIPCIÓN:
Sistema de comentarios para posts dentro de subcomunidades. Mismo comportamiento que comentarios en comunidades pero aislado por subcomunidad.

📂 ARCHIVOS A EDITAR:
src/views/ComunidadView.tsx, convex/subcommunities.ts, convex/posts.ts

🚫 ARCHIVOS PROHIBIDOS:
src/App.tsx

✅ DEFINICIÓN DE DONE:
Comentarios funcionan en subcomunidades, mismo sistema que comunidades padre

---

### TSK-015: Feature: Chat privado de comunidad (solo miembros)

- **ID:** TSK-015
- **Estado:** Backlog
- **Prioridad:** High
- **Tipo:** Feature
- **Dominio:** Communities
- **Orden:** 28

📝 DESCRIPCIÓN:
Chat en tiempo real exclusivo para miembros de cada comunidad. Usar WebSocket o Convex subscriptions. Mensajes persistentes. Mostrar quién está online. Solo miembros activos pueden ver y enviar mensajes.

📂 ARCHIVOS A EDITAR:
src/views/ComunidadView.tsx, convex/subcommunityChat.ts, server.ts (WebSocket)

🚫 ARCHIVOS PROHIBIDOS:
src/App.tsx, src/Navigation.tsx

✅ DEFINICIÓN DE DONE:
Chat funciona en tiempo real, solo miembros ven mensajes, mensajes persistentes, indicador de online

---

### TSK-016: Feature: TV Live privada para comunidades

- **ID:** TSK-016
- **Estado:** Backlog
- **Prioridad:** High
- **Tipo:** Feature
- **Dominio:** Communities
- **Orden:** 29

📝 DESCRIPCIÓN:
Integrar la misma TV Live del portal pero privada para cada comunidad. El creador puede hacer transmisiones en vivo exclusivas para sus miembros. Usar el mismo componente de TV Live pero con verificación de acceso.

📂 ARCHIVOS A EDITAR:
src/views/ComunidadView.tsx, src/components/TVLive.tsx, convex/communities.ts

🚫 ARCHIVOS PROHIBIDOS:
src/App.tsx, src/Navigation.tsx

✅ DEFINICIÓN DE DONE:
TV Live funciona dentro de comunidad, solo miembros ven la transmisión, creador puede iniciar stream

---

### TSK-017: Feature: Sección Academia dentro de comunidades (cursos y mentorías)

- **ID:** TSK-017
- **Estado:** Backlog
- **Prioridad:** High
- **Tipo:** Feature
- **Dominio:** Communities
- **Orden:** 30

📝 DESCRIPCIÓN:
Dentro de cada comunidad agregar sección 'Academia' donde el creador puede subir cursos, mentorías y material educativo. Mover lo que antes era 'Cursos' a esta sección. Los miembros acceden según su nivel de suscripción.

📂 ARCHIVOS A EDITAR:
src/views/ComunidadView.tsx, src/views/CursosView.tsx, convex/courses.ts, convex/communities.ts

🚫 ARCHIVOS PROHIBIDOS:
src/App.tsx, src/Navigation.tsx

✅ DEFINICIÓN DE DONE:
Academia visible dentro de comunidad, creador puede agregar cursos, miembros acceden según suscripción

---

### TSK-018: Fix: Integrar MercadoPago — checkout, webhooks, preferencias

- **ID:** TSK-018
- **Estado:** Backlog
- **Prioridad:** Critical
- **Tipo:** Feature
- **Dominio:** Payments
- **Orden:** 40

📝 DESCRIPCIÓN:
Revisar y dejar funcionando la integración completa de MercadoPago: crear preferencia de pago, redirect al checkout, webhook que confirma el pago, actualizar suscripción del usuario. Verificar que MERCADOPAGO_ACCESS_TOKEN y MERCADOPAGO_WEBHOOK_SECRET estén en .env.local.

📂 ARCHIVOS A EDITAR:
convex/mercadopagoApi.ts, server.ts (webhook handler), convex/payments.ts

🚫 ARCHIVOS PROHIBIDOS:
src/App.tsx, src/Navigation.tsx

✅ DEFINICIÓN DE DONE:
Checkout MP funciona, webhook confirma pago, suscripción se activa automáticamente, error handling completo

---

### TSK-019: Fix: Sector Suscripciones — planes, pricing, beneficios visibles

- **ID:** TSK-019
- **Estado:** Backlog
- **Prioridad:** Critical
- **Tipo:** Feature
- **Dominio:** Payments
- **Orden:** 41

📝 DESCRIPCIÓN:
Revisar la página de suscripciones (PricingView): mostrar planes disponibles, precios, beneficios de cada plan, botón de suscripción funcional. Verificar que los datos vengan de Convex y no sean hardcoded.

📂 ARCHIVOS A EDITAR:
src/views/PricingView.tsx, convex/subscriptions.ts, convex/payments.ts

🚫 ARCHIVOS PROHIBIDOS:
src/App.tsx, src/Navigation.tsx

✅ DEFINICIÓN DE DONE:
PricingView muestra planes reales, precios correctos, botones de suscripción funcionan, redirect a checkout MP

---

### TSK-020: Feature: Suscripciones a la carta — elegir servicios individualmente

- **ID:** TSK-020
- **Estado:** Backlog
- **Prioridad:** Critical
- **Tipo:** Feature
- **Dominio:** Payments
- **Orden:** 42

📝 DESCRIPCIÓN:
Sistema donde el usuario elige qué servicios quiere y paga solo por esos: señales, comunidades, cursos, mentorías. Cada servicio tiene su precio. El usuario arma su plan personalizado. Checkout único con MercadoPago.

📂 ARCHIVOS A EDITAR:
src/views/PricingView.tsx, convex/subscriptions.ts, convex/mercadopagoApi.ts

🚫 ARCHIVOS PROHIBIDOS:
src/App.tsx, src/Navigation.tsx

✅ DEFINICIÓN DE DONE:
Usuario selecciona servicios, precio se calcula dinámicamente, checkout MP con total correcto, suscripciones individuales activas

---

### TSK-021: Feature: Botones de suscripción en todos los lugares necesarios

- **ID:** TSK-021
- **Estado:** Backlog
- **Prioridad:** High
- **Tipo:** Feature
- **Dominio:** Payments
- **Orden:** 43

📝 DESCRIPCIÓN:
Agregar CTA de suscripción en: comunidades privadas, perfiles de creadores, contenido premium, cursos, academia. Si el usuario no tiene acceso, mostrar botón 'Suscribirse' que lleva al checkout.

📂 ARCHIVOS A EDITAR:
src/views/ComunidadView.tsx, src/views/PerfilView.tsx, src/components/ContentLock.tsx

🚫 ARCHIVOS PROHIBIDOS:
src/App.tsx, src/Navigation.tsx

✅ DEFINICIÓN DE DONE:
Botón suscripción visible en comunidades, perfiles, contenido premium. Click lleva a checkout MP.

---

### TSK-022: Feature: Solo Feed gratuito — todo lo demás requiere suscripción

- **ID:** TSK-022
- **Estado:** Backlog
- **Prioridad:** Critical
- **Tipo:** Feature
- **Dominio:** Payments
- **Orden:** 44

📝 DESCRIPCIÓN:
Política: el feed del portal es lo único gratuito. Comunidades, señales, cursos, academia, TV Live privada requieren suscripción. Implementar gate de contenido: si no tiene suscripción, mostrar preview + botón de pago.

📂 ARCHIVOS A EDITAR:
src/views/ComunidadView.tsx, src/components/ContentLock.tsx, convex/subscriptions.ts

🚫 ARCHIVOS PROHIBIDOS:
src/App.tsx, src/Navigation.tsx

✅ DEFINICIÓN DE DONE:
Feed accesible sin login, comunidades piden suscripción, contenido premium bloqueado con preview

---

### TSK-023: Feature: Sistema de comisiones para la plataforma

- **ID:** TSK-023
- **Estado:** Backlog
- **Prioridad:** High
- **Tipo:** Feature
- **Dominio:** Payments
- **Orden:** 45

📝 DESCRIPCIÓN:
Cada venta de suscripción a comunidad genera una comisión para la plataforma (ej: 10%). Calcular automáticamente: total - comisión = pago al creador. Registrar en payments table. Dashboard de ganancias para creadores.

📂 ARCHIVOS A EDITAR:
convex/payments.ts, convex/communities.ts, server.ts (webhook handler)

🚫 ARCHIVOS PROHIBIDOS:
src/App.tsx

✅ DEFINICIÓN DE DONE:
Comisión calculada en cada pago, registro en DB, creador ve sus ganancias netas, plataforma ve comisiones

---

### TSK-024: Feature: Organizar pagos y cobros a creadores

- **ID:** TSK-024
- **Estado:** Backlog
- **Prioridad:** High
- **Tipo:** Feature
- **Dominio:** Payments
- **Orden:** 46

📝 DESCRIPCIÓN:
Dashboard para creadores: ver ingresos totales, ingresos por comunidad, historial de pagos, solicitar retiro. Integrar con MercadoPago para payouts automáticos o manuales.

📂 ARCHIVOS A EDITAR:
src/views/CreatorDashboard.tsx, convex/payments.ts, convex/communities.ts

🚫 ARCHIVOS PROHIBIDOS:
src/App.tsx, src/Navigation.tsx

✅ DEFINICIÓN DE DONE:
Creador ve dashboard de ganancias, historial de pagos, puede solicitar retiro

---

### TSK-025: Fix: Sistema de publicación de posts — texto, imágenes, tags

- **ID:** TSK-025
- **Estado:** Backlog
- **Prioridad:** High
- **Tipo:** Feature
- **Dominio:** Content
- **Orden:** 50

📝 DESCRIPCIÓN:
Revisar el flujo de crear posts: formulario con texto, subida de imágenes, tags/categorías. Posts aparecen en el feed con paginación. Verificar que funciona en feed del portal y en comunidades.

📂 ARCHIVOS A EDITAR:
src/components/CreatePostModal.tsx, convex/posts.ts, src/views/FeedView.tsx

🚫 ARCHIVOS PROHIBIDOS:
src/App.tsx, src/Navigation.tsx

✅ DEFINICIÓN DE DONE:
Crear post con texto/imagen funciona, tags se guardan, post aparece en feed, paginación correcta

---

### TSK-026: Fix: Extractor de YouTube con filtro Psicotrading — auto-publicar videos

- **ID:** TSK-026
- **Estado:** Backlog
- **Prioridad:** High
- **Tipo:** Feature
- **Dominio:** Content
- **Orden:** 51

📝 DESCRIPCIÓN:
Revisar el cron job que extrae videos de YouTube con filtro de psicotrading. Verificar que VITE_YOUTUBE_API_KEY esté configurado. Videos deben auto-publicarse en la sección Psicotrading con título, thumbnail y descripción.

📂 ARCHIVOS A EDITAR:
convex/crons.ts, convex/videos.ts, src/views/PsicotradingView.tsx

🚫 ARCHIVOS PROHIBIDOS:
src/App.tsx, src/Navigation.tsx

✅ DEFINICIÓN DE DONE:
Cron ejecuta, extrae videos con filtro psicotrading, videos se publican automáticamente, sección muestra videos

---

### TSK-027: Feature: Estilo Shorts en sección Psicotrading

- **ID:** TSK-027
- **Estado:** Backlog
- **Prioridad:** Medium
- **Tipo:** Feature
- **Dominio:** Content
- **Orden:** 52

📝 DESCRIPCIÓN:
Agregar vista estilo TikTok/Shorts para videos de psicotrading. Scroll vertical infinito, videos a pantalla completa, filtros por tema (disciplina, emociones, gestión de riesgo). Swipe para siguiente video.

📂 ARCHIVOS A EDITAR:
src/views/PsicotradingView.tsx, src/components/ShortsPlayer.tsx, convex/videos.ts

🚫 ARCHIVOS PROHIBIDOS:
src/App.tsx, src/Navigation.tsx

✅ DEFINICIÓN DE DONE:
Vista shorts funciona, scroll vertical, videos fullscreen, filtros por tema, infinite scroll

---

### TSK-028: Feature: Sistema de mentorías para creadores

- **ID:** TSK-028
- **Estado:** Backlog
- **Prioridad:** Medium
- **Tipo:** Feature
- **Dominio:** Content
- **Orden:** 53

📝 DESCRIPCIÓN:
Dentro de la Academia de cada comunidad, los creadores pueden ofrecer mentorías 1-a-1. Formulario de solicitud, calendario de disponibilidad, pago adicional por mentoría. Notificar al creador cuando alguien solicita.

📂 ARCHIVOS A EDITAR:
src/views/ComunidadView.tsx, convex/courses.ts, convex/payments.ts

🚫 ARCHIVOS PROHIBIDOS:
src/App.tsx

✅ DEFINICIÓN DE DONE:
Creador ofrece mentorías, miembros solicitan, pago procesado, notificación enviada

---

### TSK-029: Fix: Admin panel full-width — ocupar todo el ancho de pantalla

- **ID:** TSK-029
- **Estado:** Backlog
- **Prioridad:** High
- **Tipo:** Feature
- **Dominio:** Admin
- **Orden:** 60

📝 DESCRIPCIÓN:
El panel de administración debe ocupar el 100% del ancho de la pantalla para mayor comodidad. Eliminar restricciones de max-width. Reorganizar secciones para aprovechar el espacio.

📂 ARCHIVOS A EDITAR:
src/views/AdminView.tsx, src/components/admin/AdminPanelDashboard.tsx

🚫 ARCHIVOS PROHIBIDOS:
src/App.tsx, src/Navigation.tsx

✅ DEFINICIÓN DE DONE:
Admin panel ocupa 100% width, secciones reorganizadas, responsive funciona

---

### TSK-030: Feature: Admin CRUD usuarios — crear, editar, banear, eliminar

- **ID:** TSK-030
- **Estado:** Backlog
- **Prioridad:** Critical
- **Tipo:** Feature
- **Dominio:** Admin
- **Orden:** 61

📝 DESCRIPCIÓN:
Panel de administración de usuarios: lista con búsqueda y filtros, ver detalle de usuario, editar rol/email/estado, banear/desbanear, eliminar (soft delete). Todo debe usar Convex mutations, NO localStorage.

📂 ARCHIVOS A EDITAR:
src/components/admin/AdminPanelDashboard.tsx, convex/profiles.ts (banUser, updateProfile, deleteProfile)

🚫 ARCHIVOS PROHIBIDOS:
src/components/admin/UserManagement.tsx (legacy localStorage), src/App.tsx

✅ DEFINICIÓN DE DONE:
Admin puede buscar usuarios, editar roles, banear/desbanear, eliminar soft delete, todo via Convex

---

### TSK-031: Feature: Admin CRUD comunidades — crear, editar, eliminar comunidades

- **ID:** TSK-031
- **Estado:** Backlog
- **Prioridad:** Critical
- **Tipo:** Feature
- **Dominio:** Admin
- **Orden:** 62

📝 DESCRIPCIÓN:
Panel de administración de comunidades: lista de todas las comunidades, ver detalle, editar nombre/descripción/precio, eliminar (soft delete), ver miembros de cada comunidad.

📂 ARCHIVOS A EDITAR:
src/components/admin/AdminPanelDashboard.tsx, convex/communities.ts

🚫 ARCHIVOS PROHIBIDOS:
src/App.tsx

✅ DEFINICIÓN DE DONE:
Admin ve todas las comunidades, puede editar, eliminar, ver miembros, todo via Convex

---

### TSK-032: Feature: Admin CRUD posts — moderar, editar, eliminar posts

- **ID:** TSK-032
- **Estado:** Backlog
- **Prioridad:** High
- **Tipo:** Feature
- **Dominio:** Admin
- **Orden:** 63

📝 DESCRIPCIÓN:
Panel de moderación de posts: ver todos los posts, filtrar por comunidad/usuario, editar contenido inapropiado, eliminar posts, ver reportes de usuarios.

📂 ARCHIVOS A EDITAR:
src/components/admin/AdminPanelDashboard.tsx, convex/posts.ts

🚫 ARCHIVOS PROHIBIDOS:
src/App.tsx

✅ DEFINICIÓN DE DONE:
Admin ve todos los posts, filtra, edita, elimina, ve reportes

---

### TSK-033: Feature: Admin gestión de pagos y suscripciones

- **ID:** TSK-033
- **Estado:** Backlog
- **Prioridad:** Critical
- **Tipo:** Feature
- **Dominio:** Admin
- **Orden:** 64

📝 DESCRIPCIÓN:
Panel de administración de pagos: ver todas las transacciones, estado de pagos (pendiente, completado, fallido), reembolsos, suscripciones activas/inactivas, métricas de ingresos.

📂 ARCHIVOS A EDITAR:
src/components/admin/AdminPanelDashboard.tsx, convex/payments.ts, convex/subscriptions.ts

🚫 ARCHIVOS PROHIBIDOS:
src/App.tsx

✅ DEFINICIÓN DE DONE:
Admin ve transacciones, filtra por estado, ve suscripciones activas, métricas de ingresos

---

### TSK-034: Feature: Admin gestión de extractor YouTube

- **ID:** TSK-034
- **Estado:** Backlog
- **Prioridad:** High
- **Tipo:** Feature
- **Dominio:** Admin
- **Orden:** 65

📝 DESCRIPCIÓN:
Panel para configurar el extractor de YouTube: agregar/quitar filtros de búsqueda, configurar frecuencia de extracción, ver historial de videos extraídos, forzar extracción manual.

📂 ARCHIVOS A EDITAR:
src/components/admin/AdminPanelDashboard.tsx, convex/crons.ts, convex/videos.ts

🚫 ARCHIVOS PROHIBIDOS:
src/App.tsx

✅ DEFINICIÓN DE DONE:
Admin configura filtros, ve historial, fuerza extracción manual, cambia frecuencia

---

### TSK-035: Feature: Admin dashboard de métricas globales

- **ID:** TSK-035
- **Estado:** Backlog
- **Prioridad:** High
- **Tipo:** Feature
- **Dominio:** Admin
- **Orden:** 66

📝 DESCRIPCIÓN:
Dashboard principal del admin: usuarios activos hoy/esta semana, ingresos totales, comunidades activas, posts creados, engagement rate. Gráficos visuales con datos reales de Convex.

📂 ARCHIVOS A EDITAR:
src/components/admin/AdminPanelDashboard.tsx, convex/stats.ts

🚫 ARCHIVOS PROHIBIDOS:
src/App.tsx

✅ DEFINICIÓN DE DONE:
Dashboard muestra métricas reales, gráficos visuales, datos actualizados en tiempo real

---

### TSK-036: Feature: Admin gestión de contenido y moderación

- **ID:** TSK-036
- **Estado:** Backlog
- **Prioridad:** Medium
- **Tipo:** Feature
- **Dominio:** Admin
- **Orden:** 67

📝 DESCRIPCIÓN:
Sistema de moderación: reportes de contenido inapropiado, advertencias a usuarios, bans temporales/permanentes, log de acciones de moderación.

📂 ARCHIVOS A EDITAR:
src/components/admin/AdminPanelDashboard.tsx, convex/profiles.ts, convex/posts.ts

🚫 ARCHIVOS PROHIBIDOS:
src/App.tsx

✅ DEFINICIÓN DE DONE:
Admin ve reportes, envía advertencias, banea usuarios, log de moderación visible

---

### TSK-037: Feature: Conexión directa a bitácora de trading

- **ID:** TSK-037
- **Estado:** Backlog
- **Prioridad:** High
- **Tipo:** Feature
- **Dominio:** Bitacora
- **Orden:** 70

📝 DESCRIPCIÓN:
Los usuarios pueden conectar su bitácora de trading (TraderSync, TraderSync, Edgewonk, etc.) para extraer datos automáticamente. OAuth o API key para conectar. Sync automático de operaciones, PnL, win rate.

📂 ARCHIVOS A EDITAR:
src/views/BitacoraView.tsx, src/services/bitacora/, convex/traderVerification.ts

🚫 ARCHIVOS PROHIBIDOS:
src/App.tsx

✅ DEFINICIÓN DE DONE:
Usuario conecta bitácora, datos se extraen automáticamente, sync periódico configurado

---

### TSK-038: Feature: Extracción automática de datos de trading

- **ID:** TSK-038
- **Estado:** Backlog
- **Prioridad:** High
- **Tipo:** Feature
- **Dominio:** Bitacora
- **Orden:** 71

📝 DESCRIPCIÓN:
Una vez conectada la bitácora, extraer automáticamente: operaciones totales, win rate, PnL total, promedio de ganancia/pérdida, racha actual, mejor/peor operación. Almacenar en Convex de forma segura.

📂 ARCHIVOS A EDITAR:
src/services/bitacora/, convex/traderVerification.ts, convex/stats.ts

🚫 ARCHIVOS PROHIBIDOS:
src/App.tsx

✅ DEFINICIÓN DE DONE:
Datos extraídos automáticamente, almacenados en Convex, actualizados periódicamente

---

### TSK-039: Feature: Validación segura de datos — no editable manualmente

- **ID:** TSK-039
- **Estado:** Backlog
- **Prioridad:** Critical
- **Tipo:** Feature
- **Dominio:** Bitacora
- **Orden:** 72

📝 DESCRIPCIÓN:
Los datos de trading verificados NO pueden ser modificados manualmente por el usuario. Solo se actualizan via sync automático de la bitácora. Implementar flag isVerified en el perfil. Si el usuario intenta editar, rechazar.

📂 ARCHIVOS A EDITAR:
convex/traderVerification.ts, convex/profiles.ts, src/views/PerfilView.tsx

🚫 ARCHIVOS PROHIBIDOS:
src/App.tsx

✅ DEFINICIÓN DE DONE:
Datos verificados no editables, flag isVerified en perfil, sync automático es la única fuente de actualización

---

### TSK-040: Fix: Deploy Convex — generar _generated y desplegar schema

- **ID:** TSK-040
- **Estado:** Backlog
- **Prioridad:** Critical
- **Tipo:** Infra
- **Dominio:** Infra
- **Orden:** 80

📝 DESCRIPCIÓN:
Ejecutar `npx convex deploy` para generar la carpeta convex/_generated/ con los tipos TypeScript. Sin esto, el dev server no arranca porque los imports de `api` fallan. Necesita CONVEX_DEPLOY_KEY del dashboard.

📂 ARCHIVOS A EDITAR:
convex/schema.ts, convex/* (todas las mutations/queries)

🚫 ARCHIVOS PROHIBIDOS:
src/App.tsx, src/Navigation.tsx

✅ DEFINICIÓN DE DONE:
convex/_generated/ existe, tipos generados, dev server arranca sin errores de import

---

### TSK-041: Fix: Optimizar performance general del sitio

- **ID:** TSK-041
- **Estado:** Backlog
- **Prioridad:** High
- **Tipo:** Infra
- **Dominio:** Infra
- **Orden:** 81

📝 DESCRIPCIÓN:
Lazy loading de todas las vistas (ya implementado), code splitting, reducir bundle size, optimizar imágenes, implementar caching de queries Convex, eliminar renders innecesarios con React.memo.

📂 ARCHIVOS A EDITAR:
src/App.tsx, src/components/PostCard.tsx, convex/* (queries con pagination)

🚫 ARCHIVOS PROHIBIDOS:
server.ts

✅ DEFINICIÓN DE DONE:
Lighthouse score > 80, bundle size < 500KB, queries paginadas, memo en componentes pesados

---

### TSK-042: Fix: Resolver vulnerabilidades npm audit restantes

- **ID:** TSK-042
- **Estado:** Backlog
- **Prioridad:** High
- **Tipo:** Infra
- **Dominio:** Infra
- **Orden:** 82

📝 DESCRIPCIÓN:
4 vulnerabilidades high en vite-plugin-pwa → serialize-javascript. Requiere actualizar vite-plugin-pwa o usar npm audit fix --force (breaking change). Evaluar impacto antes de actualizar.

📂 ARCHIVOS A EDITAR:
package.json, vite.config.ts

🚫 ARCHIVOS PROHIBIDOS:
src/*

✅ DEFINICIÓN DE DONE:
npm audit muestra 0 vulnerabilidades, build funciona, PWA sigue funcionando

---

### TSK-043: Feature: Realtime señales — actualizaciones en tiempo real

- **ID:** TSK-043
- **Estado:** Backlog
- **Prioridad:** Critical
- **Tipo:** Feature
- **Dominio:** Realtime
- **Orden:** 110

📝 DESCRIPCIÓN:
Las señales de trading deben actualizarse en tiempo real sin recargar la página. Usar WebSocket o Convex subscriptions. Cuando una señal se actualiza (TP hit, SL hit, nueva señal), todos los suscriptores ven el cambio instantáneamente.

📂 ARCHIVOS A EDITAR:
server.ts (WebSocket), src/views/SeñalesView.tsx, convex/signals.ts

🚫 ARCHIVOS PROHIBIDOS:
src/App.tsx

✅ DEFINICIÓN DE DONE:
Señales se actualizan en tiempo real, WebSocket conectado, sin recarga de página

---

### TSK-044: Feature: WebSockets base — infraestructura de realtime

- **ID:** TSK-044
- **Estado:** Backlog
- **Prioridad:** High
- **Tipo:** Infra
- **Dominio:** Realtime
- **Orden:** 111

📝 DESCRIPCIÓN:
Configurar la infraestructura base de WebSockets en server.ts: conexión, autenticación de tokens, heartbeat, reconexión automática, manejo de múltiples clientes. Base para chat, señales realtime, notificaciones.

📂 ARCHIVOS A EDITAR:
server.ts (WebSocket setup), src/services/websocket.ts

🚫 ARCHIVOS PROHIBIDOS:
src/App.tsx

✅ DEFINICIÓN DE DONE:
WebSocket conecta, auth funciona, heartbeat activo, reconexión automática, múltiples clientes soportados

---

### TSK-045: Feature: Sistema de notificaciones push y en-app

- **ID:** TSK-045
- **Estado:** Backlog
- **Prioridad:** Medium
- **Tipo:** Feature
- **Dominio:** Notifications
- **Orden:** 120

📝 DESCRIPCIÓN:
Sistema de notificaciones: nuevas señales, comentarios en posts, likes, nuevos seguidores, pagos recibidos. Notificaciones en-app (campana) y push del navegador. Configurar VAPID keys para push notifications.

📂 ARCHIVOS A EDITAR:
src/components/NotificationBell.tsx, convex/notifications.ts, server.ts (push)

🚫 ARCHIVOS PROHIBIDOS:
src/App.tsx

✅ DEFINICIÓN DE DONE:
Notificaciones en-app funcionan, push notifications configuradas, usuario puede silenciar

---

### TSK-046: Feature: Sistema de puntos XP por publicaciones y actividad

- **ID:** TSK-046
- **Estado:** Backlog
- **Prioridad:** Medium
- **Tipo:** Feature
- **Dominio:** Gamification
- **Orden:** 90

📝 DESCRIPCIÓN:
Los usuarios ganan XP por: publicar (+10), comentar (+5), recibir like (+2), unirse a comunidad (+20), completar curso (+50). Mostrar nivel y barra de progreso en el perfil.

📂 ARCHIVOS A EDITAR:
convex/profiles.ts, src/views/PerfilView.tsx, convex/gamification.ts

🚫 ARCHIVOS PROHIBIDOS:
src/App.tsx

✅ DEFINICIÓN DE DONE:
XP se otorga automáticamente, nivel visible en perfil, barra de progreso, leaderboard actualizado

---

### TSK-047: Feature: Premios — redención de tokens por recompensas

- **ID:** TSK-047
- **Estado:** Backlog
- **Prioridad:** Medium
- **Tipo:** Feature
- **Dominio:** Gamification
- **Orden:** 91

📝 DESCRIPCIÓN:
Los usuarios pueden redimir tokens/puntos por: acceso gratuito a comunidades, descuentos en suscripciones, badges exclusivos, mentorías gratis. Catálogo de premios visible en sección 'Premios'.

📂 ARCHIVOS A EDITAR:
src/views/PremiosView.tsx, convex/gamification.ts, convex/payments.ts

🚫 ARCHIVOS PROHIBIDOS:
src/App.tsx

✅ DEFINICIÓN DE DONE:
Catálogo de premios visible, usuario puede redimir, descuento aplicado, tokens restados

---

### TSK-048: Fix: Consolidar controles bottom a UN solo botón de menú flotante

- **ID:** TSK-048
- **Estado:** Backlog
- **Prioridad:** High
- **Tipo:** Feature
- **Dominio:** UI
- **Orden:** 100

📝 DESCRIPCIÓN:
Eliminar múltiples botones flotantes y consolidar en un solo botón de menú en la parte inferior. Al hacer click, mostrar opciones: perfil, configuración, cerrar sesión, tema claro/oscuro.

📂 ARCHIVOS A EDITAR:
src/Navigation.tsx, src/components/BottomMenu.tsx

🚫 ARCHIVOS PROHIBIDOS:
src/App.tsx

✅ DEFINICIÓN DE DONE:
Un solo botón flotante, menú desplegable con todas las opciones, animación suave

---

### TSK-049: Fix: Global Styling — icons, avatars, light/dark modes, Negocios cards

- **ID:** TSK-049
- **Estado:** Backlog
- **Prioridad:** Medium
- **Tipo:** Feature
- **Dominio:** UI
- **Orden:** 101

📝 DESCRIPCIÓN:
Revisar consistencia visual: icons en toda la app, avatars de negocios, modos claro/oscuro, cards de Negocios. Asegurar que el diseño premium se mantenga en todas las vistas.

📂 ARCHIVOS A EDITAR:
src/index.css, src/components/, src/views/

🚫 ARCHIVOS PROHIBIDOS:
src/App.tsx

✅ DEFINICIÓN DE DONE:
Icons consistentes, avatars muestran correctamente, light/dark mode funciona, cards de Negocios estilizadas

---

### TSK-050: Fix: Mover Mi Comunidad/Observatory al Creator Admin Panel

- **ID:** TSK-050
- **Estado:** Backlog
- **Prioridad:** Medium
- **Tipo:** Feature
- **Dominio:** UI
- **Orden:** 102

📝 DESCRIPCIÓN:
Las secciones 'Mi Comunidad' y 'Observatory' deben moverse dentro del panel de administración del creador, no en la navegación principal. Solo los creadores ven estas opciones.

📂 ARCHIVOS A EDITAR:
src/Navigation.tsx, src/views/CreatorDashboard.tsx

🚫 ARCHIVOS PROHIBIDOS:
src/App.tsx

✅ DEFINICIÓN DE DONE:
Mi Comunidad y Observatory solo visibles en Creator Admin Panel, no en nav principal

---

### TSK-051: Fix: Señales & Trading — dynamic background, neon loaders, VIP style

- **ID:** TSK-051
- **Estado:** Backlog
- **Prioridad:** Medium
- **Tipo:** Feature
- **Dominio:** UI
- **Orden:** 103

📝 DESCRIPCIÓN:
Mejorar la sección de Señales & Trading con fondo dinámico, loaders con efecto neón, estilo VIP para contenido premium. Mantener consistencia con el diseño premium de la app.

📂 ARCHIVOS A EDITAR:
src/views/SeñalesView.tsx, src/components/ElectricLoader.tsx

🚫 ARCHIVOS PROHIBIDOS:
src/App.tsx, src/Navigation.tsx

✅ DEFINICIÓN DE DONE:
Fondo dinámico en señales, loaders neón, estilo VIP visible, consistencia con diseño premium

---

### TSK-052: Fix: Noticias — estilo newspaper y calendario económico

- **ID:** TSK-052
- **Estado:** Backlog
- **Prioridad:** Medium
- **Tipo:** Feature
- **Dominio:** UI
- **Orden:** 104

📝 DESCRIPCIÓN:
Rediseñar la sección de Noticias con estilo newspaper/periódico. Agregar calendario económico integrado. Noticias con categorías, fecha, fuente.

📂 ARCHIVOS A EDITAR:
src/views/NoticiasView.tsx, src/components/NewsCard.tsx

🚫 ARCHIVOS PROHIBIDOS:
src/App.tsx

✅ DEFINICIÓN DE DONE:
Noticias estilo newspaper, calendario económico visible, categorías y fuentes mostradas

---

### TSK-053: Fix: Renombrar Marketplace a Negocios, mover Publicidad dentro

- **ID:** TSK-053
- **Estado:** Backlog
- **Prioridad:** Medium
- **Tipo:** Feature
- **Dominio:** UI
- **Orden:** 105

📝 DESCRIPCIÓN:
Cambiar nombre 'Marketplace' a 'Negocios' en toda la app. Mover la sección de Publicidad dentro de Negocios. Actualizar navegación y referencias.

📂 ARCHIVOS A EDITAR:
src/Navigation.tsx, src/views/NegociosView.tsx

🚫 ARCHIVOS PROHIBIDOS:
src/App.tsx

✅ DEFINICIÓN DE DONE:
'Marketplace' renombrado a 'Negocios', Publicidad dentro de Negocios, navegación actualizada

---

### TSK-054: Fix: Reconfigurar secciones del menú superior

- **ID:** TSK-054
- **Estado:** Backlog
- **Prioridad:** Medium
- **Tipo:** Feature
- **Dominio:** UI
- **Orden:** 106

📝 DESCRIPCIÓN:
Reorganizar las secciones del menú superior: eliminar secciones innecesarias, mover secciones a donde corresponden. Asegurar que la navegación sea intuitiva.

📂 ARCHIVOS A EDITAR:
src/Navigation.tsx

🚫 ARCHIVOS PROHIBIDOS:
src/App.tsx

✅ DEFINICIÓN DE DONE:
Menú superior reorganizado, secciones correctas, navegación intuitiva

---

### TSK-055: Fix: Ocultar Pricing del nav, renombrar a Suscripciones, integrar

- **ID:** TSK-055
- **Estado:** Backlog
- **Prioridad:** Medium
- **Tipo:** Feature
- **Dominio:** UI
- **Orden:** 107

📝 DESCRIPCIÓN:
Ocultar 'Pricing' de la navegación principal. Renombrar a 'Suscripciones'. Integrar como sección accesible desde perfiles de creadores y comunidades, no desde el menú principal.

📂 ARCHIVOS A EDITAR:
src/Navigation.tsx, src/views/PricingView.tsx

🚫 ARCHIVOS PROHIBIDOS:
src/App.tsx

✅ DEFINICIÓN DE DONE:
Pricing oculto del nav, renombrado a Suscripciones, accesible desde perfiles y comunidades

---

### TSK-056: Fix: Eliminar iconos flotantes de AI en Navigation.tsx

- **ID:** TSK-056
- **Estado:** Backlog
- **Prioridad:** Low
- **Tipo:** Feature
- **Dominio:** UI
- **Orden:** 108

📝 DESCRIPCIÓN:
Eliminar los iconos flotantes de AI que aparecen en Navigation.tsx. Limpiar la interfaz de elementos innecesarios.

📂 ARCHIVOS A EDITAR:
src/Navigation.tsx

🚫 ARCHIVOS PROHIBIDOS:
src/App.tsx

✅ DEFINICIÓN DE DONE:
Sin iconos flotantes de AI, navegación limpia

---

### TSK-057: Fix: AdminView full-width, eliminar floating AI, mostrar stats

- **ID:** TSK-057
- **Estado:** Backlog
- **Prioridad:** Low
- **Tipo:** Feature
- **Dominio:** UI
- **Orden:** 109

📝 DESCRIPCIÓN:
AdminView debe ocupar todo el ancho, eliminar cualquier elemento flotante de AI, mostrar estadísticas claras del sistema.

📂 ARCHIVOS A EDITAR:
src/views/AdminView.tsx

🚫 ARCHIVOS PROHIBIDOS:
src/App.tsx, src/Navigation.tsx

✅ DEFINICIÓN DE DONE:
AdminView full-width, sin AI flotante, stats visibles

---

### TSK-058: Feature: Tests end-to-end de flujos críticos

- **ID:** TSK-058
- **Estado:** Backlog
- **Prioridad:** High
- **Tipo:** Infra
- **Dominio:** Testing
- **Orden:** 83

📝 DESCRIPCIÓN:
Crear tests E2E con Vitest/Playwright para: login, registro, crear post, unirse a comunidad, proceso de pago con MercadoPago. Verificar que los flujos críticos no se rompan.

📂 ARCHIVOS A EDITAR:
tests/*.test.ts, tests/*.spec.ts

🚫 ARCHIVOS PROHIBIDOS:
src/* (solo tests)

✅ DEFINICIÓN DE DONE:
Tests de login, registro, post, comunidad, pago pasan. Coverage > 70% en flujos críticos.

---

### TSK-059: Feature: Preparar launch — SEO, meta tags, analytics

- **ID:** TSK-059
- **Estado:** Backlog
- **Prioridad:** Medium
- **Tipo:** Feature
- **Dominio:** Launch
- **Orden:** 84

📝 DESCRIPCIÓN:
SEO completo: meta tags por página, Open Graph para compartir en redes, sitemap.xml, robots.txt, Google Analytics, favicon, manifest.json para PWA.

📂 ARCHIVOS A EDITAR:
index.html, vite.config.ts, public/manifest.json, public/robots.txt

🚫 ARCHIVOS PROHIBIDOS:
src/App.tsx

✅ DEFINICIÓN DE DONE:
Meta tags en todas las páginas, OG tags funcionan, sitemap generado, analytics configurado

---

### TSK-060: Feature: Crear skills de conocimiento compartido para agentes

- **ID:** TSK-060
- **Estado:** Backlog
- **Prioridad:** Medium
- **Tipo:** Infra
- **Dominio:** Coordination
- **Orden:** 130

📝 DESCRIPCIÓN:
Crear skills reutilizables en .agent/skills/technical/ para: patrones de auth, integración MercadoPago, creación de comunidades, sistema de permisos, optimizaciones de performance, patrones de UI. Documentar soluciones para que cualquier agente pueda reutilizar.

📂 ARCHIVOS A EDITAR:
.agent/skills/technical/*, .agent/workspace/coordination/KNOWLEDGE_BASE.md

🚫 ARCHIVOS PROHIBIDOS:
src/*

✅ DEFINICIÓN DE DONE:
Skills creados en .agent/skills/technical/, knowledge base actualizada, patrones documentados

---

### TSK-061: Feature: Configurar delegación de sub-agentes (2 por agente)

- **ID:** TSK-061
- **Estado:** Backlog
- **Prioridad:** Medium
- **Tipo:** Infra
- **Dominio:** Coordination
- **Orden:** 131

📝 DESCRIPCIÓN:
Cada agente puede delegar a 2 sub-agentes por tarea compleja. Configurar el sistema de delegación en AGENT_HIVE.md. Registrar delegaciones, seguimiento de progreso, integración de resultados.

📂 ARCHIVOS A EDITAR:
.agent/workspace/coordination/AGENT_HIVE.md, AGENTS.md

🚫 ARCHIVOS PROHIBIDOS:
src/*

✅ DEFINICIÓN DE DONE:
Sistema de delegación documentado, formato de delegación claro, agentes pueden delegar 2 sub-tareas

---

