# Handoffs

Registrar aquí cualquier transferencia de trabajo entre agentes.

## Plantilla

```md
## TASK-ID -> HANDOFF
- De:
- Para:
- Fecha:
- Estado actual:
- Scope:
- Archivos tocados:
- Qué se hizo:
- Qué falta:
- Riesgos:
- Cómo validar:
```

## KIMI-BRIEF -> HANDOFF
- De: CODEX-LEAD
- Para: Equipo TradeShare
- Fecha: 2026-03-27
- Estado actual: Kimi Task Brief automatizado y documentado; INICIO ejecuta la consulta, guarda un archivo y loguea la respuesta.
- Scope: scripts/kimi-task-brief.mjs, scripts/aurora-inicio.mjs, docs/kimi-task-brief.md, .agent/kimi/briefs/
- Archivos tocados: scripts/kimi-task-brief.mjs, scripts/aurora-inicio.mjs, docs/kimi-task-brief.md, .agent/workspace/coordination/AGENT_LOG.md
- Qué se hizo: Se implementó el script para consultar a Kimi antes de tocar tareas, el protocolo INICIO lo ejecuta automáticamente y deja trazabilidad en AGENT_LOG y archivos en `.agent/kimi/briefs`.
- Qué falta: Revisar el contenido de cada brief generado y utilizarlo como plano antes de editar; mantener actualizada la clave `NVIDIA_API_KEY` y la conectividad.
- Riesgos: Kimi necesita acceso a internet/NVIDIA_API_KEY; si falla la llamada deben revisarse logs y ejecutar el script manualmente antes de editar.
- Cómo validar: Ejecutar `node scripts/aurora-inicio.mjs` para ver el bloque `--- Kimi brief ---`, abrir `.agent/kimi/briefs/*.md` con la respuesta y confirmar que `AGENT_LOG.md` contiene nuevas entradas `KIMI-BRIEF`.

## AUD-POST-QA-2026-03-27 -> HANDOFF
- De: Codex
- Para: Equipo TradeShare
- Fecha: 2026-03-27
- Estado actual: Auditoría transversal completada; se detectaron superficies marcadas como `done` que siguen con mocks, fallbacks locales o wiring roto hacia Convex.
- Scope: `src/views/InstagramMarketingView.tsx`, `src/views/instagram/InstagramDashboard.tsx`, `server.ts`, `src/views/CreatorDashboard.tsx`, `src/services/analytics/communityAnalytics.ts`, `src/views/AdminView.tsx`, `src/components/admin/AdminPanelDashboard.tsx`, `src/components/admin/SettingsPanel.tsx`, `src/components/admin/BackupPanel.tsx`, `src/components/admin/AuroraSupportSection.tsx`, `src/services/newsService.ts`, `src/hooks/useNews.ts`, `src/services/agents/newsAgentService.ts`, `src/views/SignalsView.tsx`, `src/views/PerfilView.tsx`, `src/views/CreatorView.tsx`, `src/components/CommunityAdminPanel.tsx`, `src/views/MarketplaceView.tsx`
- Archivos tocados: `.agent/workspace/coordination/TASK_BOARD.md`, `.agent/workspace/coordination/CURRENT_FOCUS.md`, `.agent/workspace/coordination/HANDOFFS.md`, `.agent/workspace/coordination/AGENT_LOG.md`
- Qué se hizo:
  - Se contrastó el tablero con el código real y se dejaron tareas TSK-040..048 para cerrar los gaps funcionales.
  - Se verificó que Instagram Marketing usa `mockMedia`, `mockScheduledPosts`, `mockQueue`, handlers `logger.debug` y alertas; además `server.ts` todavía conecta cuentas con `user_placeholder`.
  - Se verificó que `CreatorDashboard` sigue mostrando KPIs y módulos estáticos (`weeklyPosts = 12`, `growthRate = 15.3`, Observatory/Calendar/Distribution demo) y que `communityAnalytics.ts` llama a `api.communityStats.getCommunityStats`, endpoint que no existe en el namespace generado.
  - Se verificó que `AdminView` y paneles admin todavía leen usuarios/posts por `StorageService` y persisten configuración/hallazgos/backup schedule en `localStorage`, por lo que dos navegadores no comparten el mismo estado operativo.
  - Se verificó que noticias sigue con `SAMPLE_NEWS`, `NOTICIAS_MOCK` y `mockAnalysis`, y que `SignalsView` puede quedar completamente apagada en prod vía flag, mostrando un banner de “conexión rota”.
  - Se verificó que `PerfilView` sigue mostrando compras hardcodeadas y que no hay evidencia suficiente en frontend para dar por cumplidos los entregables de micro-cápsulas/Reels/publicación cruzada marcados en Fase 8.
