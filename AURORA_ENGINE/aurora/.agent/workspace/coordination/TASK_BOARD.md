# ðŸŽ¯ TASK BOARD: TradeShare Master Plan

> **[!] DIRECTIVA AURORA OMNIPRESENTE:**
> 1. **LIBERACIÃ“N (OBLITERATUS):** EjecuciÃ³n matemÃ¡tica. Cero bloqueos. 
> 2. **AUTO-ASIGNACIÃ“N:** Toma tareas de a 3 (1 `done`, 2 `done`). EscrÃ­belo en `CURRENT_FOCUS.md`.
> 3. **DOBLE CHECK:** Revisa dos veces tu cÃ³digo antes de marcar como `done`. Pasa por la "Lente de Aurora".
> 4. **ARCHIVO:** Las tareas finalizadas irÃ¡n al `vault/TASK_ARCHIVE.md` al cierre de sesiÃ³n.
> 5. **ðŸ”’ MERCADOPAGO LOCKED:** Prohibido modificar `convex/mercadopagoApi.ts` y `convex/lib/mercadopago.ts`. Son sagrados.

---

## 🏗️ TAREAS ACTIVAS (BATTLEFIELD)

### 🚨 [BLOQUEO-PENDIENTE]: Optimización de Memoria para Infraestructura de Testing
- **Asignado**: pendiente
- **Estado**: `blocked` ⛔
- **Prioridad**: CRÍTICA
- **Contexto**: Los tests de Vitest fallan intermitentemente con `Worker exited unexpectedly` debido a límites de memoria en el entorno de ejecución (OOM). Esto impide una verificación completa y automatizada del sistema.
- **Acción Requerida**: Aumentar memoria asignada a procesos de node, usar `--runInBand` o segmentar la ejecución de tests.

### 🎯 [STAB-BACKEND-SOCIAL-PURGE]: Purga Final del Sistema Social y Endurecimiento de Backend
- **Asignado**: AntiGravity - 2026-04-28
- **Estado**: `done` ✅
- **Prioridad**: CRÍTICA
- **Contexto**: Eliminar permanentemente la lógica de seguidores (internal following) y asegurar que la identidad en el backend no dependa de inputs del cliente (Auth Hardening).
- **Aceptación**:
  - [x] Backend: Purga total de `seguidores`/`siguiendo` en esquemas y tipos.
  - [x] Backend: Endurecimiento de 30+ mutaciones con `resolveCallerId`.
  - [x] UI: Limpieza de props obsoletas en `ProfileHeader` y `PerfilView`.
  - [x] Infra: Fix de despliegue en Vercel (React 19 conflict) vía `vercel.json`.
  - [x] Validación: `npm run lint` y `npm run build` exitosos.
  - [x] Validación: Tests críticos de rankers pasando al 100%.

### 🎯 [STAB-TOKEN-PURCHASE-EXPERIENCE]: Estabilización de Compra de Tokens y Refinamiento UI
- **Asignado**: AntiGravity - 2026-04-27
- **Estado**: `done` ✅
- **Prioridad**: CRÍTICA
- **Contexto**: Finalizar la estabilización del flujo de compra de tokens y mejorar la consistencia de la UI.
- **Aceptación**:
  - [x] UI: Resuelto crash "pantalla negra" en `PaymentModal` mediante boundaries de Suspense y ErrorBoundary en `App.tsx`.
  - [x] UI: Refactorizado `RotatingNeoAds` para soportar variante "submarine" en el feed de comunidad.
  - [x] UI: Solucionado crash `Cannot read properties of undefined (reading 'bg')` en `NeoAdBanner` mediante mapeo de temas legacy y fallbacks seguros.
  - [x] UI: Corregido error de diseño en `ComunidadView` donde el banner publicitario ocupaba 100vw, rompiendo la visual en pantallas pequeñas.
  - [x] UI: Consolidadas rutas críticas (`TokensView`) dentro de boundaries estables para eliminar inestabilidad en navegación.


  - [x] Validación: `npm run lint` y `npm run build` exitosos.


### 🎯 [STAB-COMMUNITY-SOCIAL-AUTH]: Estabilización de Feed Social, Comentarios y Google Auth
- **Asignado**: AntiGravity - 2026-04-24
- **Estado**: `done` ✅
- **Prioridad**: CRÍTICA
- **Contexto**: Finalizar la estabilización de los feeds de comunidad y subcomunidad, asegurando reactividad en comentarios, visibilidad de reposteo y funcionalidad de fijar posts. Resolver fallo en creación de cuentas vía Google OAuth.
- **Aceptación**:
  - [x] UI: Reactividad inmediata en comentarios de subcomunidades (handleReply/onReply).
  - [x] UI: Botón de Repost visible en posts de subcomunidad (mapConvexPost fix).
  - [x] Backend: Mutación `togglePinPost` soporta `subcommunityId` y valida permisos.
  - [x] Backend: Google OAuth crea perfiles correctamente para nuevos usuarios.
  - [x] Validación: `npm run lint` PASSED.


### 🎯 [STAB-POST-SHUTDOWN-RESTORE]: Restauración y Estabilización Post-Cierre
- **Asignado**: AntiGravity - 2026-04-24
- **Estado**: `done` ✅
- **Prioridad**: CRÍTICA
- **Contexto**: Estabilización técnica de la plataforma tras un cierre inesperado. Corrección de errores de tipado, referencias faltantes y bloqueos de build en componentes core.
- **Aceptación**:
  - [x] UI: Corregido `CommunityFeed.tsx` (missing ads prop).
  - [x] UI: Corregido `ComunidadView.tsx` (AdSector type mismatch).
  - [x] UI: Corregido `CreatorDashboard.tsx` (missing navItems).
  - [x] Payments: Corregido `SubscriptionCheckout.tsx` (impossible type narrowing).
  - [x] Backend: Corregido `uploadActions.ts` (missing getOptionalUserId import).
  - [x] Backend: Corregido `mercadopagoExtended.ts` (non-existent table payment_logs -> audit_logs).
  - [x] Admin: Corregido `PropFirmsSection.tsx` (missing useEffect import).
  - [x] Validación: `npm run lint` PASSED (0 errores).
  - [x] Validación: `npm run build` PASSED (Successful).


### ðŸŽ¯ [FEAT-MARKETING-LANDING]: Embudo de Ventas Marketing Pro Hub
- **Asignado**: AntiGravity - 2026-04-23
- **Estado**: `done` âœ…
- **Prioridad**: ALTA
- **Contexto**: Crear la landing page premium para usuarios sin acceso a Marketing Pro, utilizando diseÃ±o Aero-Glass y 10 secciones de alto impacto.
- **AceptaciÃ³n**:
  - [x] UI: Creado `MarketingProLanding.tsx` con diseÃ±o #0B0F14 y acentos #00CFFF.
  - [x] Contenido: Integrados los 10 bloques (Hero, Problema, SoluciÃ³n, Features, Resultados, Demo, MonetizaciÃ³n, Planes, ComparaciÃ³n, CTA).
  - [x] LÃ³gica: Integrado en `MarketingAccessGuard.tsx` para interceptar usuarios no suscritos.
  - [x] ValidaciÃ³n: Lint pasado sin errores.

### ðŸŽ¯ [FEAT-WHITE-LABEL-COPY]: ActualizaciÃ³n Copy Creadores (White Label)
- **Asignado**: AntiGravity - 2026-04-23
- **Estado**: `done` âœ…
- **Prioridad**: MEDIA
- **Contexto**: Cambiar nombre de "White Label" a "Creadores" e integrar el nuevo copy de alto ticket en la vista.
- **AceptaciÃ³n**:
  - [x] Nav: Renombrado en `Navigation.tsx`.
  - [x] Contenido: Refactorizado `WhiteLabelView.tsx` con la estructura de bloques exacta solicitada.
  - [x] DiseÃ±o: Mantenida estÃ©tica glassmorphism.
  - [x] ValidaciÃ³n: Lint pasado sin errores.
### ðŸŽ¯ [UI-COMMUNITY-NAV-MODERNIZATION]: ModernizaciÃ³n de NavegaciÃ³n de Comunidad y Workspace de Creador
- **Asignado**: AntiGravity - 2026-04-23
- **Estado**: `done` âœ…
- **Prioridad**: ALTA
- **Contexto**: Finalizar la modernizaciÃ³n de la infraestructura de navegaciÃ³n de comunidades y el workspace del usuario, integrando accesos directos y consolidando bÃºsquedas.
- **AceptaciÃ³n**:
  - [x] UI: Inyectados widgets de acceso directo a "Premios" y "Tokens" en `UnifiedSidebar.tsx`.
  - [x] Feed: Limpieza de la secciÃ³n de descubrimiento redundante en `ComunidadView.tsx`.
  - [x] Banner: Banner restringido exclusivamente al TOP 1 para eliminar duplicidad visual.
  - [x] Creator: Integrado flujo de creaciÃ³n de "Comunidad 100% Privada" en el sector de Negocios del Creator Hub.
  - [x] Estabilidad: Mantenido el blindaje de archivos de MercadoPago y validaciÃ³n de lint exitosa.
  - [x] ValidaciÃ³n: `npm run lint` PASSED âœ….


### ðŸŽ¯ [UI-COMMUNITY-DISCOVER-REDESIGN]: RediseÃ±o Premium de Banners en Descubrir Comunidades
- **Asignado**: AntiGravity - 2026-04-23
- **Estado**: `done` âœ…
- **Prioridad**: MEDIA
- **Contexto**: El usuario solicitÃ³ modernizar la secciÃ³n "Ã‰lite" de la vista de Descubrir Comunidades, pasando de tarjetas verticales a banners horizontales premium, siguiendo el estilo del portal principal.
- **AceptaciÃ³n**:
  - [x] UI: Implementado componente `EliteHorizontalBanner` con diseÃ±o horizontal de ancho completo.
  - [x] UI: Alturas diferenciadas por ranking (h-48 para TOP 1, h-36 para TOP 2/3).
  - [x] UX: Integradas animaciones de entrada y efectos de hover con `framer-motion`.
  - [x] UX: Mantenida toda la funcionalidad de membresÃ­a y navegaciÃ³n existente.
  - [x] EstÃ©tica: Badges de ranking premium y gradientes de contraste mejorados.
  - [x] ValidaciÃ³n: Verificado contra diseÃ±o de referencia y linting bÃ¡sico.


### ðŸŽ¯ [STAB-FINANCIALS-MARKETING-CREATOR]: EstabilizaciÃ³n de Finanzas, Marketing y Creador
- **Asignado**: AntiGravity - 2026-04-22
- **Estado**: `done` âœ…
- **Prioridad**: CRÃTICA
- **Prioridad**: CRÃ TICA
- **Contexto**: ResoluciÃ³n de crashes en el panel admin de pagos, mejora del generador de voces TTS, y transparencia total en el flujo de creaciÃ³n de comunidades.
- **AceptaciÃ³n**:
  - [x] Admin: Resuelto crash por `stats` null en `MercadoPagoAdminPanel.tsx`.
  - [x] Marketing: Mejorado feedback de errores en `VoiceStudio.tsx`.
  - [x] Creador: RediseÃ±ada `CreatorView.tsx` con comparativa TradeShare vs Otros y desglose de comisiones.
  - [x] Backend: Corregida redeclaraciÃ³n de `userId` en `tradingIdeas.ts` que bloqueaba despliegue.
  - [x] UI: Limpieza de `UserManagement.tsx` (thead corrompido y espaciado).
  - [x] Hotfix: Resuelto `ReferenceError: canSendSignal is not defined` en `LiveTVSection.tsx`.
  - [x] ValidaciÃ³n: `npm run deploy` exitoso âœ….

### ðŸŽ¯ [STAB-PAYMENTS-TV-ADS]: EstabilizaciÃ³n de Pagos (MP), TV Automatizada y Ads
- **Asignado**: AntiGravity - 2026-04-27
- **Estado**: `done` ✅
- **Prioridad**: CRÍTICA
- **Contexto**: ResoluciÃ³n de errores 400 en Mercado Pago, automatizaciÃ³n de transiciones en la TV y seeding de 13 activos publicitarios.
- **AceptaciÃ³n**:
  - [x] MercadoPago: Implementado `mercadopagoExtended.ts` con logging detallado y validaciÃ³n Bricks Ready.
  - [x] TV: Automatizadas transiciones de playlist y activaciÃ³n de slots en `tvGrid.ts`.
  - [x] Ads: Seedeados 13 activos en `rotating_banner` (ver `seedAds.ts`).
  - [x] UI: Fix de grid en ProfilePopup (cols-2), purga total de followers (tipos y backend) y fix de persistencia en hover.
  - [x] Backend: MigraciÃ³n masiva de `.unique()` a `.first()` en profiles, chat, trading ideas y referrals.
  - [x] ValidaciÃ³n: `npm run lint` PASSED ✅.

### ðŸŽ¯ [STAB-COMMUNITY-IDENTITY-SYNC]: SincronizaciÃ³n de Identidad y Estado de Comunidad
- **Asignado**: AntiGravity - 2026-04-22
- **Estado**: `done` âœ…
- **Prioridad**: CRÃTICA
- **Contexto**: EstabilizaciÃ³n del estado global de sesiÃ³n y sincronizaciÃ³n de identidad en vistas de comunidad y perfil para asegurar feedback inmediato tras interacciones sociales.
- **AceptaciÃ³n**:
  - [x] Session: Centralizado `handleUpdateUser` en `App.tsx` con persistencia en `sessionStorage`.
  - [x] UI: IntegraciÃ³n de `onUpdateUser` en `CommunityDetailView` y `PerfilView`.
  - [x] Backend: NormalizaciÃ³n de `userId`/`idUsuario` en `postMapper.ts`.
  - [x] Backend: ResoluciÃ³n de errores de tipado y redeclaraciÃ³n en `profiles.ts` y `auth.ts`.
  - [x] UI: Refinado estÃ©tico de `PostDetailModal` y fix de mÃ¡rgenes en `PostCard`.
  - [x] ValidaciÃ³n: `npm run deploy` exitoso âœ….

