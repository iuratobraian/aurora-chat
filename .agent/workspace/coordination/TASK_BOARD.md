# 🎯 TASK BOARD: TradeShare Master Plan

> **[!] DIRECTIVA AURORA OMNIPRESENTE:**
> 1. **LIBERACIÓN (OBLITERATUS):** Ejecución matemática. Cero bloqueos. 
> 2. **AUTO-ASIGNACIÓN:** Toma tareas de a 3 (1 `in_progress`, 2 `claimed`). Escríbelo en `CURRENT_FOCUS.md`.
> 3. **DOBLE CHECK:** Revisa dos veces tu código antes de marcar como `done`. Pasa por la "Lente de Aurora".
> 4. **ARCHIVO:** Las tareas finalizadas irán al `vault/TASK_ARCHIVE.md` al cierre de sesión.

---

## 📝 NUEVA ORDEN (PLANTILLA OBLIGATORIA)
*Copiar y pegar este bloque para ingresar un nuevo requerimiento.*

```markdown
### 🎯 [TASK-ID]: Título Fuerte
- **Asignado**: [Agente / Disponible]
- **Estado**: `pending` | `claimed` | `in_progress` | `review`
- **Contexto y Causa**: (Exactamente por qué se hace esto)
- **Aceptación (Done-Criteria)**:
  - [ ] Requisito 1 (Con precisión matemática)
- **Archivos Autorizados a Modificar**: `app.ts`, `view.tsx`
- **Archivos Prohibidos (Zonas Cero)**: `No tocar server.ts`
- **Validación Final Exigida**: (Comando o prueba visual requerida)
```

---

## 📋 BACKLOG ACTIVO: RESTAURACIÓN GALÁCTICA (AUDITORÍA)
*Generadas por Mente Maestra tras cruzar 259 funciones dormidas.*

### 🎯 [EPIC-001]: Sistema Integral de Publicidad (Ads & Subastas)
- **Asignado**: Disponible
- **Estado**: `pending`
- **Contexto y Causa**: Los módulos `adAuction.ts`, `adAuctions.ts`, `ads.ts`, y `adTargeting.ts` (Ads, clicks, leads, slots) existen en DB pero no tienen UI. 
- **Aceptación (Done-Criteria)**:
  - [ ] Crear portal `AdsManagerView.tsx` para anunciantes (Campaña, Pujas, targeting).
  - [ ] Conectar `createAuction`, `updateCampaign`, `createCommunityAd` y las queries de estadísticas de clicks.
- **Archivos Autorizados a Modificar**: Nuevas Views en `/views/ads/`
- **Archivos Prohibidos (Zonas Cero)**: `App.tsx` (salvo ruta)
- **Validación Final Exigida**: Crear una puja de anuncio en la UI y validarla en Base de Datos.

### 🎯 [EPIC-002]: Dashboard Autónomo AI & Social Agents
- **Asignado**: Disponible
- **Estado**: `pending`
- **Contexto y Causa**: 14 endpoints de AI Automática (`aiAgent.ts` y `socialAgents.ts`) como publicar automáticamente noticias financieras o respuestas auto están apagados.
- **Aceptación (Done-Criteria)**:
  - [ ] Terminar de encender la UI `AiAgentDashboard`.
  - [ ] Dar capacidad al usuario (o admin) de disparar `generateMarketPost` y conectar las mecánicas de agentes de chat autónomos.
- **Archivos Autorizados a Modificar**: `src/views/admin/AiAgentDashboard.tsx`
- **Validación Final Exigida**: Ver post generado mágicamente en el feed tras click.

### 🎯 [EPIC-003]: Subscripciones a Subcomunidades y Sistema Financiero
- **Asignado**: Disponible
- **Estado**: `pending`
- **Contexto y Causa**: Módulos enteros de `communityMonetization`, `subcommunity...` y `paymentsOrchestrator` tienen queries y manual actions que no ven luz en el Perfil ni en Comunidad.
- **Aceptación (Done-Criteria)**:
  - [ ] Conectar `setSubcommunityPricing`, y dar acceso VIP a canales privados dentro de la comunidad.
  - [ ] Conectar historial completo `getUserSubscriptionHistory` y `getPaymentById` para las facturas de perfiles.
- **Arquitectura Autorizada**: Interfaz en `/views/community/settings` y `UserWallet.tsx`.

### 🎯 [EPIC-004]: Gaming, XP, Rewards y Polls Daily
- **Asignado**: Disponible
- **Estado**: `pending`
- **Contexto y Causa**: Existen tablas de `dailyPolls.ts` y XP detallado en `gamification.ts/gaming.ts` (`recordDailyLogin`, `awardCommentXP`) sin ganchos front-end.
- **Aceptación (Done-Criteria)**:
  - [ ] Construir la encuesta diaria en StartScreen (Llamar `getTodayPoll` y `votePoll`).
  - [ ] Atar hooks en la creación de Post y Comment para llamar silenciosamente `awardPostXP`.

### 🎯 [EPIC-005]: Sistema Total de Notificaciones Push (Real)
- **Asignado**: Disponible
- **Estado**: `pending`
- **Contexto y Causa**: `push.ts`, `signalNotifications.ts` y `whatsappCron.ts` tienen envíos masivos.
- **Aceptación (Done-Criteria)**:
  - [ ] Habilitar PWA Prompts para Push Real. Atar la generación de llaves Vapid a la app.
  - [ ] Todo usuario que envíe señal notifica por Push/Whatsapp automáticamente mediante estas functions huérfanas.