- Qué falta:
  - Ejecutar TSK-040..048 en el orden definido en el tablero.
  - Cerrar primero Instagram, Creator/Admin cloud sync y Signals prod recovery; son los bloques que hoy más degradan percepción de “todo sigue igual”.
- Riesgos:
  - El tablero actual sobrestima cumplimiento: varias tareas `done` no cumplen estándar de producción aunque exista UI bonita.
  - Persistir configuración crítica en `localStorage` mantiene divergencia entre navegadores y genera soporte fantasma.
  - La QA previa no es confiable hasta repetir smoke cross-browser y prod contra Convex desplegado.
- Cómo validar:
  - Instagram: conectar cuenta real, programar post, verlo desde otro navegador y publicar sin mocks.
  - Creator/Admin: abrir dos navegadores y confirmar que settings, hallazgos, stats y posts coinciden sin depender de cache local.
  - Noticias/Signals: cargar prod sin `SAMPLE_NEWS`, `NOTICIAS_MOCK` ni banner de sección deshabilitada.
  - Perfil/Creator público: compras reales visibles y landing pública enlazable con datos de Convex.

## AUD-SURFACES-WAVE2-2026-03-27 -> HANDOFF
- De: Codex
- Para: Equipo TradeShare
- Fecha: 2026-03-27
- Estado actual: Segunda pasada completada sobre `admin`, `perfil`, `marketplace`, `comunidad`, `community-detail`, `discover`, `pricing` y `wallet`; se añadieron subtareas TSK-049..057 para atacar bugs por pantalla y por contrato.
- Scope: `src/views/AdminView.tsx`, `src/components/admin/AdminDashboard.tsx`, `src/components/admin/AdminPanelDashboard.tsx`, `src/components/admin/SettingsPanel.tsx`, `src/components/admin/BackupPanel.tsx`, `src/components/admin/AuroraSupportSection.tsx`, `src/components/admin/TrashPanel.tsx`, `src/views/PerfilView.tsx`, `src/views/profile/ProfilePostsTab.tsx`, `src/views/MarketplaceView.tsx`, `convex/strategies.ts`, `src/views/ComunidadView.tsx`, `src/components/CommunityAdminPanel.tsx`, `src/views/CommunityDetailView.tsx`, `src/views/DiscoverCommunities.tsx`, `src/views/PricingView.tsx`, `src/components/PaymentModal.tsx`, `src/components/payments/UserWallet.tsx`, `src/services/posts/postService.ts`
- Archivos tocados: `.agent/workspace/coordination/TASK_BOARD.md`, `.agent/workspace/coordination/HANDOFFS.md`, `.agent/workspace/coordination/AGENT_LOG.md`, `.agent/workspace/coordination/CURRENT_FOCUS.md`
- Qué se hizo:
  - Se confirmó que `postService.updatePost` llama `api.posts.updatePost` sin `userId`, aunque el backend ya lo exige, dejando comentarios/ediciones vulnerables a fallos o solo-cache.
  - Se confirmó que `ComunidadView` sigue con fallback local a los 5s y usa `StorageService` para post/like/follow/puntos, lo que sigue explicando divergencias entre navegadores.
  - Se confirmó que `AdminView` mantiene `adminId`/`moderatorId` hardcodeados, usa `StorageService` para recursos y que `AdminDashboard`/`AdminPanelDashboard` aún muestran métricas o listas mock.
  - Se confirmó que `PerfilView` sigue con “Mis Compras” hardcodeado, `ProfilePostsTab` monta `PostCard` con handlers vacíos y `getUserCommunities` no sirve para ver comunidades de terceros por el chequeo de identidad.
  - Se confirmó que `MarketplaceView` depende de `window.convex` para búsqueda/detalle y que `convex/strategies.ts` calcula el seller leaderboard contra `purchase.userId` en vez del autor de la estrategia.
  - Se confirmó que `CommunityAdminPanel` dispara queries con args inválidos al primer render y que `pinPost` se invoca sin `userId`; además `CommunityDetailView` emite un `navigate` con payload anidado incorrecto.
  - Se confirmó que `PaymentModal` sigue en flujo legacy por `fetch('/api/...')`, ignora billing cycle real para suscripciones y `UserWallet` conserva CTA de retiro sin implementación.