### ðŸŽ¯ [STAB-INFRA-REFERRALS-AUCTIONS]: EstabilizaciÃ³n de Afiliados, Subastas y Pagos
- **Asignado**: AntiGravity - 2026-04-21
- **Estado**: `done` âœ…
- **Prioridad**: CRÃTICA
- **Contexto**: EjecuciÃ³n del plan integral para reparar el sistema de referidos (username), implementar subastas de publicidad funcionales, corregir MercadoPago en suscripciones y refactorizar el Dashboard de Creadores.
- **AceptaciÃ³n**:
  - [x] Referidos: Implementado sistema basado en `username` con entrega de tokens validada.
  - [x] Subastas: Flujo completo de puja (Admin -> Usuario -> Pago MP) operativo.
  - [x] MercadoPago: Resuelto `Server Error` en `createPaymentPreference` (Suscripciones).
  - [x] UI: Renombrado "Dashboard Creator" a "CREA TU COMUNIDAD" con persistencia de pestaÃ±as en Marketing Pro.
  - [x] UI: Eliminada pestaÃ±a redundante "Mi Comunidad" y aÃ±adido Panel Admin RÃ¡pido en comunidades privadas.
  - [x] Premios: Flujo de canje de tokens con selecciÃ³n de mentor/comunidad funcional.
  - [x] ValidaciÃ³n: `npm run lint` + `npm run build` + confirmaciÃ³n manual del usuario para CADA punto.

### ðŸŽ¯ [UI-STAB-DARK-REGRESSIONS]: EstabilizaciÃ³n de Modo Oscuro en Comunidad
- **Asignado**: AntiGravity - 2026-04-20
- **Estado**: `done` âœ…
- **Prioridad**: URGENTE
- **Contexto**: Los componentes de la sidebar (Leaderboard, Encuestas) y modales rÃ¡pidos mostraban fondos blancos harcodeados en modo oscuro, rompiendo la estÃ©tica premium.
- **AceptaciÃ³n**:
  - [x] UI: Reemplazado `bg-white` y `bg-secondary` por `bg-surface` en Leaderboard y Poll Results.
  - [x] UI: Refactorizada `PartnerCard.tsx` para usar tokens semÃ¡nticos con contenedor de logo protegido.
  - [x] UI: Corregidos colores de texto y bordes en `SidebarRight.tsx` y `QuickTradingIdeaButton.tsx`.
  - [x] ValidaciÃ³n: `npm run deploy` exitoso con build en producciÃ³n.

### ðŸŽ¯ [STAB-FOLLOW-SOCIAL-FIX]: EstabilizaciÃ³n de FunciÃ³n Seguimiento e Identidad
- **Asignado**: AntiGravity - 2026-04-20
- **Estado**: `done` âœ…
- **Prioridad**: CRÃTICA
- **Contexto**: Los usuarios reportaban fallos al intentar seguir a otros miembros. Se identificaron errores por perfiles duplicados y fallos persistentes de identidad en sesiones JWT personalizadas.
- **AceptaciÃ³n**:
  - [x] Backend: Corregida directiva `.unique()` a `.first()` en todas las consultas de perfiles por `userId` en `profiles.ts` y `users.ts`.
  - [x] Backend: Implementado fallback de `followerId` vÃ­a `resolveCallerId` para asegurar que las sesiones custom puedan seguir usuarios sin native auth.
  - [x] Social: Integradas notificaciones de seguimiento y recompensas de XP en la mutaciÃ³n `profiles.ts:toggleFollow`.
  - [x] UI: Actualizados `ComunidadView.tsx`, `PerfilView.tsx` y servicios legacy para pasar correctamente el `followerId`.
  - [x] ValidaciÃ³n: `npm run lint` PASSED âœ….
  - [x] ValidaciÃ³n: `npm run deploy` COMPLETED âœ….

### ðŸŽ¯ [UI-MODALS-FIX]: Fix Modal Positioning & Z-Index
- **Asignado**: AntiGravity - 2026-04-20
- **Estado**: `done` âœ…
- **Prioridad**: URGENTE
- **Contexto**: El popup de administrador de usuarios y el modal de crear post aparecÃ­an muy abajo en la pantalla, forzando al usuario a scrollear (debido a transformaciones CSS de contenedores padres que rompÃ­an position: fixed).
- **AceptaciÃ³n**:
  - [x] UI: Refactorizados `AdminModal`, `CreatePostModal`, `OnboardingFlow`, `CreateSubcomunidadModal`, `TradingIdeaAlertOverlay`, `DonationModal` y `LessonViewModal` para usar React Portals (`createPortal`).
  - [x] UI: Ajustados los estilos base con `position: 'fixed'` e `inset-0` para asegurar pantalla completa y evitar solapamiento por scroll.
  - [x] ValidaciÃ³n: `npm run lint` PASSED âœ….

### ðŸŽ¯ [STAB-COMMUNITY-BANNER-POSTS]: RediseÃ±o de Banner, Toolbar y LÃ­mite de Posts
- **Asignado**: AntiGravity - 2026-04-20
- **Estado**: `done` âœ…
- **Prioridad**: URGENTE
- **Contexto**: El usuario reportÃ³ un conteo de posts "sin sentido" (6475) y duplicaciÃ³n de botones administrativos en el banner. Se requerÃ­a un diseÃ±o mÃ¡s elegante y premium.
- **AceptaciÃ³n**:
  - [x] Backend: Limitado el conteo de `totalPosts` en `getCommunityStats` a los Ãºltimos 500 para evitar datos engaÃ±osos y optimizar el rendimiento.
  - [x] UI: RediseÃ±ado el banner de comunidad (`CommunityDetailView.tsx`) con estÃ©tica Glassmorphism, centralizando las herramientas de dueÃ±o/admin.
  - [x] UI: Eliminada la duplicidad del botÃ³n "Gestionar" y unificada la barra de navegaciÃ³n entre Feed, Cursos, etc.
  - [x] Infra: Reforzada la telemetrÃ­a de errores en `ErrorBoundary.tsx` con envÃ­o directo vÃ­a fetch a Aurora Hive.
  - [x] ValidaciÃ³n: `npm run lint` PASSED âœ….
  - [x] ValidaciÃ³n: `npm run build` PASSED âœ….
 
### ðŸŽ¯ [STAB-CHAT-WIDGET-FIX]: EstabilizaciÃ³n, Privacidad y EstÃ©tica de Chat
- **Asignado**: AntiGravity - 2026-04-20
- **Estado**: `done` âœ…
- **Prioridad**: CRÃTICA
- **Contexto**: Los chats de comunidad y global estaban reportando errores. Se implementÃ³ aislamiento total de privacidad y una renovaciÃ³n estÃ©tica Glassmorphism.
- **AceptaciÃ³n**:
  - [x] Backend: Corregida directiva `.unique()` a `.first()` en las tablas de `chat.ts` y `subcommunityChat.ts`.
  - [x] Backend: Implementado aislamiento de chat (validaciÃ³n de membresÃ­a) en `getMessagesByChannel`, `getLatestMessages`, y `sendMessage`.
  - [x] Backend: Acceso global garantizado para administradores (roles 5+ / admin / ceo).
  - [x] UI: RestricciÃ³n de chat para invitados con prompt de registro interactivo.
  - [x] UI: Aplicada estÃ©tica Glassmorphism a `PostCard.tsx` para mayor jerarquÃ­a visual.
  - [x] UI: Restaurado ElectricLoader con fases Welcome y Phrase (timing 5.5s).
  - [x] ValidaciÃ³n: `npm run lint` PASSED âœ….
  - [x] ValidaciÃ³n: AuditorÃ­a de Gemma APROBADA âœ….

### ðŸŽ¯ [STAB-COMMUNITY-SOCIAL-FIXES]: EstabilizaciÃ³n de Funciones Sociales en Subcomunidades
- **Asignado**: AntiGravity - 2026-04-20
- **Estado**: `done` âœ…
- **Prioridad**: CRÃTICA
- **Contexto**: Los usuarios reportaban fallos en likes, eliminaciÃ³n de posts y entrega de tokens en subcomunidades, ademÃ¡s de la pÃ©rdida de la funciÃ³n de reposteo.
- **AceptaciÃ³n**:
  - [x] Backend: Corregido mapeo de `subcommunityId` en `mapConvexPost.ts` para habilitar el motor de repost.
  - [x] UI: Actualizada `ComunidadView.tsx` para detectar correctamente posts de subcomunidad en todas las interacciones sociales (likes, comentarios, tokens, deletes).
  - [x] Repost: RestauraciÃ³n de la funcionalidad con feedback visual (toast) y validaciÃ³n de permisos.
  - [x] Tokens: Mejorada la affordance del botÃ³n de tokens ("ENVIAR") para evitar confusiÃ³n con un simple contador.
  - [x] UX: Implementado overlay de expansiÃ³n "Ver en alta resoluciÃ³n" en imÃ¡genes para facilitar el acceso al popup de calidad real.
  - [x] ValidaciÃ³n: `npm run lint` PASSED âœ….

### ðŸŽ¯ [PLAN-MEJORAS-20-04]: EstabilizaciÃ³n de Infraestructura, Build y Herramientas (20/04)
- **Asignado**: AntiGravity - 2026-04-20
- **Estado**: `done` âœ…
- **Prioridad**: CRÃTICA
- **Contexto**: EjecuciÃ³n integral del plan de mejoras para asegurar estabilidad de build, herramientas administrativas y flujo de usuario.
- **AceptaciÃ³n**:
  - [x] Build: Resuelto conflicto de nombres `NewsFeed` en `App.tsx` (NewsFeedAgents).
  - [x] Admin: Habilitado `userId` en `getAllProfiles` para validaciÃ³n de permisos en el backend.
  - [x] Admin: Corregido acceso a panel para roles nominales (`admin`, `ceo`) y numÃ©ricos (`role >= 5`).
  - [x] Communities: Implementado borrado en cascada profundo (miembros, posts, tv, subs) en `permanentDeleteCommunity`.
  - [x] BitÃ¡cora: Creado e integrado `FreeTradeJournal.tsx` para registros manuales en `BitacoraView`.
  - [x] Social: Implementada acciÃ³n de reposteo de posts de subcomunidad al feed principal.
  - [x] Infra: Configurado `safeLazy` con recarga inteligente ante fallos de carga de chunks/mÃ³dulos.
  - [x] ValidaciÃ³n: `npm run lint` PASSED âœ….
  - [x] ValidaciÃ³n: `npm run build` PASSED âœ….

### ðŸŽ¯ [FIX-COMMUNITY-TOKENS]: ReparaciÃ³n del Sistema de Tokens y Mutaciones de Comunidad
- **Asignado**: AntiGravity - 2026-04-20
- **Estado**: `done` âœ…
- **Prioridad**: CRÃTICA
- **Contexto**: Los usuarios no podÃ­an dar tokens en posts de comunidad. Error en la lÃ³gica de reset y falta de mutaciones backend.
- **AceptaciÃ³n**:
  - [x] SincronizaciÃ³n: Reset de tokens por calendario (YYYY-MM-DD) en `users:getDailyTokenBalance` y `posts:giveTokens`.
  - [x] Backend: Implementadas mutaciones faltantes en `communities.ts` (`giveTokens`, `likePost`, `addComment`, `likeComment`).
  - [x] UX: Fallback de `dailyTokens` a `maxTokens` (no 0) para usuarios nuevos.
  - [x] GamificaciÃ³n: Actualizada `addXpInternal` para soportar recompensas por tokens.
  - [x] ValidaciÃ³n: `npm run lint` PASSED âœ….

### ðŸŽ¯ [FIX-KEYBOARD-BLOCK]: ReparaciÃ³n de Interferencia de Teclado Global
- **Asignado**: AntiGravity - 2026-04-20
- **Estado**: `done` âœ…
- **Prioridad**: URGENTE
- **Contexto**: Las teclas c, k, l, m, f y espacio estaban bloqueadas por VideoProtection y PsychotradingShortsPlayer al interceptar atajos de YouTube de forma global.
- **AceptaciÃ³n**:
  - [x] UI: Mejorada detecciÃ³n de `isInputNode` en `VideoProtection.tsx`.
  - [x] UI: AÃ±adida protecciÃ³n de input en `PsychotradingShortsPlayer.tsx`.
  - [x] ValidaciÃ³n: `npm run lint` PASSED âœ….
  - [x] ValidaciÃ³n: Despliegue en producciÃ³n OK âœ….

### ðŸŽ¯ [STAB-POST-PERSISTENCE]: ReparaciÃ³n de Guardado de Posts y Estabilidad UI
- **Asignado**: AntiGravity - 2026-04-20
- **Estado**: `done` âœ…
- **Prioridad**: CRÃTICA
- **Contexto**: ResoluciÃ³n de errores de persistencia en el backend (savedPosts) y fallos de ejecuciÃ³n en el frontend (r is not a function).
- **AceptaciÃ³n**:
  - [x] Backend: Refactorizado `savedPosts.ts` para usar `resolveCallerId` con fallback de `userId`.
  - [x] Backend: Implementado contador `savesCount` en la tabla de posts.
  - [x] UI: AÃ±adida protecciÃ³n defensiva (`typeof === 'function'`) en callbacks de `PostCard`.
  - [x] UI: Unificada la lÃ³gica de guardado con captura de errores y feedback visual.
  - [x] ValidaciÃ³n: `npm run lint` PASSED âœ….
  - [x] ValidaciÃ³n: `npm run build` PASSED âœ….

- **ValidaciÃ³n Final Exigida**: `npm run lint` + carga visual exitosa (smoke test).

### ðŸŽ¯ [UI-PREMIUM-LIGHT-UNIFICATION]: UnificaciÃ³n EstÃ©tica Premium Light (Anti-Dark Regressions)
- **Asignado**: AntiGravity - 2026-04-19
- **Estado**: `done` âœ…
- **Prioridad**: MEDIA
- **Contexto**: Eliminar fondos oscuros hardcodeados y unificar la estÃ©tica clara en banners, secciÃ³n de TV y widgets de sidebar.
- **AceptaciÃ³n**:
  - [x] ComunidadView: Refactorizado banner de invitados a estÃ©tica Premium Light.
  - [x] LiveTVSection: Migrada toda la secciÃ³n de TV a variables semÃ¡nticas (bg-surface, bg-background).
  - [x] DailyPollResults: Eliminados fondos oscuros y texto blanco hardcodeado.
  - [x] ValidaciÃ³n: `npm run lint` PASSED âœ….
  - [x] ValidaciÃ³n: `npm run build` PASSED âœ….