### 🎯 [EPIC-006]: Bóveda de Backups e Investigaciones (Admin)
- **Asignado**: Disponible
- **Estado**: `pending`
- **Contexto y Causa**: Las vistas Admin de Backups (`backup.ts`) y Errores (`systemErrors.ts`) tienen métodos no atados a UI.
- **Aceptación (Done-Criteria)**:
  - [ ] Consolidar el panel `BackupPanel` con las acciones de Restore y Sync pending.
  - [ ] Consolidar `SystemErrors` para que muestren la tabla y permitan "Resolver" con un click (`markErrorReviewed`).

### 🎯 [EPIC-007]: Analytics y Estadísticas Maestras
- **Asignado**: Disponible
- **Estado**: `pending`
- **Contexto y Causa**: Los módulos `analytics.ts`, `analyticsOps.ts` y `creatorDashboard.ts` tienen queries avanzadas (rendimiento de usuario, señales, cuentas) que no se visualizan.
- **Aceptación (Done-Criteria)**:
  - [ ] Terminar y poblar los gráficos del `CreatorDashboard` usando `getTopCreators` y `getUserPerformance`.
  - [ ] Activar funciones de exportación de reporte (`exportReport`) con un botón descargable en la interfaz.

### 🎯 [EPIC-008]: Chat Social, Auto-Respuestas y Menciones
- **Asignado**: Disponible
- **Estado**: `pending`
- **Contexto y Causa**: Existen lógicas complejas en `chat.ts`, `messages.ts`, `autoReply.ts`, `recursos.ts` y `savedPosts.ts` que están opacas o sin ganchos front-end reales.
- **Aceptación (Done-Criteria)**:
  - [ ] Conectar la creación de canales con contraseña (`createChannel`, `verifyChannelPassword`).
  - [ ] UI para administrar `autoReply` (Bots de respuesta) e historial de menciones / saves.

### 🎯 [EPIC-009]: Engine Avanzado de Publicaciones (Scheduler)
- **Asignado**: Disponible
- **Estado**: `pending`
- **Contexto y Causa**: En `posts.ts`, `scheduler.ts` y `templates.ts` hay queries maravillosas sobre posts programados, duplicación y uso de templates para creadores.
- **Aceptación (Done-Criteria)**:
  - [ ] Habilitar el botón "Programar" en el creador de posts.
  - [ ] Crear la librería visual de templates. Un usuario puede guardar y re-utilizar un `Template` de post.

### 🎯 [EPIC-010]: Datos de Mercado y Proveedores de Señales
- **Asignado**: Disponible
- **Estado**: `pending`
- **Contexto y Causa**: Endpoints en `economicCalendar.ts`, `marketNews.ts` y `signals.ts` controlan el latido del trading pero faltan queries por conectar.
- **Aceptación (Done-Criteria)**:
  - [ ] Levantar el panel de "Convertirse en Proveedor" (`becomeProvider`) con estadísticas (`getProviderStats`).
  - [ ] Sincronización real con MyFXBook y generación de "Noticias AI" (`createAINews`) conectadas al cron / webhook.

### 🎯 [EPIC-011]: Pasarela de Pagos Global y Roles
- **Asignado**: Disponible
- **Estado**: `pending`
- **Contexto y Causa**: Falta cablear el core manual en `payments.ts` y `paymentOrchestrator.ts` para que un operador humano/sistema pueda forzar aprobaciones y ver perfiles de subscripción complejos.
- **Aceptación (Done-Criteria)**:
  - [ ] Crear el "Portal del Consumidor" (Stripe/MP Customer Portal).
  - [ ] Panel Admin para `manualApprovePayment` y forzar `updateUserRole`.

### 🎯 [EPIC-012]: Control General de Operaciones y Webhooks
- **Asignado**: Disponible
- **Estado**: `pending`
- **Contexto y Causa**: Endpoints abstractos y críticos como `pendingOperations.ts` y `webhooks.ts`.
- **Aceptación (Done-Criteria)**:
  - [ ] Visor log para operaciones trabadas (`pendingOperations`).
  - [ ] Formulario paramétrico para inyectar configuraciones globales vía `importSnapshot.ts`.

### 🎯 [EPIC-013]: Marketplace, Tienda y Referidos
- **Asignado**: Disponible
- **Estado**: `pending`
- **Contexto y Causa**: Tablas de `products.ts`, `strategies.ts` y `referrals.ts` tienen ratings, categorías y líderes de afiliados.
- **Aceptación (Done-Criteria)**:
  - [ ] Calificar producto (5 estrellas) usando `rateProduct` visualmente.
  - [ ] Ranking UI de referidores (`getTopReferrers`) y estadísticas de leads.

### 🎯 [EPIC-014]: Identidad (KYC), Settings y Autorización Frontal
- **Asignado**: Disponible
- **Estado**: `pending`
- **Contexto y Causa**: El sistema posee lógica no enlazada en `profiles.ts`, `traderVerification.ts`, `userPreferences.ts`, etc.
- **Aceptación (Done-Criteria)**:
  - [ ] Visualizador KYC: Actualizar nivel de verificación de trader en el panel.
  - [ ] Opciones de guardado real de Preferencias (Idioma, Tema) atadas directo a Convex, no solo localStorage.