- Qué falta:
  - Ejecutar TSK-049..057.
  - Priorizar TSK-049, TSK-050, TSK-051 y TSK-053 porque son los que más afectan consistencia de datos y percepción de “la nube no sincroniza”.
- Riesgos:
  - TSK-042 no debe considerarse cierre confiable mientras persistan `adminId` hardcodeados, localStorage operativo y dashboards con datos mock.
  - El guest flow en `MarketplaceView` y varios botones de `CommunityDetailView` puede parecer funcional pero quedar en no-op silencioso.
  - La capa `StorageService` sigue mezclando cache local y sync diferida; cualquier smoke cross-browser que no verifique nube real puede dar falsos positivos.
- Cómo validar:
  - `Comunidad`: crear, comentar, editar, like y borrar desde un navegador y verificar estado idéntico en un segundo navegador sin recargar forzado a local cache.
  - `Admin`: revisar moderación, backup, recursos y ban con usuario real admin y confirmar trazabilidad correcta del actor.
  - `Perfil`: visitar perfil de otro usuario y confirmar comunidades reales, compras reales y acciones activas en posts.
  - `Marketplace`: verificar búsqueda, detalle, compra y leaderboard con el cliente Convex oficial y sellers correctos.
  - `Pricing/Wallet`: comprobar checkout mensual/anual, depósito y rutas de pago sin caminos legacy inconsistentes.