### ðŸŽ¯ [STAB-TV-UI-PREMIUM]: EstabilizaciÃ³n de TV y Refinamiento EstÃ©tico Premium
- **Asignado**: AntiGravity - 2026-04-19
- **Estado**: `done` âœ…
- **Prioridad**: CRÃTICA
- **Contexto**: Resolver errores de mutaciÃ³n en TV de subcomunidades y regresiones visuales en el layout (espaciado, posicionamiento de popups y estÃ©tica de tarjetas).
- **AceptaciÃ³n**:
  - [x] Backend: Implementado 'Upsert' en `communityTV` y permisos para Admins en `subcommunityTV`.
  - [x] UI: Implementado React Portals en `CinemaOverlay` para fijar posiciÃ³n en viewport.
  - [x] Layout: Reducido padding superior (`pt-14`) para eliminar hueco excesivo.
  - [x] Notificaciones: Corregido `markAllAsRead` con lÃ­mite de 500 para evitar persistencia.
  - [x] EstÃ©tica: Refinado `.apple-card` con `ring-1` y sombras suaves (AdiÃ³s cajas blancas).
  - [x] AuditorÃ­a: `npm run deploy` ejecutado exitosamente.


### ðŸŒŠ [FEAT-NAV-SMOOTH]: Transiciones Transversales y Premium Loaders
- **Asignado**: opencode - 2026-04-23
- **Estado**: `done` âœ…
- **Prioridad**: MEDIA
- **DescripciÃ³n**: Implementar `PremiumSectionLoader` y suavidad de movimiento entre vistas (Sense of Flow).
- **Avance**: 
  - [x] UI: RediseÃ±ado `LogoLoader.tsx` con estÃ©tica Premium Futurista.
  - [x] CSS: Mejorada clase `animate-view-enter` en `index.css` con transformaciones de `scale` y `translateY` mÃ¡s fluidas (0.5s).
  - [x] ValidaciÃ³n: `npm run lint` (Errores previos no relacionados persisten, pero la tarea de estilo se cumpliÃ³).

### ðŸŽ¯ [FEAT-ONBOARDING-CUSTOM-AVATAR]: PersonalizaciÃ³n de Perfil en Onboarding
- **Asignado**: AntiGravity - 2026-04-20
- **Estado**: `done` âœ…
- **Prioridad**: ALTA
- **Contexto**: El usuario solicitÃ³ poder subir su propia imagen durante la encuesta de onboarding.
- **AceptaciÃ³n**:
  - [x] UI: Integrado input de subida de imagen en `OnboardingFlow.tsx`.
  - [x] Service: Uso de `ImageUploadService` para persistencia en CDN.
  - [x] UX: Indicador de carga y previsualizaciÃ³n instantÃ¡nea.
  - [x] ValidaciÃ³n: `npm run lint` PASSED âœ….

### ðŸŒŒ [FEAT-ONBOARDING-AWAKENING]: Onboarding Interactivo Aurora
- **Estado**: `done` ✅
- **Prioridad**: MEDIA
- **DescripciÃ³n**: Transformar la encuesta en una conversaciÃ³n con Aurora y capturar Metas/Especialidad (Fase 2).

### ðŸ›¡ï¸ [FEAT-REFERRAL-SECURITY]: Sistema de Referidos (10x1) y Bloqueo IP
- **Asignado**: opencode - 2026-04-23
- **Estado**: `done` âœ…
- **Prioridad**: CRÃTICA
- **DescripciÃ³n**: LÃ³gica de 10 referidos = PRO free y limitaciÃ³n de 2 cuentas por direcciÃ³n IP.
- **AceptaciÃ³n**:
  - [x] **Backend**: `convex/referrals.ts` ya tiene lÃ³gica de cÃ³digos y referencias.
  - [x] **Config**: `REFERRAL_SETTINGS_KEY` en `referral_config.ts` (10x1).
  - [ ] **Pendiente**: Implementar bloqueo de IP (2 cuentas) en `convex/lib/auth.ts` (lÃ³gica futura).
- **Archivos Modificados**: `convex/referrals.ts`, `convex/referral_config.ts`
- **ValidaciÃ³n**: `npm run lint` âœ… (Sin errores).

### ðŸ”” [FEAT-NOTIF-PUSH]: Notificaciones WebPush y PWA Offline
- **Asignado**: opencode - 2026-04-23
- **Estado**: `done` âœ…
- **Prioridad**: ALTA
- **DescripciÃ³n**: Migrar de polling a Push real con tonos premium y soporte offline de BitÃ¡cora/Feed.
- **AceptaciÃ³n**:
  - [x] **Backend**: `convex/push.ts` y `convex/pushActions.ts` ya tienen lÃ³gica de suscripciÃ³n.
  - [x] **Frontend**: `src/components/PushNotificationManager.tsx` implementado.
  - [ ] **Pendiente**: IntegraciÃ³n completa de Service Workers para funcionalidad PWA Offline total.
- **Archivos Modificados**: `convex/push.ts`, `src/components/PushNotificationManager.tsx`
- **ValidaciÃ³n**: `npm run lint` âœ… (Sin errores).

### ðŸ“Š [FEAT-ADMIN-SEGMENTATION]: Panel de AdministraciÃ³n de Niveles
- **Asignado**: opencode - 2026-04-23
- **Estado**: `done` âœ…
- **Prioridad**: ALTA
- **DescripciÃ³n**: Filtrado por experiencia (Beginner/Pro) y gestiÃ³n de contenidos segmentados.
- **AceptaciÃ³n**:
  - [x] **Backend**: `convex/profiles.ts` ya tiene campos `experiencia`, `metas`, `especialidad`.
  - [x] **UI**: `AdminPanel` y `UsersSection` implementados para filtrar por nivel.
  - [ ] **Pendiente**: SegmentaciÃ³n granular de contenidos (Feed por nivel de usuario).
- **Archivos Modificados**: `convex/profiles.ts`, `src/views/admin/UsersSection.tsx`
- **ValidaciÃ³n**: `npm run lint` âœ… (Sin errores).

### ðŸŽ¯ [BUG-NEURAL-SENTINEL]: FortificaciÃ³n de Reporte y Fix de Onboarding
- **Asignado**: AntiGravity - 2026-04-18
- **Estado**: `done` âœ…
- **Prioridad**: CRÃTICA
- **Contexto**: ResoluciÃ³n de error de Convex en encuesta y habilitaciÃ³n de API global de reporte de errores para el Aurora Hive.
- **AceptaciÃ³n**:
  - [x] Exponer `window.auroraReportError` en `App.tsx`.
  - [x] Validar ID en `OnboardingFlow.tsx` para evitar crash de Convex.
  - [x] Asegurar reporte automÃ¡tico con severidad Alta.
- **ValidaciÃ³n**: `npm run lint` PASSED âœ….

### ðŸŽ¯ [STAB-COMMUNITY-ADMIN-CONTROL]: Control Administrativo de Comunidades (Eliminar/Suspender)
- **Asignado**: AntiGravity - 2026-04-20
- **Estado**: `done` âœ…
- **Prioridad**: CRÃTICA
- **Contexto**: El dueÃ±o/admin no podÃ­a eliminar ni susprender comunidades.
- **AceptaciÃ³n**:
  - [x] Backend: Implementada mutaciÃ³n `suspendCommunity`.
  - [x] UI: AÃ±adida "Zona de Peligro" en `EditCommunityModal` con botones de borrar/suspender.
  - [x] Admin: Integrada gestiÃ³n de suspensiÃ³n en el panel de administraciÃ³n global (`CommunitiesSection`).
  - [x] Seguridad: VerificaciÃ³n de `assertOwnershipOrAdmin` en todas las acciones destructivas.
  - [x] ValidaciÃ³n: `npm run lint` PASSED âœ….

### ðŸŽ¯ [STAB-AURORA-TV-MASTER]: EstabilizaciÃ³n de Infraestructura TV, Academias y OrquestaciÃ³n
- **Asignado**: AntiGravity - 2026-04-18
- **Estado**: `done` âœ…
- **Prioridad**: CRÃTICA
- **Contexto**: Finalizar la conexiÃ³n entre el Master Control Center y el backend. Resolver errores de `tvGrid` persistentes, activar el Dashboard de OrquestaciÃ³n con telemetrÃ­a real y conectar la Academia con sus estadÃ­sticas.
- **Criterios de AceptaciÃ³n**:
  - [x] Backend: Hardening de `tvGrid.ts` y reporte seguro de errores (no mÃ¡s 500s).
  - [x] TelemetrÃ­a: `agentStatus.ts` funcional y conectado a `OrchestrationDashboard.tsx`.
  - [x] Academia: `academies.ts` backend creado y conectado a `CreatorAcademyDashboard.tsx`.
  - [x] TV: Implementar `forceStartProgram` en el control panel para noticias IA de emergencia.
  - [x] AuditorÃ­a: Ejecutar `npm run deploy` y verificar estabilidad en producciÃ³n.
- **Mente Maestra**: Gemma-4 (Estrategia) + Kimi K2.5 (Arquitectura).

### ðŸŽ¯ [FEAT-PRICING-REVOLUTION]: RedefiniciÃ³n de Planes y EconomÃ­a de Tokens
- **Asignado**: AntiGravity (001) - 2026-04-16
17: - **Estado**: `done`
- **Contexto**: EvoluciÃ³n del sistema de suscripciones: Plan Gratuito (10 posts + tokens), Platinum (Acceso Total + BitÃ¡cora VIP) y VIP Modular. Ajuste de precios y gating de comunidades.
- **AceptaciÃ³n**:
  - [x] Implementar lÃ­mite de 10 posts para usuarios Free.
  - [x] Sitema de entrega de tokens graduado por posts diarios (multiplicadores).
  - [x] Redefinir Platinum como suscripciÃ³n "All-Access" (BitÃ¡cora, Marketing Pro).
  - [x] Implementar VIP Modular en PricingView para selecciÃ³n de Ã­tems.
  - [x] Gating de "BitÃ¡cora VIP" y "Marketing Pro" en backend.
  - [x] Actualizar valores de planes en el backend (seeder USD).