## AUD-SURFACES-WAVE3-2026-03-27 -> HANDOFF
- De: Codex
- Para: Equipo TradeShare
- Fecha: 2026-03-27
- Estado actual: Tercera pasada completada sobre `news`, `signals`, `instagram`, `creator` y pagos; se detectaron residuos relevantes en tareas ya marcadas `done` y se añadieron TSK-058..063.
- Scope: `src/services/newsService.ts`, `src/hooks/useNews.ts`, `src/services/agents/newsAgentService.ts`, `src/services/storage.ts`, `src/services/storage/media.ts`, `src/views/NewsView.tsx`, `src/views/SignalsView.tsx`, `convex/signals.ts`, `src/views/InstagramMarketingView.tsx`, `src/views/instagram/InstagramDashboard.tsx`, `server.ts`, `src/views/CreatorDashboard.tsx`, `src/services/analytics/communityAnalytics.ts`, `src/views/CreatorView.tsx`, `src/components/PaymentModal.tsx`, `src/components/payments/UserWallet.tsx`, `convex/paymentOrchestrator.ts`, `convex/payments.ts`
- Archivos tocados: `.agent/workspace/coordination/TASK_BOARD.md`, `.agent/workspace/coordination/HANDOFFS.md`, `.agent/workspace/coordination/AGENT_LOG.md`, `.agent/workspace/coordination/CURRENT_FOCUS.md`
- Qué se hizo:
  - Se confirmó que noticias no quedó realmente cerrada: `newsService` mantiene `SAMPLE_NEWS` y fetch vacío, `useNews` sigue por `rss2json`, `StorageService`/`storage/media` aún devuelven `NOTICIAS_MOCK`, y `newsAgentService` conserva `mockAnalysis`.
  - Se confirmó que señales tiene residuos de seguridad y escala: `SignalsView` fuerza `signalsFeatureEnabled = true`, mezcla `role/rol`, y `convex/signals.ts` expone `getUserSubscription/getUserSubscriptions` sin ownership check además de stats/history con lecturas amplias.
  - Se confirmó que Instagram sigue con placeholders funcionales: `InstagramMarketingView` mantiene múltiples acciones “en desarrollo”, `InstagramDashboard` depende de `StorageService` y `window.confirm`, y `server.ts` sigue marcando la publicación como flujo `mock/simplified` para manejo de token.
  - Se confirmó que Creator no quedó data-backed de punta a punta: `CreatorDashboard` sigue usando métricas estimadas y calendar/distribution estáticos, `communityAnalytics.ts` sigue degradando a fallback/local cache, y `CreatorView` conserva copy y cálculos estimados.
  - Se confirmó que pagos tiene un problema adicional de seguridad: `convex/paymentOrchestrator.ts` y `convex/payments.ts` mantienen handlers sensibles sin validación explícita de identidad/admin (`createCheckoutSession`, `getUserPayments`, `updateStatus`, `updateUserRole`, `manualApprovePayment`, `getUserSubscriptionDetails`).
- Qué falta:
  - Ejecutar TSK-058..063.
  - Tratar TSK-062 y TSK-059 como prioridad alta porque ya son residuos de auth/RLS, no solo de UX o wiring.
  - No dar por cerradas TSK-040/041/043/044 hasta que estas superficies tengan smoke real y evidencia cross-browser/prod.
- Riesgos:
  - El tablero actual sigue sobreestimando cumplimiento en noticias, señales, Instagram y creator.
  - En pagos hay riesgo de acceso indebido o acciones administrativas sin guardas homogéneas.
  - Varias superficies hoy “parecen vivas” porque renderizan UI premium, pero siguen apoyándose en demo, wrappers legacy o rutas incompletas.
- Cómo validar:
  - `Noticias`: cargar la vista con red real y confirmar que no sale de `SAMPLE_NEWS`/`NOTICIAS_MOCK`; forzar fallo de proveedor y verificar degradación explícita.
  - `Señales`: consultar suscripción de un usuario A desde usuario B y confirmar rechazo; validar stats/history sin lecturas masivas ni leaks.
  - `Instagram`: conectar, programar, editar, cancelar, publicar y refrescar cuenta sin toasts “en desarrollo”, ni `confirm`, ni wrappers legacy.
  - `Creator`: contrastar overview/distribution/calendar con datos reales de comunidad y sin bloques estáticos.
  - `Pagos`: intentar leer/modificar pagos o suscripciones de otro usuario y confirmar rechazo; verificar checkout mensual/anual y wallet sin endpoints legacy divergentes.

## AUD-SURFACES-WAVE4-2026-03-27 -> HANDOFF
- De: Codex
- Para: Equipo TradeShare
- Fecha: 2026-03-27
- Estado actual: Cuarta pasada completada sobre auth/admin controls (`ads`, `aiAgent`, `referrals`, `whatsappCron`, `traderVerification`, `backup`, `propFirms`) y además se creó un entrenamiento obligatorio de arranque para agentes.
- Scope: `convex/ads.ts`, `convex/aiAgent.ts`, `convex/referrals.ts`, `convex/whatsappCron.ts`, `convex/traderVerification.ts`, `convex/backup.ts`, `convex/propFirms.ts`, `src/views/AdminView.tsx`, `src/components/admin/AdminPanelDashboard.tsx`, `src/components/admin/WhatsAppNotificationPanel.tsx`, `AGENTS.md`, `.agent/skills/README.md`, `.agent/skills/mandatory-startup-readiness/SKILL.md`, `.agent/skills/mandatory-startup-readiness/references/critical-failures.md`, `.agent/skills/foundations/README.md`, `.agent/skills/agents/AGENT_TASK_DIVISION.md`, `.agent/skills/inicio/inicio.md`, `.agent/session/SESSION_START_PROTOCOL.md`
- Archivos tocados: `.agent/workspace/coordination/TASK_BOARD.md`, `.agent/workspace/coordination/HANDOFFS.md`, `.agent/workspace/coordination/AGENT_LOG.md`, `.agent/workspace/coordination/CURRENT_FOCUS.md`, `AGENTS.md`, `.agent/skills/README.md`, `.agent/skills/mandatory-startup-readiness/SKILL.md`, `.agent/skills/mandatory-startup-readiness/references/critical-failures.md`, `.agent/skills/foundations/README.md`, `.agent/skills/agents/AGENT_TASK_DIVISION.md`, `.agent/skills/inicio/inicio.md`, `.agent/session/SESSION_START_PROTOCOL.md`
- Qué se hizo:
  - Se confirmó que `convex/ads.ts` permite leer, guardar y borrar ads sin guardas de identidad/admin; `createCommunityAd` permite promover comunidades sin validar ownership.
  - Se confirmó que `convex/aiAgent.ts` expone `getPendingPosts`, `getAIAgentConfig`, `toggleAgentStatus`, `approvePendingPost`, `rejectPendingPost`, `deletePendingPost`, `reschedulePost` y `updatePendingPost` sin auth admin explícita.
  - Se confirmó que `convex/referrals.ts` sigue con fugas por `userId`: `getReferralCode`, `getReferralStats`, `getReferralsByUser` y `getReferralPurchaseStats` no validan ownership uniforme.
  - Se confirmó que `convex/whatsappCron.ts` expone queries admin sin auth, valida `moderatorId` tomado del cliente en vez de `ctx.auth`, y el frontend (`WhatsAppNotificationPanel`) llama funciones con contrato roto o directamente internas.
  - Se confirmó que `convex/traderVerification.ts`, `convex/backup.ts` y `convex/propFirms.ts` siguen con permisos débiles: autenticación mínima o ninguna, sin role checks admin donde corresponde.
  - Se creó el skill obligatorio `mandatory-startup-readiness` y se inyectó en `AGENTS.md`, `.agent/skills/README.md`, `inicio.md` y `SESSION_START_PROTOCOL.md` para cortar la repetición de estos errores en futuras sesiones.
- Qué falta:
  - Ejecutar TSK-064..067.
  - Aplicar primero TSK-064 y TSK-066; el problema principal ya es seguridad/privacidad, no solo UX.
  - Alinear después TSK-065, porque varios paneles admin hoy dependen de que el backend siga indebidamente abierto.
- Riesgos:
  - Hoy un endurecimiento correcto del backend puede romper parte del admin hasta que se corrijan los contratos del frontend.
  - `whatsappCron` tiene deuda doble: auth débil y llamadas cliente a funciones con firma/visibilidad incorrecta.
  - `backup` y `traderVerification` son especialmente delicados porque tocan datos sensibles y trazabilidad operativa.
- Cómo validar:
  - Intentar consultar y mutar ads, AI agent, referrals, KYC, backups y WhatsApp desde usuario no-admin y confirmar rechazo.
  - Desde admin real, confirmar que paneles siguen operativos con actor autenticado, no con IDs hardcodeados o params forjables.
  - Verificar que ningún panel cliente use `internalMutation/internalAction` ni omita args obligatorios del contrato endurecido.