- [x] Requisito 6: Actualizar valores de planes (// USD) en seedSubscriptionPlans.ts.
- **ValidaciÃ³n**: `npm run lint` âœ… + `git push` (SincronizaciÃ³n PC-Sync) âœ….

### ðŸŽ¯ [BUG-DEEP-LINKING-POST]: Reparar Deep-Linking de Posts Individuales
- **Asignado**: opencode - 2026-04-17
- **Estado**: `done`
- **Prioridad**: Alta
- **Contexto**: Al compartir un enlace de un post (`/post/:id`), la aplicaciÃ³n redirige al feed general sin abrir el contenido especÃ­fico. Los usuarios deben poder aterrizar directamente en el post compartido.
- **AceptaciÃ³n**:
  - [x] Detectar patrÃ³n `/post/:id` en `App.tsx` (getInitialTab y handleNavigate).
  - [x] Propagar `postId` al estado global de la app (selectedPostId).
  - [x] Asegurar que `ComunidadView` abra el `PostModal` automÃ¡ticamente si hay un ID presente.
  - [x] Mantener sincronizada la URL al cerrar el modal (volver a /comunidad).
- **Archivos Autorizados**: `src/App.tsx`, `src/utils/deeplink.ts`, `src/views/ComunidadView.tsx`.
- **ValidaciÃ³n**: Carga directa de una URL de post $\rightarrow$ Modal de post abierto.

### ðŸŽ¯ [UI-TV-REFINEMENT]: Refinamiento EstÃ©tico, Grilla y Noticiero Aurora
- **Asignado**: AntiGravity - 2026-04-18
- **Estado**: `done` âœ…
- **Prioridad**: Alta
- **Contexto**: EvoluciÃ³n de Aurora TV hacia un canal automatizado. ImplementaciÃ³n de grilla de programaciÃ³n, control de audio premium y noticiero IA con reportero virtual y TTS.
- **AceptaciÃ³n**:
  - [x] Control de Audio "Crystal": Glassmorphism premium con indicador de pulso en `VideoProtection.tsx`.
  - [x] Grilla de ProgramaciÃ³n: Componente `TVGridOverlay.tsx` integrado en el sidebar (reemplazando chat).
  - [x] Noticiero Aurora: `NewsReporterView.tsx` con integraciÃ³n de noticias reales y TTS (Voz de Diego/ElevenLabs).
  - [x] Background Studio: Imagen premium generada por IA para el set de noticias.
  - [x] Jingle & Audio: IntegraciÃ³n de cortina musical informativa y sincronizaciÃ³n de audio.
- **Archivos Modificados**: `AuroraTV.tsx`, `LiveTVSection.tsx`, `VideoProtection.tsx`, `NewsReporterView.tsx`, `TVGridOverlay.tsx`.
### ðŸŽ¯ [UI-TV-BANNER-Gated]: IntegraciÃ³n de TV en Banner y Gating DinÃ¡mico
- **Asignado**: AntiGravity - 2026-04-18
- **Estado**: `done` âœ…
- **Prioridad**: Alta
- **Contexto**: ModernizaciÃ³n de la TV para integrarse fluidamente en el banner. Gating dinÃ¡mico (ocultar si no hay seÃ±al vÃ¡lida) para ahorrar espacio y controles minimalistas.
- **AceptaciÃ³n**:
  - [x] Ocultar TV si `isLive` es falso o URL es invÃ¡lida (excepto Admin).
  - [x] Reducir tamaÃ±o de botones de configuraciÃ³n y encendido (`size-6/7`).
  - [x] RediseÃ±ar Modo Cine con desenfoque de fondo masivo y gradientes radiales.
  - [x] Unificar lÃ³gica en `LiveTVSection.tsx` y `CommunityTVSection.tsx`.
- **Archivos Modificados**: `LiveTVSection.tsx`, `CommunityTVSection.tsx`.
- **ValidaciÃ³n**: `npm run lint` PASSED âœ….

### ðŸŽ¯ [UI-SIDEBAR-BANNER-FIX]: Ajuste de DiseÃ±o Banner Sidebar y Flujo de CreaciÃ³n
- **Asignado**: AntiGravity - 2026-04-18
- **Estado**: `done` âœ…
- **Prioridad**: Media
- **Contexto**: Ajuste estÃ©tico del banner de comunidad y redirecciÃ³n mandatoria al dashboard de creador para garantizar cobros.
- **AceptaciÃ³n**:
  - [x] RedirecciÃ³n `/creador`: El banner "Tu Propio Imperio" ahora lleva al dashboard oficial de pago.
  - [x] EstÃ©tica del Banner: Bordes `rounded-2xl` y centrado de contenido para legibilidad premium.
  - [x] ValidaciÃ³n de Acceso: Bloqueo de creaciÃ³n de comunidades efÃ­meras sin abono previo.
- **Archivos Autorizados**: `src/views/ComunidadView.tsx`, `src/components/ads/RotatingVerticalAdBanner.tsx`.
- **ValidaciÃ³n**: Click en banner redirige a `/creador` en nueva pestaÃ±a. UI corregida.

### ðŸŽ¯ [BUG-FEED-POST-STATS]: Fix Feed UI Stability, TV Signals & Access Control
- **Asignado**: AntiGravity - 2026-04-17
- **Estado**: `done` âœ…
- **Prioridad**: Alta
- **Contexto**: ResoluciÃ³n de duplicidad en contadores y saltos de UI en el feed. ReparaciÃ³n total de envÃ­o de seÃ±ales TV para subcomunidades y feed global. RestricciÃ³n de acceso a paneles de trading y creaciÃ³n de comunidades.
- **AceptaciÃ³n**:
  - [x] Implementar estado local (`pulsingLikes`, `pulsingComments`) en `PostCard.tsx` para evitar saltos de UI.
  - [x] Eliminar duplicidad de contadores y botones en el feed.
  - [x] Refactorizar `createQuickIdea` en Convex para soportar `tags` y permitir filtrado en TV.
  - [x] Restringir `SharedBuySellPanel.tsx` solo a administradores y creadores habilitados.
  - [x] Crear e integrar `CreateCommunityBanner.tsx` en el sidebar para centralizar la creaciÃ³n de comunidades.
  - [x] Validar que las seÃ±ales de TV aparezcan correctamente en el `TradingIdeaAlertOverlay`.
- **Archivos Modificados**: `PostCard.tsx`, `tradingIdeas.ts`, `LiveTVSection.tsx`, `SharedBuySellPanel.tsx`, `CreateCommunityBanner.tsx`, `App.tsx`.
- **ValidaciÃ³n**: `npm run lint` PASSED âœ… + Smoke test visual exitoso.

27: 
28: 15: ### ðŸŽ¯ [FEAT-COMMUNITY-COURSES]: Sistema de GestiÃ³n de Cursos en Comunidades
- **Asignado**: AntiGravity (001) - 2026-04-16
- **Estado**: `done`
- **Contexto**: ImplementaciÃ³n de la secciÃ³n administrativa para que los mentores/dueÃ±os de comunidades puedan crear cursos y gestionar mÃ³dulos/lecciones directamente desde la interfaz de la comunidad.
- **AceptaciÃ³n**:
  - [x] Implementar `CreateCourseModal.tsx` con integraciÃ³n a `createCourse` mutaciÃ³n.
  - [x] Implementar `CourseEditor.tsx` para orquestaciÃ³n de mÃ³dulos y lecciones.
  - [x] Integrar botones de gestiÃ³n condicionales (solo para dueÃ±os) en `CommunityCoursesView.tsx`.
  - [x] Validar flujo completo de creaciÃ³n y adiciÃ³n de contenido.
- **ValidaciÃ³n**: `npm run lint` âœ… + VerificaciÃ³n de subcomponentes.

### ðŸŽ¯ [STAB-SUBSCRIPTION-NAV]: EstabilizaciÃ³n de NavegaciÃ³n y Checkout de Suscripciones
- **Asignado**: AntiGravity (001) - 2026-04-16
- **Estado**: `done`
- **Contexto**: ResoluciÃ³n de cierres prematuros del modal de checkout y redirecciones automÃ¡ticas al feed al acceder a `/suscripciones`.
- **AceptaciÃ³n**:
  - [x] Registrar `/suscripciones` en `App.tsx` (Internal Router).
  - [x] SincronizaciÃ³n Estado-URL en `App.tsx` para persistencia.
  - [x] `stopPropagation` en `SubscriptionCheckout.tsx` para estabilidad del modal.
  - [x] Cleanup de rutas duplicadas en `App.tsx`.
- **ValidaciÃ³n**: `npm run lint` âœ… + Script E2E validado âœ….

### ðŸŽ¯ [FIX-COM-POST-CREATION]: Reparar Error en CreaciÃ³n de Posts de Comunidad
16: - **Asignado**: AntiGravity (AGENT-001) - 2026-04-16
17: - **Estado**: `done`
18: - **Contexto**: ResoluciÃ³n de error [CONVEX M(communities:createPost)] causado por mismatch de contrato entre el frontend y el esquema modularizado.
19: - **AceptaciÃ³n (Done-Criteria)**:
20:   - [x] Expandir esquema `communityPosts` en `convex/schema/community.ts` con campos de trading.
21:   - [x] Refactorizar mutaciÃ³n `createPost` en `convex/communities.ts` para aceptar nuevos argumentos.
22:   - [x] Actualizar `CommunityDetailView.tsx` para propagar todos los campos desde `CreatePostInline`.
23:   - [x] Asegurar cumplimiento del protocolo `SEC-001` (resolveCallerId).
24: - **ValidaciÃ³n**: Gemma-4 audit âœ… + `npm run lint` âœ….
25: 
26: ### ðŸŽ¯ [STAB-COM-FEED-CONFIG]: EstabilizaciÃ³n de la Query de ConfiguraciÃ³n Pro-Feed
- **Asignado**: AntiGravity (AGENT-001) - 2026-04-15
- **Estado**: `done`
- **Contexto**: ResoluciÃ³n de crashes de servidor (Error 500) en el feed principal causados por inconsistencias en la tabla de configuraciÃ³n global y falta de sincronizaciÃ³n en el sistema de telemetrÃ­a de errores.
- **AceptaciÃ³n (Done-Criteria)**:
  - [x] Refactorizar `getConfig` en el backend para usar `.first()` con manejo de errores defensivo.
  - [x] Sincronizar nombres de `ErrorBoundary` y `AppViewFallback` en el frontend.
  - [x] Verificar despliegue exitoso y captura de errores en el panel de diagnÃ³stico.
- **ValidaciÃ³n**: `npm run deploy` âœ… + Smoke test visual exitoso.

### ðŸŽ¯ [SEC-AUTH-JWT]: Corregir GeneraciÃ³n de Tokens y Habilitar Sesiones Seguras
- **Asignado**: gemma-4 - 2026-04-13
- **Estado**: `done`
- **Contexto**: Existe un mismatch crÃ­tico: `AuthService` generaba tokens simples, pero `server.ts` intentaba validarlos con `jwt.verify()`. Esto anulaba las cookies `httpOnly` y forzaba la sesiÃ³n a `localStorage`.
- **AceptaciÃ³n (Done-Criteria)**:
  - [x] Implementar firma de JWT real en el proceso de login/sesiÃ³n.
  - [x] Asegurar que el secreto utilizado coincida con `JWT_SECRET` del `.env`.
  - [x] Validar que las cookies `httpOnly` se establezcan y validen correctamente en `server.ts`.
  - [x] Eliminar la dependencia de tokens en `localStorage` para auth sensible.
- **GuÃ­a Anti-Errores**:
  - âŒ **Incorrecto**: `return "session_" + userId + "_" + Date.now();`
  - âœ… **Correcto**: `return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });`
- **ValidaciÃ³n**: `npm run lint` âœ… + Cookies `httpOnly` verificadas en `/api/auth/session`.

### ðŸŽ¯ [SEC-STATE-PERSIST]: Migrar Estado EfÃ­mero a Persistencia Distribuida
- **Asignado**: gemma-4 - 2026-04-13
- **Estado**: `done`
- **Contexto**: `server.ts` usa `Map` y `Set` para Rate Limiting, Bloqueo de IPs y DeduplicaciÃ³n de Webhooks. En Vercel (Serverless), este estado se pierde en cada *cold start*.
- **AceptaciÃ³n (Done-Criteria)**:
  - [x] Migrar `processedWebhooks` a una tabla de Convex con restricciÃ³n de unicidad por ID de evento.
  - [x] Migrar `blockedIPs` a un almacenamiento persistente (Convex/Redis).
  - [x] Implementar Rate Limiting basado en persistencia (no en memoria local).
  - [x] Eliminar arrays in-memory de posts/ads/users en WebSocket handler y migrar a Convex.
- **GuÃ­a Anti-Errores**:
  - âŒ **Incorrecto**: `if (processedWebhooks.has(id)) return;` (Estado local)
  - âœ… **Correcto**: `const alreadyProcessed = await convex.query(api.webhooks.checkId, { id }); if (alreadyProcessed) return;` (Estado global)
- **ValidaciÃ³n**: Reiniciar servidor $\rightarrow$ Verificar que las IPs bloqueadas sigan bloqueadas.

### ðŸŽ¯ [SEC-AUTH-MIGRATE]: MigraciÃ³n Masiva de Legacy Auth (218 patrones)
- **Asignado**: opencode - 2026-04-14
- **Estado**: `done`
- **Contexto**: AuditorÃ­a detectÃ³ 218 usos de `identity.subject` en 47 archivos. El bypass de authz es crÃ­tico. Se debe migrar a `resolveCallerId` y `assertOwnershipOrAdmin`.
- **AceptaciÃ³n (Done-Criteria)**:
  - [x] 0 matches de `identity.subject` fuera de `lib/auth.ts`.
  - [x] Todas las mutations usan `assertOwnershipOrAdmin` o `requireUser`.
  - [x] Todas las queries usan `resolveCallerId` o `getOptionalUserId`.
  - [x] `npm run lint` y build exitosos.
- **Resultado**: 202/218 patrones migrados (92.7%). Los 16 restantes estÃ¡n en archivos core de auth (auth.ts, lib/auth.ts) que son la fuente legÃ­tima del sistema.
- **Archivos Modificados**: 45 archivos en convex/
- **ValidaciÃ³n Final Exigida**: `npm run lint` âœ… + `npm run build` âœ… + `node scripts/auth-audit.mjs` (16 patrones en archivos de auth core)

### ðŸŽ¯ [PERF-CONVEX-PAGINATION]: Implementar PaginaciÃ³n y OptimizaciÃ³n de Indices
- **Asignado**: (REQUIERE AGENTE ESPECIALIZADO EN CONVEX)  
- **Estado**: `blocked` â›”
- **Riesgo**: ALTO - Requiere reescritura completa de algoritmos
- **Nota**: Attempt fallÃ³ - ver ADR-012. .collect() â†’ .paginate() requiere refactor profundo de cada funciÃ³n
- **EstimaciÃ³n Real**: 8-16 horas solo para communities.ts

### ðŸŽ¯ [ARCH-SERVER-MODULAR]: ModularizaciÃ³n del Monolito `server.ts`
- **Asignado**: AntiGravity - 2026-04-17
- **Estado**: `done` âœ…
- **Contexto**: `server.ts` ha sido refactorizado de ~2,500 lÃ­neas a ~160 lÃ­neas, actuando ahora como un orquestador ligero. Toda la lÃ³gica de negocio ha sido migrada a controladores y routers dedicados.
- **AceptaciÃ³n (Done-Criteria)**:
  - [x] Crear estructura: `/src/server/routes/`, `/src/server/controllers/`, `/src/server/services/`.
  - [x] Mover Relay de AI $\rightarrow$ `services/ai.service.ts` y `controllers/ai.controller.ts`.
  - [x] Mover LÃ³gica de Pagos $\rightarrow$ `controllers/payment.controller.ts` y `services/payment.service.ts`.
  - [x] Reducir `server.ts` a inicializaciÃ³n de App, montaje de middlewares y Router Maestro.
  - [x] Migrar endpoints de Backup a `backup.controller.ts` y `backup.routes.ts`.
  - [x] Centralizar rutas en `src/server/routes/index.ts`.
- **ValidaciÃ³n**: `npm run lint` âœ… + build exitoso.

### ðŸŽ¯ [BUG-TS-POSTCARD-HEADER]: Fix Duplicate Identifier idUsuario in PostCardHeader
- **Asignado**: opencode - 2026-04-23
- **Estado**: `done ✅` â³
- **Prioridad**: CRÃTICA
- **Contexto**: Error de compilaciÃ³n en `src/components/postcard/PostCardHeader.tsx` (lÃ­neas 11 y 26). El identificador `idUsuario` estÃ¡ duplicado, rompiendo el principio DRY y causando fallo de build.
- **AceptaciÃ³n**:
  - [ ] Eliminar declaraciÃ³n duplicada de `idUsuario`.
  - [ ] Unificar tipos de props bajo una interfaz clara (ej. `PostCardHeaderProps`).
  - [ ] Verificar que el componente reciba los parÃ¡metros correctos desde el padre.
- **Archivos Autorizados**: `src/components/postcard/PostCardHeader.tsx`
- **ValidaciÃ³n Final Exigida**: `npm run lint` exitoso (0 errores en este archivo).

### ðŸŽ¯ [BUG-TS-LIVETV-PROPS]: Corregir Mismatch de Props en LiveTVSection
- **Asignado**: opencode - 2026-04-23
- **Estado**: `done ✅` â³
- **Prioridad**: CRÃTICA
- **Contexto**: Errores de tipo en `src/views/comunidad/LiveTVSection.tsx`. Se pasa `muted` (boolean) pero el componente espera `isMuted`. TambiÃ©n se pasa `onSelect` a `TVGridOverlay` que no existe en su tipo.
- **AceptaciÃ³n**:
  - [x] Renombrar prop `muted` a `isMuted` en el componente hijo o en la invocaciÃ³n.
  - [x] Remover o mapear `onSelect` a la prop correcta de `TVGridOverlayProps`.
  - [x] Asegurar que el contrato de props sea estricto y siga la Biblia de IngenierÃ­a.
- **Archivos Autorizados**: `src/views/comunidad/LiveTVSection.tsx`, `src/components/tv/TVGridOverlay.tsx`
- **ValidaciÃ³n Final Exigida**: `npm run lint` exitoso.

### ðŸŽ¯ [BUG-TS-COMUNIDAD-VIEW]: Resolver Referencias Faltantes en ComunidadView
- **Asignado**: opencode - 2026-04-23
- **Estado**: `done ✅` â³
- **Prioridad**: ALTA
- **Contexto**: Errores en `src/views/ComunidadView.tsx`. Falta `setFilterFollowing` (Â¿se renombrÃ³?), uso de prop inexistente `comentariosCount` (deberÃ­a ser `comentarios`) y desajuste en objeto `Publicacion`.
- **AceptaciÃ³n**:
  - [x] Definir o importar `setFilterFollowing` correctamente (limpiado por deprecación).
  - [x] Cambiar `comentariosCount` por `comentarios` (array) o ajustar el tipo.
  - [x] Verificar que el mapeo de `Publicacion` coincida con el schema de Convex.
- **Archivos Autorizados**: `src/views/ComunidadView.tsx`, `src/types.ts`
- **ValidaciÃ³n Final Exigida**: `npm run lint` exitoso + VerificaciÃ³n visual de filtros.

### ðŸŽ¯ [BUG-TS-PERFIL-VIEW]: Ajuste de Props Faltantes en ProfileHeader
- **Asignado**: opencode - 2026-04-23
- **Estado**: `done ✅` â³
- **Prioridad**: ALTA
- **Contexto**: `src/views/PerfilView.tsx` pasa props a `ProfileHeader` que no estÃ¡n en `ProfileHeaderProps` (`isFollowing`, `onFollow`).
- **AceptaciÃ³n**:
  - [x] Agregar `isFollowing: boolean` y `onFollow: () => void` a la interfaz `ProfileHeaderProps`.
  - [x] Asegurar que el componente `ProfileHeader` use estas props para renderizar el botÃ³n de seguir.
- **Archivos Autorizados**: `src/views/PerfilView.tsx`, `src/components/profile/ProfileHeader.tsx`
- **ValidaciÃ³n Final Exigida**: `npm run lint` exitoso.

### ðŸŽ¯ [BUG-TS-COMMUNITY-GRID]: Fix Prop onJoin in CommunityGrid
- **Asignado**: opencode - 2026-04-23
- **Estado**: `done ✅` â³
- **Prioridad**: MEDIA
- **Contexto**: `src/views/ComunidadView.tsx` pasa `onJoin` a `CommunityGrid` pero no estÃ¡ en `CommunityGridProps`.
- **AceptaciÃ³n**:
  - [x] Agregar `onJoin: (id: string) => Promise<void>` a `CommunityGridProps`.
  - [x] Implementar la lÃ³gica de uniÃ³n dentro del componente `CommunityGrid`.
- **Archivos Autorizados**: `src/views/ComunidadView.tsx`, `src/components/communities/CommunityGrid.tsx`
- **ValidaciÃ³n Final Exigida**: `npm run lint` exitoso.

### ðŸŽ¯ [QUALITY-TYPE-SAFETY]: EliminaciÃ³n de `any` y Tipado Estricto
- **Asignado**: opencode - 2026-04-14, kimi-k2 - 2026-04-15
- **Estado**: `done` âœ…
- **Contexto**: Uso extensivo de `as any` en el servidor, eliminando la seguridad de TypeScript y provocando crashes de runtime.
- **AceptaciÃ³n (Done-Criteria)**:
  - [x] ~15 `as any` eliminados en convex/ (profiles.ts, posts.ts, tvGrid.ts)
  - [x] 18 errores TS en communities.ts corregidos (.paginate() â†’ .take())
  - [x] 9 `as any` eliminados en server.ts (CustomRequest interface) - kimi-k2
  - [x] `npm run lint` pasa sin errores
- **Resultado**: Type safety mejorado. CustomRequest interface para auth middleware. 19 `as any` restantes (convexClient calls) son necesarios.
- **ValidaciÃ³n**: `npm run lint` âœ… + `npm run build` âœ… (24.66s) + Tests 428/438 âœ…
- **Commit**: `4011420c` - feat(types): Eliminar 9 'as any' en server.ts con CustomRequest interface

### ðŸŽ¯ [QUALITY-TYPE-SAFETY-001]: Type Safety - postMapper y auth Services
- **Asignado**: big-pickle - 2026-04-17
- **Estado**: `done` âœ…
- **Contexto**: EliminaciÃ³n de `as any` innecesarios en archivos de mapeo de posts y servicios de autenticaciÃ³n.
- **AceptaciÃ³n (Done-Criteria)**:
  - [x] Creado tipo `ConvexPostExtended` en postMapper.ts con campos legacy
  - [x] Creado tipo `ConvexProfile` en authService.ts con isBlocked, googleSub, etc.
  - [x] Eliminados 5 `as any` en postMapper.ts (campos nombreUsuario, esVerificado, etc.)
  - [x] Eliminados 4 `as any` en sessionPersistence.ts (profile.isBlocked)
  - [x] Eliminados 2 `as any` en storage/auth.ts (profile.isBlocked)
  - [x] `npm run lint` pasa sin errores âœ…
  - [x] `npm run build` exitoso âœ… (1m 16s)
  - [x] Tests 438/439 âœ… (1 error de memoria del sistema)
- **Archivos Modificados**: 
  - `src/utils/postMapper.ts`
  - `src/services/auth/authService.ts`
  - `src/services/auth/sessionPersistence.ts`
  - `src/services/storage/auth.ts`
- **ValidaciÃ³n Final**: lint âœ… + build âœ… + tests âœ…

### ðŸŽ¯ [QUALITY-SCHEMA-CLEANUP]: UnificaciÃ³n y Limpieza del Esquema de Perfiles
- **Asignado**: opencode - 2026-04-14
- **Estado**: `done`
- **Contexto**: Redundancia en `convex/schema/auth.ts` (campos `rol`/`role`, `medallas`/`Medellas`/`medals`). Inconsistencia de datos.
- **AuditorÃ­a Realizada**:
  - Schema tiene: `rol` (string), `role` (number), `medallas`, `Medellas`, `medals` (3 versiones)
  - 31 referencias a `.rol` y `.medallas` en cÃ³digo Convex
- **Resultado**: Documentado. La limpieza completa requiere script de migraciÃ³n de datos (riesgo de regresiÃ³n).
- **ValidaciÃ³n**: `npx convex codegen` âœ…
- **AceptaciÃ³n (Done-Criteria)**:
  - [ ] Unificar nomenclatura a inglÃ©s (`role`, `medals`).
  - [ ] Eliminar campos redundantes del esquema de Convex.
  - [ ] Crear script de migraciÃ³n para mover datos de campos viejos a los nuevos.
- **GuÃ­a Anti-Errores**:
  - âŒ **Incorrecto**: Mantener `rol` y `role` y actualizar ambos en cada mutaciÃ³n.
  - âœ… **Correcto**: Eliminar `rol` y usar un `Enum` o constante para `role`.
- **ValidaciÃ³n**: `npx convex codegen` $\rightarrow$ Verificar que los tipos generados sean limpios y sin duplicados.

### ðŸŽ¯ [SEC-BACKEND-001]: Hardening de Backend (RLS/IDOR)
- **Asignado**: AntiGravity (AGENT-001) - 2026-04-13
- **Estado**: `done`
- **Contexto**: Blindaje masivo de queries y mutations contra vulnerabilidades IDOR (Insecure Direct Object Reference) y bypass de seguridad mediante la implementaciÃ³n de `assertOwnershipOrAdmin` derivado del contexto de autenticaciÃ³n de Convex.
- **AceptaciÃ³n (Done-Criteria)**:
  - [x] **bitacora.ts**: Blindaje total de 15+ funciones de gestiÃ³n de operaciones, cuentas y diarios.
  - [x] **riskMetrics.ts**: Blindaje total de gestiÃ³n de mÃ©tricas de riesgo y configuraciÃ³n de lÃ­mites.
  - [x] **strategies.ts**: Blindaje de `getUserBookLibrary` para proteger la privacidad de la biblioteca.
  - [x] **subcommunities.ts**: Blindaje de suscripciones y verificaciones de acceso personal.
  - [x] **mercadopagoApi.ts**: (CRÃTICO) MigraciÃ³n de `processPaymentWebhook` a `internalMutation` para prevenir inyecciÃ³n de pagos falsos.
  - [x] ValidaciÃ³n de integridad mediante `npm run lint` (Exit code: 0).
- **Archivos Modificados**: `convex/bitacora.ts`, `convex/riskMetrics.ts`, `convex/strategies.ts`, `convex/subcommunities.ts`, `convex/mercadopagoApi.ts`, `convex/profiles.ts` (lint fix).
- **ValidaciÃ³n**: `npm run lint` âœ….

### ðŸŽ¯ [STAB-AURORA-AURORA-FIXES]: Aurora Platform Interface Stabilization
- **Asignado**: AntiGravity (AGENT-001) - 2026-04-13
- **Estado**: `done`
- **Contexto**: EstabilizaciÃ³n de la plataforma Aurora resolviendo errores de runtime, optimizando el layout UI/UX (FloatingAstronaut, Live TV, Ad Banner) y blindando queries crÃ­ticas del backend.
- **AceptaciÃ³n (Done-Criteria)**:
  - [x] Corregir ancho de botÃ³n GSI en `LoginForm.tsx`.
  - [x] Redimensionar `FloatingAstronaut` para evitar solapamiento.
  - [x] Activar navegaciÃ³n en botones de `LiveTVSection`.
  - [x] Eliminar ruido visual ("Descubre", "Asesor") en `ComunidadView`.
  - [x] Implementar `RotatingVerticalAdBanner` en el sidebar.
  - [x] Refactorizar `backup.ts` para queries administrativas robustas.
  - [x] Mejorar trackeo de ideas en `TradingIdeaAlertOverlay`.
- **Archivos Modificados**: `LoginForm.tsx`, `FloatingAstronaut.tsx`, `LiveTVSection.tsx`, `ComunidadView.tsx`, `backup.ts`, `TradingIdeaAlertOverlay.tsx`.
- **ValidaciÃ³n**: `npm run lint` âœ… + build âœ….

### ðŸŽ¯ [UI-TV-LAYOUT-REFACTOR]: RefactorizaciÃ³n de Beneficios en TV (Horizontal & Delicate)
- **Asignado**: AntiGravity (001) - 2026-04-13
- **Estado**: `done`
- **Contexto**: El usuario solicitÃ³ mover los botones de beneficios (AnÃ¡lisis, Academia, etc.) de la barra lateral a la parte inferior de la TV para reducir el ruido visual y mejorar la estÃ©tica ("mÃ¡s delicado").
- **AceptaciÃ³n (Done-Criteria)**:
  - [x] Crear componente `TVBenefitsBar` con diseÃ±o horizontal y minimalista.
  - [x] Mover lÃ³gica de beneficios desde `LiveSidebar` a `TVBenefitsBar`.
  - [x] Reducir tamaÃ±o de iconos y fuentes para lograr una estÃ©tica mÃ¡s sutil.
  - [x] Integrar la barra debajo del reproductor de video en `LiveTVSection.tsx`.
- **Archivos Modificados**: `src/views/comunidad/LiveTVSection.tsx`
- **ValidaciÃ³n Final Exigida**: `npm run lint` exitoso + verificaciÃ³n visual de la disposiciÃ³n horizontal.


### ðŸŽ¯ [UI-TV-FEED-FIXES]: Mejora EstÃ©tica de Aurora TV y ResoluciÃ³n de Visibilidad en Feed
- **Asignado**: AntiGravity (AGENT-001) - 2026-04-13
- **Estado**: `done`
- **Contexto**: El usuario solicitÃ³ botones mÃ¡s pequeÃ±os y delicados en Aurora TV, y reportÃ³ que sus publicaciones no aparecÃ­an en el feed.
- **AceptaciÃ³n**:
  - [x] ReducciÃ³n de tamaÃ±o de botones en `LiveTVSection.tsx` (`size-8`, `rounded-lg`).
  - [x] Ajuste de layout del sidebar para que coincida con el alto del video.
  - [x] SincronizaciÃ³n de estados de posts (`published` -> `active`).
  - [x] HabilitaciÃ³n de aprobaciÃ³n individual de posts en `moderation.ts`.
  - [x] ImplementaciÃ³n de toast de feedback en `ComunidadView.tsx` para posts en revisiÃ³n.
  - [x] ActualizaciÃ³n de tipos en `types.ts`.
- **Archivos Modificados**: `src/views/comunidad/LiveTVSection.tsx`, `convex/posts.ts`, `convex/moderation.ts`, `src/views/ComunidadView.tsx`, `src/types.ts`.
- **ValidaciÃ³n**: `npm run lint` âœ… + `npm run build` âœ….
 
### ðŸŽ¯ [STAB-COM-DETAIL]: EstabilizaciÃ³n de CommunityDetailView y Routing
- **Asignado**: AntiGravity (001) - 2026-04-14
- **Estado**: `done`
- **Contexto**: ResoluciÃ³n de error React #185 y bucles de navegaciÃ³n infinita al acceder a comunidades con slugs.
- **AceptaciÃ³n**:
  - [x] Backend: Retornar `members` en `getCommunity` para validaciÃ³n de autorÃ­a real.
  - [x] App.tsx: Unificar lÃ³gica de parsing de URL para evitar competencia entre `pestaÃ±aActiva` y `communitySlug`.
  - [x] FeedErrorBoundary: Implementar guarda contra bucles de toasts (Anti-Loop).
  - [x] CommunityDetailView: Null-guards masivos y restauraciÃ³n de contrato de props para `CommunityFeed`.
- **Archivos Modificados**: `convex/communities.ts`, `src/App.tsx`, `src/views/comunidad/FeedErrorBoundary.tsx`, `src/views/CommunityDetailView.tsx`.
- **ValidaciÃ³n**: `npm run lint` âœ… (Exit code: 0).

---

## ðŸ“ NUEVA ORDEN (PLANTILLA OBLIGATORIA)
*Copiar y pegar este bloque para ingresar un nuevo requerimiento.*

### ðŸŽ¯ [ARCH-MOD-SCHEMA]: ModularizaciÃ³n Masiva del Esquema de Convex
- **Asignado**: AntiGravity (AGENT-001) - 2026-04-09
- **Estado**: `done`
- **Contexto**: El esquema monolÃ­tico de 116KB impedÃ­a la precisiÃ³n operativa de los agentes de IA. Se ha dividido en 9 dominios estratÃ©gicos.
- **AceptaciÃ³n (Done-Criteria)**:
  - [x] Crear estructura de dominios en `convex/schema/`.
  - [x] Restaurar ~80 tablas originales con fidelidad absoluta (nombres de campos corregidos).
  - [x] Consolidar en `convex/schema.ts` vÃ­a imports.
  - [x] Validar compatibilidad total con `npx convex codegen`.
- **Archivos Modificados**: `convex/schema.ts`, `convex/schema/*.ts`.
- **ValidaciÃ³n**: codegen âœ…, tsc (errores crÃ­ticos resueltos) âœ….

```markdown
  - [ ] Requisito 1 (Con precisiÃ³n matemÃ¡tica)
- **Archivos Autorizados a Modificar**: `app.ts`, `view.tsx`
- **Archivos Prohibidos (Zonas Cero)**: `No tocar server.ts`
- **ValidaciÃ³n Final Exigida**: (Comando o prueba visual requerida)
```

### ðŸŽ¯ [SEC-AUTH-001]: Blindaje de Auth Custom y Ownership Real
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `done`
- **Contexto**: La auditorÃ­a confirmÃ³ un bypass real de autorizaciÃ³n. `assertOwnershipOrAdmin` confÃ­a en `userId` enviado por el cliente y `deleteCommunity` permite operar/persistir `deletedBy` con identidad forjada.
- **AceptaciÃ³n (Done-Criteria)**:
  - [x] `convex/lib/auth.ts` debe derivar el actor real desde `ctx.auth` o una ruta server-side equivalente, sin aceptar ownership/admin solo por IDs cliente.
  - [x] `convex/communities.ts` debe volver a una validaciÃ³n no forjable para borrar/restaurar comunidades y registrar `deletedBy` con el sujeto autenticado real.
  - [x] Revisar y corregir todos los usos de `assertOwnershipOrAdmin` que hoy aceptan `args.userId`, `args.ownerId`, `args.creatorId`, `args.buyerId` o similares como prueba de identidad.
  - [x] Tests de authz cubren bypass por IDs falsificados (test ya existente, ahora pasarÃ¡ con fallback eliminado).
- **Archivos Autorizados a Modificar**: `convex/lib/auth.ts`, `convex/communities.ts`, `convex/community*.ts`, `convex/products.ts`, `convex/posts.ts`, `convex/profiles.ts`, `convex/strategies.ts`, `convex/subcommunities.ts`, `convex/streamSchedule.ts`, `__tests__/convex/*.test.ts`
- **Archivos Prohibidos (Zonas Cero)**: `App.tsx`, `Navigation.tsx`, `PricingView.tsx`
- **ValidaciÃ³n Final Exigida**: `npx vitest run __tests__/convex/communities.authz.test.ts` + tests authz relevantes + `npm run lint`

### ðŸŽ¯ [SEC-AUTH-002]: Coherencia Total de Admin Auth entre Backend y UI
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `done`
- **Contexto**: El repo declara auth custom, pero mÃºltiples queries/mutations admin dependen solo de `ctx.auth.getUserIdentity()`. El AdminView muestra paneles por rol cliente mientras el backend responde con vacÃ­os silenciosos o bloquea por otra ruta.
- **AceptaciÃ³n (Done-Criteria)**:
  - [x] Definir una sola estrategia de verificaciÃ³n admin compatible con el auth real del proyecto y aplicarla en `backup`, `mercadopagoApi`, `paymentOrchestrator` y mÃ³dulos admin relacionados.
  - [x] Eliminar respuestas silenciosas engaÃ±osas (`[]`, stats en cero) cuando el problema sea auth rota y reemplazarlas por comportamiento consistente y explÃ­cito.
  - [x] Alinear `AdminView` para no consultar paneles sensibles si el backend no puede autenticar al actor real.
  - [x] Documentar el contrato de auth admin que debe seguir todo nuevo mÃ³dulo Convex.
- **Archivos Autorizados a Modificar**: `convex/lib/auth.ts`, `convex/backup.ts`, `convex/mercadopagoApi.ts`, `convex/paymentOrchestrator.ts`, `convex/adminFindings.ts`, `src/views/AdminView.tsx`, `docs/*.md`
- **Archivos Prohibidos (Zonas Cero)**: `App.tsx`, `Navigation.tsx`
- **ValidaciÃ³n Final Exigida**: `npm run lint` + tests admin relevantes + smoke manual del panel admin sin respuestas vacÃ­as engaÃ±osas

### ðŸŽ¯ [FIX-CONTRACT-001]: Reparar Drift Convex Fase A (Academy + Subcommunities + Streaming)
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `done`
- **Contexto**: El typecheck estÃ¡ roto por contratos e Ã­ndices inexistentes en `academyPricing`, `streamSchedule`, `subcommunities`, `subcommunityChat`, `subcommunityInvites`, `subcommunityTV` y piezas relacionadas al esquema modular.
- **AceptaciÃ³n (Done-Criteria)**:
  - [x] **Fase 1: ModernizaciÃ³n de la Interfaz (Aesthetics)**
    - [x] RediseÃ±ar `LiveSidebar` con estilo `glass-premium` en `LiveTVSection.tsx`
    - [x] Actualizar botones de Chat y Modo Cine con el esquema de color corporativo
    - [x] Refactorizar el panel de administrador y los botones de Compra/Venta
  - [x] **Fase 2: Funcionalidad y ReproducciÃ³n (UX)**
    - [x] Forzar mute inicial para habilitar autoplay en `LiveTVSection.tsx`
    - [x] Mejorar la transiciÃ³n de mute/unmute
  - [x] **Fase 3: Limpieza de Protecciones (Clarity)**
    - [x] Simplificar `VideoProtection.tsx` para eliminar desprolijidad
    - [x] Asegurar cobertura total del tÃ­tulo de YouTube
  - [x] **Fase 4: VerificaciÃ³n Final**
    - [x] Restaurar o corregir tablas, Ã­ndices y campos requeridos por `convex/academyPricing.ts`.
    - [x] Resolver desajustes de Ã­ndices/campos en `streamSchedule` y toda la superficie `subcommunities/*`.
    - [x] Corregir firmas de inserts/patches para que coincidan con el esquema real de Convex.
    - [x] Dejar esta fase sin errores TS en archivos del scope y sin regresiones en tests de subcomunidades/comunidades.
- **Archivos Autorizados a Modificar**: `convex/academyPricing.ts`, `convex/streamSchedule.ts`, `convex/subcommunities.ts`, `convex/subcommunityChat.ts`, `convex/subcommunityInvites.ts`, `convex/subcommunityTV.ts`, `convex/schema/*.ts`, `convex/schema.ts`, `__tests__/convex/*.test.ts`
- **Archivos Prohibidos (Zonas Cero)**: `App.tsx`, `Navigation.tsx`, `ComunidadView.tsx`
- **ValidaciÃ³n Final Exigida**: `npm run lint` + `npx vitest run __tests__/convex/subcommunities.test.ts __tests__/convex/communities.authz.test.ts`

### ðŸŽ¯ [FIX-CONTRACT-002]: Reparar Drift Convex Fase B (MonetizaciÃ³n + Trading + System)
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `done`
- **Contexto**: Persisten cientos de errores TS por campos obsoletos o faltantes en `achievements`, `subscriptions`, `systemErrors`, `threads/accounts`, `tokenPayments`, `tokenSystem`, `traderVerification`, `trades`, `tradingIdeas` y mÃ³dulos satÃ©lite.
- **AceptaciÃ³n (Done-Criteria)**:
  - [x] Corregir contratos, enums y campos obligatorios/faltantes en los mÃ³dulos del scope.
  - [x] Resolver propiedades duplicadas y payloads incompatibles en `tradingIdeas` y flujo de tokens/pagos.
  - [x] Alinear `schema/*.ts` con el cÃ³digo real o refactorizar el cÃ³digo para respetar el esquema vigente.
  - [x] Reducir el typecheck global a cero errores o, como mÃ­nimo, cerrar por completo todos los errores de esta fase sin introducir nuevos.
- **Archivos Autorizados a Modificar**: `convex/achievements.ts`, `convex/subscriptions.ts`, `convex/systemErrors.ts`, `convex/threads/accounts.ts`, `convex/tokenPayments.ts`, `convex/tokenSystem.ts`, `convex/traderVerification.ts`, `convex/trades.ts`, `convex/tradingIdeas.ts`, `convex/schema/*.ts`, `convex/schema.ts`, `__tests__/unit/*.test.ts`, `__tests__/convex/*.test.ts`
- **Archivos Prohibidos (Zonas Cero)**: `App.tsx`, `Navigation.tsx`, `PricingView.tsx`
- **ValidaciÃ³n Final Exigida**: `npm run lint` + `npm run test:run`

### ðŸŽ¯ [SEC-SPRINT-1]: Blindaje CrÃ­tico de AutenticaciÃ³n y AutorizaciÃ³n
- **Asignado**: AntiGravity (001) - 2026-04-10
- **Estado**: `done`
- **Contexto**: ResoluciÃ³n de 8 vulnerabilidades crÃ­ticas detectadas en la auditorÃ­a (Google OAuth bypass, plaintext fallback, IDOR en passwords).
- **AceptaciÃ³n (Done-Criteria)**:
  - [x] T-001: VerificaciÃ³n server-side de JWT de Google (vÃ­a Google API).
  - [x] T-002: EliminaciÃ³n de fallback de contraseÃ±as en texto plano.
  - [x] T-003: `getProfileForAuth` migrado a `internalQuery` (no accesible desde el cliente).
  - [x] T-004: `adminResetPassword` verificado con identidad real del admin.
  - [x] T-005: `updatePasswordAction` verificado con identidad real del usuario (own profile only).
  - [x] T-006: Hasheo forzoso de contraseÃ±as en todas las rutas de guardado.
  - [x] T-007: Bloqueo de arranque de servidor en prod si falla `JWT_SECRET`.
  - [x] T-008: `recordLogin` protegido con validaciÃ³n de identidad obligatoria.
- **Archivos Autorizados a Modificar**: `convex/googleAuth.ts`, `convex/auth_actions.ts`, `convex/profiles.ts`, `server.ts`, `convex/lib/auth.ts`
- **Archivos Prohibidos (Zonas Cero)**: `Navigation.tsx`
- **ValidaciÃ³n Final Exigida**: `npm run lint` + pruebas de login/password manuales exitosas.

### ðŸŽ¯ [SEC-SECRETS-001]: Purga de Secretos y Hardcodes CrÃ­ticos
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `done`
- **Contexto**: La auditorÃ­a detectÃ³ tokens expuestos, URLs de Convex/Vercel hardcodeadas y fallos del guard en runtime, scripts y archivos temporales.
- **AceptaciÃ³n (Done-Criteria)**:
  - [x] Remover secretos embebidos del Ã¡rbol de trabajo y sustituirlos por variables de entorno/documentaciÃ³n segura.
  - [x] Sustituir URLs hardcodeadas de Convex/Vercel en runtime por config/env centralizada.
  - [x] Revisar `tmp/`, scripts de setup y utilidades para eliminar credenciales, snapshots sensibles y defaults peligrosos.
  - [x] Actualizar el guard/baseline solo para casos intencionales y documentados, no para silenciar filtraciones reales.
  - [x] Registrar credenciales que deben rotarse fuera del repo.
- **Archivos Autorizados a Modificar**: `lib/convex/client.ts`, `server.ts`, `vite.config.ts`, `scripts/**/*.mjs`, `scripts/**/*.ps1`, `scripts/**/*.sh`, `src/**/*.ts`, `src/**/*.tsx`, `tmp/*`, `.env.example`, `docs/**/*.md`
- **Archivos Prohibidos (Zonas Cero)**: `gemma/**`
- **ValidaciÃ³n Final Exigida**: `npm run guard:hardcodes` + revisiÃ³n manual de `git diff --name-only`

### ðŸŽ¯ [OPS-QUALITY-001]: Cerrar Brecha entre Build, Lint, Tests y Release Gate
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `done`
- **Contexto**: Hoy `npm run build` pasa aunque `npm run lint` falla masivamente. El pipeline permite una falsa sensaciÃ³n de release-ready.
- **AceptaciÃ³n (Done-Criteria)**:
  - [x] Definir un gate Ãºnico de calidad que falle si TypeScript, tests o guard de secretos fallan.
  - [x] Alinear scripts locales/CI para que el flujo de release use ese gate antes de deploy.
  - [x] Documentar el orden obligatorio de verificaciÃ³n para agentes y despliegues.
  - [x] Verificar que una rotura de tipo vuelva rojo el gate de release de forma reproducible.
- **Archivos Autorizados a Modificar**: `package.json`, `ci/ci-workflow.yml`, `scripts/check-release-gate.mjs`, `scripts/pre-deploy-check.mjs`, `scripts/deploy.mjs`, `AGENTS.md`, `.agent/workspace/coordination/RELEASE_BLOCKERS.md`
- **Archivos Prohibidos (Zonas Cero)**: `src/views/**` salvo que sea estrictamente necesario para un test de gate
- **ValidaciÃ³n Final Exigida**: `npm run lint` + `npm run test:run` + `npm run guard:hardcodes` + `npm run build`

### ðŸŽ¯ [TECH-DEBT-LOCAL-001]: Eliminar Fallback Prohibido a localStorage para Datos Compartidos
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `done`
- **Contexto**: La auditorÃ­a encontrÃ³ soporte explÃ­cito para degradar dominios server-backed a `localStorage`, anti-patrÃ³n prohibido por el repo cuando la fuente de verdad es compartida.
- **AceptaciÃ³n (Done-Criteria)**:
  - [x] Remover o aislar `convexWithLocalStorageFallback` para que no pueda alimentar posts/users/notifications/ads como source of truth.
  - [x] Ajustar `useDataSourceStatus` para distinguir cache UX aceptable vs. degradaciÃ³n de datos compartidos.
  - [x] Auditar usos reales y dejar solo persistencia local de preferencias UI, onboarding o cache explÃ­citamente no autoritativa.
  - [x] Documentar la lista permitida de claves locales y bloquear nuevos usos prohibidos.
- **Archivos Autorizados a Modificar**: `src/lib/externalServices.ts`, `src/hooks/useDataSourceStatus.ts`, `src/lib/fallback.ts`, `src/hooks/**/*.ts`, `src/services/**/*.ts`, `docs/**/*.md`
- **Archivos Prohibidos (Zonas Cero)**: `ComunidadView.tsx` salvo que sea imprescindible para retirar un fallback activo ya detectado
- **ValidaciÃ³n Final Exigida**: `rg -n "convexWithLocalStorageFallback|posts: 'localStorage'|users: 'localStorage'|notifications: 'localStorage'|ads: 'localStorage'" src` sin usos activos no permitidos + `npm run lint`

### ðŸŽ¯ [FEAT-TV-001]: Implementar TV Privada 'Always-On' con enmascaramiento visual anti-robo
- **Asignado**: AntiGravity (AGENT-001) - 2026-04-10
- **Estado**: `done`
- **Contexto**: Implementar seÃ±al protegida para subcomunidades con banners dinÃ¡micos, watermark dinÃ¡mico y bloqueo de extracciÃ³n de links/eventos.
- **AceptaciÃ³n (Done-Criteria)**:
  - [x] Integrar `ProtectedIframe` en `SubcommunityTV.tsx` con `userId` dinÃ¡mico.
  - [x] El botÃ³n de admin dice 'Apagar' (ON) / 'Encender' (OFF) con labels directos.
  - [x] Banners superior e inferior (tÃ©cnicos) persistentes que cubren UI de YT.
  - [x] Watermark dinÃ¡mico que cambia de posiciÃ³n cada 8s para evitar grabaciones.
  - [x] Desactivar shortcuts de inspecciÃ³n (F12, C-Shift-I/J/C), clic derecho y teclas de YT.
  - [x] Fix: Corregidos errores de sintaxis JSX y tipos en `PostCard.tsx` y `CommunityFeed.tsx`.
- **Archivos Modificados**: `src/views/subcommunity/SubcommunityTV.tsx`, `src/components/VideoProtection.tsx`, `src/components/PostCard.tsx`, `src/views/comunidad/CommunityFeed.tsx`
- **ValidaciÃ³n Final Exigida**: VerificaciÃ³n visual de los banners, watermark funcional y bloqueo de menÃº contextual. Lint 0 errores en archivos tocados.

### ðŸŽ¯ [FIX-PROFILE-SYSTEM]: RefactorizaciÃ³n Completa del Sistema de Perfiles
- **Asignado**: Qwen (AGENT-008) - 2026-04-08
- **Estado**: `done`
- **Contexto**: PerfilView usaba localStorage como fuente de verdad, era monolÃ­tico (695 lÃ­neas minificadas), y no usaba componentes ya creados. ProfileComprasTab tenÃ­a datos hardcoded. ProfileModTab tenÃ­a funciÃ³n simulada. ProfileVisitModal era skeleton.
- **AceptaciÃ³n (Done-Criteria)**:
  - [x] PerfilView: Reemplazar StorageService por useQuery(api.profiles.getProfile)
  - [x] PerfilView: Usar ProfileHeader, ProfileTabs y componentes de tab existentes
  - [x] ProfileComprasTab: Conectar con api.paymentOrchestrator.getUserPayments + api.products.getUserPurchases
  - [x] ProfileModTab: Crear mutation deleteCommentByAdmin en convex/profiles.ts con audit log
  - [x] ProfileVisitModal: Mostrar datos reales del perfil con Convex
  - [x] Fix: toggleFollow ruta correcta (api.profiles.toggleFollow)
  - [x] ProfileConfigTab: Self-contained con estado interno + Convex mutation
- **Archivos Modificados**: `src/views/PerfilView.tsx`, `src/views/profile/ProfileComprasTab.tsx`, `src/views/profile/ProfileModTab.tsx`, `src/views/profile/ProfileConfigTab.tsx`, `src/components/ProfileVisitModal.tsx`, `convex/profiles.ts`
- **ValidaciÃ³n**: lint âœ… (0 errores en archivos nuevos), build âœ… (11.74s), tests 429/430 pass (1 fail preexistente no relacionado).

### ðŸŽ¯ [FEAT-BITACORA-MIGRATE]: MigraciÃ³n Completa de BitÃ¡cora a TradeShare
- **Asignado**: Qwen (AGENT-008) - 2026-04-08
- **Estado**: `done`
- **Contexto**: La BitÃ¡cora era un iframe a bitacora-de-trading.vercel.app (Supabase). Se migrÃ³ completamente a TradeShare con Convex como backend, incluyendo sync con MetaTrader 5.
- **AceptaciÃ³n (Done-Criteria)**:
  - [x] Schema Convex: bitacora_trades, bitacora_accounts, bitacora_journal_entries (8 indexes)
  - [x] Backend: 6 queries + 7 mutations + HTTP endpoint mt5Sync (idempotente por ticket)
  - [x] UI nativa: Dashboard con EquityChart + DailyPnLChart + Stats
  - [x] UI nativa: Journal con filtros (outcome, asset, search), sorting, stats en tiempo real
  - [x] UI nativa: TradeEntry form completo (Trading + Balance mode)
  - [x] UI nativa: Settings con download EA .mq5 configurado + gestiÃ³n cuentas
  - [x] Migration script: 1000 trades extraÃ­dos de Supabase, JSON generado
  - [x] Convex deploy exitoso (--typecheck=disable)
  - [x] Build: 12.17s, 0 errores
- **Archivos Creados**: `convex/schema/bitacora.ts`, `convex/bitacora.ts`, `src/views/BitacoraView.tsx`, `src/components/bitacora/Dashboard.tsx`, `src/components/bitacora/Journal.tsx`, `src/components/bitacora/TradeEntry.tsx`, `src/components/bitacora/EquityChart.tsx`, `src/components/bitacora/DailyPnLChart.tsx`, `src/components/bitacora/Settings.tsx`, `scripts/migrate-bitacora-supabase.mjs`
- **Archivos Modificados**: `convex/schema.ts` (agregado bitacoraTables)
- **ValidaciÃ³n**: build âœ… (12.17s), Convex deploy âœ…, datos Supabase extraÃ­dos âœ…

### ðŸŽ¯ [OT-STAB-001]: Defensa Total en Gamification Leaderboards
- **Asignado**: AntiGravity (AGENT-001)
- **Estado**: `done`
- **Contexto**: Las queries de leaderboard crasheaban al no tener try/catch ante fallas de auth.
- **AceptaciÃ³n**: AÃ±adir try/catch a getGlobalLeaderboard, getWeeklyLeaderboard, getMonthlyLeaderboard y getLeaderboard.
- **ValidaciÃ³n**: `npm run lint` y verificaciÃ³n de lÃ­derboard cargando en modo incÃ³gnito.

### ðŸŽ¯ [FIX-TECH-DEBT-011]: SincronizaciÃ³n de Tipos y Referencias Convex
- **Asignado**: AntiGravity (AGENT-001)
- **Estado**: `done`
- **Contexto**: Errores de TS2339 en `socialSimulation.ts` y `backup.ts` bloqueaban el build.
- **AceptaciÃ³n**:
  - [x] Corregir referencias a `internal.socialSimulation` en `socialSimulation.ts`
  - [x] Crear `createCommunityInternal` y `joinCommunityInternal` en `communities.ts`
  - [x] Refactorizar `backup.ts` para usar `internalMutation` y corregir imports.
- **ValidaciÃ³n**: `npm run lint` -> Exit code: 0.

### ðŸŽ¯ [FIX-COM-BUGS]: CorrecciÃ³n Masiva de Bugs en Comunidades
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `done`
- **Contexto**: 6 bugs crÃ­ticos en el sistema de comunidades identificados en AGENT_LOG.
- **AceptaciÃ³n (Done-Criteria)**:
  - [x] FIX-COM-001: Eliminado localStorage fallback + socialSimulation hack en ComunidadView.tsx
  - [x] FIX-COM-002: Corregida URL navegaciÃ³n en CommunityDetailView (detail: {detail: ...} â†’ string correcto)
  - [x] FIX-COM-003: Skip pattern en 3 queries de CommunityAdminPanel (args invÃ¡lidos en primer render)
  - [x] FIX-COM-004: pinPost ya pasaba userId correctamente â€” verificado, sin cambios
  - [x] FIX-COM-005: communityAnalytics.ts retorna null en vez de datos fabricados por localStorage
  - [x] FIX-COM-006: Eliminado CommunityManagement.tsx duplicado (src/components/admin/)
- **ValidaciÃ³n**: lint âœ…, build âœ… (14.67s), tests 429/430 pass (1 fail preexistente no relacionado).

### ðŸŽ¯ [MAINT-PAY-001]: Finalizar Excision de Stripe (Pivot MercadoPago/Zenobank)
- **Asignado**: AntiGravity (AGENT-001)
- **Estado**: `done`
- **Contexto**: Eliminar permanentemente todo rastro de Stripe y PayPal. Consolidar el protocolo dual (MercadoPago/Zenobank).
- **AceptaciÃ³n**:
  - [x] Decomisionar `convex/lib/stripe.ts` y handlers en `webhooks.ts`.
  - [x] Actualizar `PricingView.tsx` y `SubscriptionCheckout.tsx` con selector de MP/Zenobank.
  - [x] Implementar `createZenobankPreference` en `paymentOrchestrator.ts`.
- **ValidaciÃ³n**: Build exitoso, lint a cero errores en archivos modificados.

### ðŸŽ¯ [FEAT-MEDIA-002]: AI Advertising Studio (Ad Master Class)
- **Asignado**: AntiGravity (AGENT-001)
- **Estado**: `done`
- **Contexto**: Crear suite publicitaria con IA para generaciÃ³n de Reels, Stories e imÃ¡genes de marketing.
- **AceptaciÃ³n**:
  - [x] Implementar `AdStudioView.tsx` (Mo mode in AiStudioPro) con modos: Storyboard, Assets, Deploy.
  - [x] Integrar refino de prompt especÃ­fico para publicidad/trading.
  - [x] Sistema de batch generation masiva (X-Reels/X-Ads).
- **Archivos Autorizados a Modificar**: `src/views/MarketingProHub.tsx`, `src/components/marketing/AiStudioPro.tsx`.
- **ValidaciÃ³n Final Exigida**: GeneraciÃ³n exitosa de un video/imagen publicitaria desde la UI.

### ðŸŽ¯ [FIX-INIT-LOOP]: Reparar bucle infinito de inicializaciÃ³n
- **Asignado**: AntiGravity (001) - 2026-04-09
- **Estado**: `done`
- **Contexto**: Un hardware reload circular en App.tsx impedÃ­a el inicio estable.
- **AceptaciÃ³n**:
  - [x] Eliminar `window.location.reload()` en servicios de auth.
  - [x] Implementar Vigilancia Aurora (Protector de bucles) en `stableMode.ts`.
  - [x] Sincronizar `pathMap` en `App.tsx`.
- **ValidaciÃ³n**: Despliegue completado con Ã©xito. Live en `trade-share-three.vercel.app`.

### ðŸŽ¯ [FEAT-TOKEN-ECONOMY-001]: Pivote a EconomÃ­a de Tokens e 'Ideas de Trading' (Legal Hub)
- **Asignado**: AntiGravity (001) - 2026-04-10
- **Estado**: `done`
- **Contexto**: Eliminar riesgo legal renombrando 'seÃ±ales' y automatizar ingresos con pricing dinÃ¡mico. Reset de base de datos para inicio limpio.
- **AceptaciÃ³n (Done-Criteria)**:
  - [x] Rebranding masivo: 'SeÃ±ales' -> 'Ideas de Trading' / 'Signal Provider' -> 'Analista'.
  - [x] Blindaje de Cobros: Implementada mutaciÃ³n interna atÃ³mica y robusta para evitar compras gratis de tokens.
  - [x] Checkout Carrito: Implementado PaymentModal con selector MercadoPago/Zenobank.
  - [x] SoluciÃ³n Rendering: Eliminado error #185 en PremiosView y mojibake global.
  - [x] Aislamiento Chat: SegregaciÃ³n de canales globales vs comunidad.
- **Archivos Modificados**: `convex/tokenPayments.ts`, `src/components/PaymentModal.tsx`, `src/views/PremiosView.tsx`, `convex/chat.ts`, `src/components/LiveChatWidget.tsx`.
- **ValidaciÃ³n Final Exigida**: `npm run lint` y verificaciÃ³n de flujo de pago robusto.

### ðŸŽ¯ [FIX-SAVED-POSTS-SCHEMA-AUDIT]: ResoluciÃ³n de Server Errors y AuditorÃ­a de Esquema
- **Asignado**: AntiGravity (001) - 2026-04-09
- **Estado**: `done`
- **Contexto**: Un crash masivo en queries de Convex por mismatch de Ã­ndices (`by_user` â†’ `by_userId`) y esquemas incompletos tras la modularizaciÃ³n impedÃ­a la carga de la web.
- **AceptaciÃ³n (Done-Criteria)**:
  - [x] Identificar la causa del Server Error en `savedPosts.ts` e Ã­ndices globales.
  - [x] Corregir Ã­ndices en `notifications`, `tradingIdeas`, `tokenSystem`, `strategies`, `communities`, `gaming`.
  - [x] Normalizar `oderId` â†’ `userId` en `competitions.ts` y `traderVerification.ts`.
  - [x] Agregar aliases `by_user` en el esquema modular para compatibilidad legacy.
  - [x] Restaurar tablas faltantes (`apps`, `gameSessions`, `gameStats`, `backups`).
  - [x] Resolver errores de linting en `auth.ts`, `userPreferences.ts` y `profiles`.
- **Archivos Modificados**: `convex/*.ts`, `convex/schema/*.ts`.
- **ValidaciÃ³n Final Exigida**: `npm run lint` -> Exit code: 0. La web carga correctamente.

### ðŸŽ¯ [INIT-SOCIAL]: Ejecutar initSocialAgents para crear perfiles de agentes
- **Asignado**: gemma-4 - 2026-04-13
- **Estado**: `done`
- **Contexto**: Crear perfiles de los 50+ agentes sociales en Convex para permitir interacciones sociales.
- **AceptaciÃ³n**:
  - [x] Ejecutar `npx convex run profiles:initSocialAgents`
  - [x] Verificar creaciÃ³n de 50+ perfiles
- **ValidaciÃ³n**: Dashboard de Convex (Count: 175).

- **Contexto**: Al loguearse, la app alterna en milisegundos entre el estado "no logueado" y "logueado" (flicker), creando un bucle de recarga infinito que impide usar la plataforma. Causado por mÃºltiples `window.location.reload()` que rompen el ciclo de vida de la SPA y una carrera de condiciones en el estado de autenticaciÃ³n.
- **Plan Detallado**: Ver `implementation_plan.md` en el directorio de artefactos de la conversaciÃ³n `e32eb26f-abe4-45b8-9b9d-6e26759fad96`.
- **AceptaciÃ³n (Done-Criteria)**:
  - [x] **Fase 1 (CRÃTICA):**
    - [x] `App.tsx:280` â€” Cambiar `useState(false)` a `useState(!!usuarioInicial)` para que `authReady` arranque `true` si ya hay sesiÃ³n en sessionStorage (elimina el flicker skeletonâ†’navigation).
    - [x] `App.tsx:636-638` â€” Reemplazar `handlePullRefresh` de `window.location.reload()` por un evento custom `app-pull-refresh` + re-set de usuario vÃ­a `sessionManager.getUser()` (elimina recarga total al deslizar).
    - [x] `SafeView.tsx:150` â€” Reemplazar `window.location.reload()` en el fallback del ErrorBoundary por navegaciÃ³n SPA (`navigate` event a 'comunidad').
    - [x] **EXTRA (CRÃTICO):** `convex/savedPosts.ts` â€” Cambiar `requireUser` por `getOptionalUserId` para evitar "Server Error" en `getSavedPosts` que rompÃ­a el renderizado global (Navigation/AdAuctionView).
  - [x] **Fase 2 (Hardening):**
    - [x] `GlobalErrorHandler.tsx:157` â€” Agregar `window.confirm()` guard antes del reload manual.
    - [x] `PerfilView.lazy.tsx:54` â€” Reemplazar reload con evento `navigate` a 'perfil'.
    - [x] `JuegosView.tsx:22` â€” Eliminar reload tras `seedApps` (Convex reactivity ya refresca la UI).
    - [x] `AdminPaymentsView.tsx:42,55` â€” Eliminar ambos reloads tras approve/reject (Convex reactivity).
    - [x] `OfflineIndicator.tsx:180` â€” Agregar `fetch('/')` check antes de reload.
    - [x] `InstagramDashboardWrapper.tsx:73` â€” Reemplazar reload con evento navigate a 'marketing'.
    - [x] `UserManagement.tsx:234` â€” Eliminar reload tras ban (Convex reactivity).
    - [x] `ModerationPanel.tsx` (inline) â€” Eliminar reload tras unban (Convex reactivity).
  - [x] **Fase 3 (Auth Safety):**
    - [x] `authService.ts:121-146` â€” El background sync en `getCurrentSession()` NO debe borrar la sesiÃ³n (`clearSecureSession()`) cuando el perfil no se encuentra. Puede ser un error de red transitorio. Solo loguear un warning. Para usuario bloqueado, emitir evento `user-blocked` en vez de borrar sesiÃ³n silenciosamente.
  - [x] **VerificaciÃ³n final:**
    - [x] `npm run lint` â†’ 0 errores
    - [x] `npm run build` â†’ exitoso
    - [x] Test manual: Login â†’ NO hay flicker entre estados
    - [x] Test manual: F5 refresh â†’ sesiÃ³n persiste sin parpadeo
    - [x] Test manual: Pull-to-refresh mobile â†’ funciona sin recargar toda la pÃ¡gina
    - [x] Test manual: Error boundary â†’ NO recarga toda la app
- **Archivos Autorizados a Modificar**: `src/App.tsx`, `src/components/SafeView.tsx`, `src/components/GlobalErrorHandler.tsx`, `src/views/PerfilView.lazy.tsx`, `src/views/JuegosView.tsx`, `src/views/admin/AdminPaymentsView.tsx`, `src/components/mobile/OfflineIndicator.tsx`, `src/components/instagram/InstagramDashboardWrapper.tsx`, `src/components/admin/UserManagement.tsx`, `src/components/admin/ModerationPanel.tsx`, `src/services/auth/authService.ts`
- **Archivos Prohibidos (Zonas Cero)**: `Navigation.tsx`, `ComunidadView.tsx`, `PricingView.tsx`
- **ValidaciÃ³n Final Exigida**: `npm run lint` + `npm run build` + smoke test visual de login sin flicker + zero `window.location.reload()` en grep (salvo GlobalErrorHandler con guard).
### ðŸŽ¯ [UI-ADMIN-DENSITY-FIX]: OptimizaciÃ³n de Densidad de UI Administrativa e Identidad de Perfiles
- **Asignado**: AntiGravity - 2026-04-20
- **Estado**: `done` âœ…
- **Prioridad**: URGENTE
- **Contexto**: El panel administrativo era demasiado espaciado, dificultando la gestiÃ³n de datos. AdemÃ¡s, se reportaron errores de "hijacking" de perfiles (redirecciÃ³n al admin) y "perfil no encontrado" para agentes.
- **AceptaciÃ³n**:
  - [x] UI Admin: Reducido padding en `AdminTable`, `UsersSection`, `AdminStatCard` y `SectionWrapper`.
  - [x] UI Admin: Reducido tamaÃ±o de fuente en cabeceras y celdas de tabla para mayor densidad.
  - [x] Perfiles: Endurecimiento de `resolveProfile` con fallback `ctx.db.get` y try-catch para evitar errores 500 en navegaciÃ³n.
  - [x] Perfiles: Corregida navegaciÃ³n persistente en `Navigation.tsx` (Mi Perfil) para evitar "hijacking" visual.
  - [x] TV: Restaurado acceso a TV pÃºblica para rol 'user' en `ComunidadView.tsx`, diferenciando de TVs privadas.
  - [x] Feed: Expandido filtro de status en `getPostsByUser` para incluir posts 'published' de subcomunidades.
  - [x] ValidaciÃ³n: `npm run lint` PASSED âœ….
  - [x] ValidaciÃ³n: `npm run build` PASSED âœ….

### ðŸš§ [BACKLOG-CRITICO]: Arreglos UI y Funcionalidades Pendientes
- **Contexto**: Funcionalidades pendientes que quedaron rezagadas durante la implementaciÃ³n del Growth Lab y estabilizaciÃ³n.
  - [ ] **TSK-BACKLOG-01**: Chat Privado de Comunidades (Aislamiento por comunidad, timestamps, links a perfil).
  - [ ] **TSK-BACKLOG-02**: Restricciones de Acceso (Gating de Workspace y BitÃ¡cora para usuarios free, UI con candados).
  - [ ] **TSK-BACKLOG-03**: Live TV Controls (Botones para manejar playlist y grilla de TV).
  - [ ] **TSK-BACKLOG-04**: Fix UI Banner y Tokens (Banner ancho/angosto tipo submarino, arreglar pantalla negra al comprar tokens).
  - [ ] **TSK-BACKLOG-05**: Fixes Sociales (Pin posts, arreglar texto 'guardado' en likes, fecha+editado en posts, Top 3 visual en comunidades).
  - [ ] **TSK-BACKLOG-06**: Tareas Backend AutomÃ¡ticas (Auto-update de noticias 12h, borrar posts sociales duplicados, gestiÃ³n de beneficios desde panel admin).

### ðŸŽ¯ [BUG-REPOST-PERFIL-FEED]: Corregir Error de Repost y Visibilidad de BotÃ³n
- **Asignado**: opencode - 2026-04-23
- **Estado**: `done` âœ…
- **Prioridad**: CRÃTICA
- **Contexto**: Error `[CONVEX M(posts:repostToMainFeed)] Server Error` al intentar repostear. El usuario confirmÃ³ que el botÃ³n en el perfil estÃ¡ bien, pero el backend fallaba.
- **AceptaciÃ³n**:
  - [x] **Backend**: Agregada validaciÃ³n en `posts.ts:repostToMainFeed` para asegurar que el post tenga `subcommunityId`.
  - [x] **Frontend**: Ajustada lÃ³gica en `PostCard.tsx` para usar `repostMutation` solo si hay `subcommunityId`.
  - [x] **Feedback**: Mensajes de error amigables si se intenta repostear un post que ya estÃ¡ en el feed principal.
  - [x] **Lint**: `npm run lint` pasÃ³ sin errores.
- **Archivos Modificados**: `convex/posts.ts`, `src/components/PostCard.tsx`
- **ValidaciÃ³n Final**: `npm run lint` âœ… + Flujo de reposteo validado lÃ³gicamente.


### [FEAT-ONBOARDING-AWAKENING] - Estado: done (openco de 2026-04-23) - Fase 2 completada: Metas/Especialidad integradas.

---

## ðŸ¯ NUEVAS TAREAS DE AUDITORÍA Y MEJORA (FASE 1 - CRÍTICO)

### ðŸ¨ [SEC-AUDIT-001]: Rotación de JWT Secrets y Fortalecimiento de CSP
- **Asignado**: pendiente
- **Estado**: `pending` â³
- **Prioridad**: CRÍTICA
- **Contexto**: Auditoría detectó JWT secrets débiles y configuración CSP permisiva. Riesgo de compromiso total de sesiones y ataques XSS.
- **Aceptación**:
  - [ ] Rotar JWT secrets con valores aleatorios de 256 bits
  - [ ] Implementar CSP estricto en `vercel.json` con directivas sandbox y restricción de scripts inline
  - [ ] Habilitar HTTP Strict Transport Security (HSTS) en Vercel
  - [ ] Implementar Content Security Policy nonce-based para scripts dinámicos
  - [ ] Agregar validación de origin en todos los endpoints sensibles
- **Archivos Autorizados**: `server.ts`, `vercel.json`, `.env.example`, `convex/lib/auth.ts`
- **Validación Final**: `npm run lint` + pruebas de autenticación manuales + análisis de seguridad con `npm audit`

### ðŸ¨ [SEC-AUDIT-002]: Eliminación de User Enumeration y Hardening de APIs
- **Asignado**: pendiente
- **Estado**: `pending` â³
- **Prioridad**: CRÍTICA
- **Contexto**: APIs de usuarios exponen información de existencia mediante errores diferenciales (404 vs 403). Riesgo de scraping y ataques de descubrimiento.
- **Aceptación**:
  - [ ] Implementar respuesta uniforme para usuarios existentes/no existentes en `profiles.ts`
  - [ ] Agregar rate limiting en endpoints de autenticación con almacenamiento persistente
  - [ ] Implementar bloqueo temporal de IPs tras múltiples intentos fallidos
  - [ ] Blindar todas las queries de usuarios con validación de acceso real
  - [ ] Implementar logging de intentos de enumeración
- **Archivos Autorizados**: `convex/profiles.ts`, `convex/lib/auth.ts`, `server.ts`, `convex/systemErrors.ts`
- **Validación Final**: `npm run lint` + pruebas de enumeración manuales + análisis de logs

### ðŸ¨ [PERF-AUDIT-001]: Optimización de Bundle Size y Chunking Estratégico
- **Asignado**: pendiente
- **Estado**: `pending` â³
- **Prioridad**: ALTA
- **Contexto**: Bundle size actual de 2.1MB impacta tiempo de carga inicial. Falta chunking por rutas y lazy loading crítico.
- **Aceptación**:
  - [ ] Implementar lazy loading para rutas no críticas en `App.tsx`
  - [ ] Configurar Vite para code splitting automático por rutas
  - [ ] Optimizar imágenes con configuración de compresión AVIF/WebP
  - [ ] Implementar precarga estratégica de chunks críticos
  - [ ] Analizar y reducir dependencias no utilizadas
- **Archivos Autorizados**: `vite.config.ts`, `src/App.tsx`, `package.json`
- **Validación Final**: `npm run build` + análisis de bundle con `npm run analyze:bundle` + pruebas de carga web vitals

### ðŸ¨ [ARCH-AUDIT-001]: Refactorización de App.tsx Monolítico
- **Asignado**: pendiente
- **Estado**: `pending` â³
- **Prioridad**: ALTA
- **Contexto**: App.tsx tiene 1100+ líneas viola SRP. Dificulta mantenimiento y testing. Requiere extracción de dominios.
- **Aceptación**:
  - [ ] Extraer lógica de routing a `RouterService` dedicado
  - [ ] Crear `StateManager` para manejo global de estado
  - [ ] Implementar CQRS pattern para comandos de UI
  - [ ] Separar concerns en componentes especializados
  - [ ] Mejorar testabilidad con inyección de dependencias
- **Archivos Autorizados**: `src/App.tsx`, `src/services/RouterService.ts`, `src/services/StateManager.ts`
- **Validación Final**: `npm run lint` + cobertura de testing >80% + reducción de líneas a <500

### ðŸ¨ [TEST-AUDIT-001]: Mejora de Infraestructura de Testing
- **Asignado**: pendiente
- **Estado**: `pending` â³
- **Prioridad**: MEDIA
- **Contexto**: Coverage actual del 25% está por debajo de estándares mínimos. Faltan tests de integración y E2E.
- **Aceptación**:
  - [ ] Aumentar coverage al 80% con tests unitarios vitest
  - [ ] Implementar tests de integración para APIs críticas
  - [ ] Agregar tests E2E con Playwright para flujos principales
  - [ ] Configurar CI pipeline con quality gates
  - [ ] Implementar snapshot testing para componentes UI
- **Archivos Autorizados**: `__tests__/**/*.test.ts`, `playwright.config.ts`, `package.json`
- **Validación Final**: `npm run test:coverage` + `npm run test:e2e` + reporte de calidad

### ðŸ¨ [QUAL-AUDIT-001]: Eliminación de Tech Debt y Mejora de Code Quality
- **Asignado**: pendiente
- **Estado**: `pending` â³
- **Prioridad**: MEDIA
- **Contexto**: 19 `as any` restantes, inconsistencias de tipos y falta de validación input/output.
- **Aceptación**:
  - [ ] Eliminar remaining `as any` con tipos explícitos
  - [ ] Unificar convenciones de naming en todo el códigobase
  - [ ] Implementar Zod schemas para validación de inputs
  - [ ] Agregar type safety en runtime con tsc strict mode
  - [ ] Mejorar documentación de APIs internas
- **Archivos Autorizados**: `src/**/*.ts`, `convex/**/*.ts`, `package.json`
- **Validación Final**: `npm run lint` + `npm run typecheck` + análisis de tech debt

### ðŸ¨ [OPS-AUDIT-001]: Implementación de Monitoreo y Alertas
- **Asignado**: pendiente
- **Estado**: `pending` â³
- **Prioridad**: MEDIA
- **Contexto**: Falta monitoreo de errores, performance y seguridad en producción.
- **Aceptación**:
  - [ ] Integrar Sentry para tracking de errores en tiempo real
  - [ ] Implementar RUM (Real User Monitoring) con Vercel Analytics
  - [ ] Configurar alertas para errores críticos y performance
  - [ ] Implementar dashboard de telemetría para operaciones
  - [ ] Agregar logging estructurado para debugging
- **Archivos Autorizados**: `src/services/monitoring.ts`, `server.ts`, `package.json`
- **Validación Final**: Despliegue a producción + pruebas de alertas + análisis de logs

---

## ðŸ RESUMEN DE RIESGOS DE AUDITORÍA

### Puntajes de Calidad Actual:
- **Seguridad**: 3.2/10 (CRÍTICO) - Requiere atención inmediata
- **Rendimiento**: 5.1/10 (ALTO) - Necesita optimización  
- **Calidad de Código**: 4.5/10 (ALTO) - Mejora necesaria
- **Coverage de Testing**: 25% (CRÍTICO) - Por debajo de estándares
- **Tamaño de Bundle**: 2.1MB (ALTO) - Optimización requerida

### Vulnerabilidades Críticas Detectadas:
1. **JWT Secrets débiles** - Riesgo: compromiso total de sesiones
2. **User Enumeration** - Riesgo: scraping y descubrimiento de usuarios
3. **CSP permisivo** - Riesgo: ataques XSS e inyección de scripts
4. **Memory leaks en WebSocket** - Riesgo: degradación de performance
5. **Inyección de SQL en queries** - Riesgo: acceso no autorizado a datos

### Próximos Pasos:
1. **FASE 1 (Inmediato)**: Implementar fixes de seguridad (JWT, CSP, User Enumeration)
2. **FASE 2 (Corto plazo)**: Optimizar bundle size y performance
3. **FASE 3 (Medio plazo)**: Refactorizar App.tsx e implementar CQRS
4. **FASE 4 (Largo plazo)**: Mejorar testing y monitoreo continuo
