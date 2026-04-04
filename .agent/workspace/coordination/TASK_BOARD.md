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

## 🔥 SPRINT ACTIVO: ESTABILIZACIÓN PRODUCCIÓN (2026-04-03)
*Errores en vivo detectados — resolver ANTES de cualquier EPIC.*

### 🎯 [FIX-001]: Eliminar requireUser() de queries de gamification.ts + agregar getAchievementProgress
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `done`
- **Contexto y Causa**: `getUserProgress` y `getUserAchievements` llaman a `requireUser(ctx)` que lanza excepción porque este proyecto usa auth custom — `ctx.auth.getUserIdentity()` SIEMPRE devuelve `null`. Además, `getAchievementProgress` no existe pero es llamada desde `storage.ts:392`. Esto crashea PerfilView, LeaderboardView.
- **Aceptación (Done-Criteria)**:
  - [ ] Eliminar `const identity = await requireUser(ctx)` y el bloque IDOR de `getUserProgress`
  - [ ] Eliminar `const identity = await requireUser(ctx)` y el bloque IDOR de `getUserAchievements`
  - [ ] Envolver handler completo de ambas queries en `try { ... } catch(e) { return null/[] }`
  - [ ] Agregar nueva query `getAchievementProgress` con try/catch (ver código exacto en `WORK_ORDERS_URGENT.md`)
  - [ ] Ejecutar `npx convex deploy` y verificar que desaparece el Server Error en consola
- **Archivos Autorizados a Modificar**: `convex/gamification.ts`
- **Archivos Prohibidos (Zonas Cero)**: `App.tsx`, `Navigation.tsx`
- **Validación Final Exigida**: Navegar a PerfilView — sin Server Error en consola. LeaderboardView carga.

### 🎯 [FIX-002]: Defensa try/catch en products:getUserPurchases
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `done`
- **Contexto y Causa**: `CONVEX Q(products:getUserPurchases)` lanza Server Error crasheando ProductView entera. Misma causa que FIX-001: `requireUser(ctx)` o `requireAdmin(ctx)` en query.
- **Aceptación (Done-Criteria)**:
  - [ ] Buscar `getUserPurchases` en `convex/products.ts`
  - [ ] Quitar llamadas a `requireUser`/`requireAdmin` dentro del handler de esa query
  - [ ] Envolver lógica en `try { ... } catch(e) { return [] }`
  - [ ] `npx convex deploy` y verificar ProductView sin crash
- **Archivos Autorizados a Modificar**: `convex/products.ts`
- **Archivos Prohibidos (Zonas Cero)**: `App.tsx`, `Navigation.tsx`, `ProductView.tsx`
- **Validación Final Exigida**: Ir a sección Marketplace — no debe crashear ni mostrar error en panel Admin.

### 🎯 [FIX-003]: Defensa try/catch en communities:getCommunityStats
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `done`
- **Contexto y Causa**: `CONVEX Q(communities:getCommunityStats)` crashea CommunityAdminPanel. Mismo patrón de auth.
- **Aceptación (Done-Criteria)**:
  - [ ] Buscar `getCommunityStats` en `convex/communities.ts`
  - [ ] Quitar `requireUser`/`requireAdmin` del handler
  - [ ] Retornar objeto vacío seguro en catch: `{ memberCount: 0, postCount: 0, activeMembers: 0 }`
  - [ ] `npx convex deploy`
- **Archivos Autorizados a Modificar**: `convex/communities.ts`
- **Archivos Prohibidos (Zonas Cero)**: `App.tsx`, `ComunidadView.tsx`
- **Validación Final Exigida**: Panel comunidad carga sin Server Error.

### 🎯 [FIX-004]: Defensa try/catch en market/economicCalendar:getUpcomingEvents
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `done`
- **Contexto y Causa**: `CONVEX Q(market/economicCalendar:getUpcomingEvents)` crashea NewsView completamente, llegando al GlobalErrorHandler.
- **Aceptación (Done-Criteria)**:
  - [ ] Buscar `getUpcomingEvents` en `convex/market/economicCalendar.ts`
  - [ ] Aplicar try/catch → retornar `[]` en catch
  - [ ] `npx convex deploy`
- **Archivos Autorizados a Modificar**: `convex/market/economicCalendar.ts`
- **Archivos Prohibidos (Zonas Cero)**: `App.tsx`, `Navigation.tsx`
- **Validación Final Exigida**: NewsView carga sin crash ni GlobalErrorHandler.

### 🎯 [FIX-005]: Corregir skip pattern ilegal en CreatorDashboard
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `done`
- **Contexto y Causa**: `"skip" as any` con `{}` vacío como segundo arg → Convex intenta ejecutar query llamada `skip:default` y falla. Error: `CONVEX Q(skip:default)`.
- **Aceptación (Done-Criteria)**:
  - [ ] En `src/views/CreatorDashboard.tsx` línea ~82, reemplazar:
    ```tsx
    useQuery(validCommunityId ? api.communities.getCommunityMembers : "skip" as any, validCommunityId ? {...} : {})
    ```
    Por:
    ```tsx
    useQuery(api.communities.getCommunityMembers, validCommunityId ? { communityId: validCommunityId, limit: 50 } : 'skip')
    ```
  - [ ] Verificar que no haya otros `"skip" as any` en el mismo archivo
- **Archivos Autorizados a Modificar**: `src/views/CreatorDashboard.tsx`
- **Archivos Prohibidos (Zonas Cero)**: `App.tsx`, `Navigation.tsx`
- **Validación Final Exigida**: CreatorDashboard carga sin CONVEX Q(skip:default) en consola.

### 🎯 [FIX-006]: Null guard JSX en GraficoView cuando selectedAsset es null
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `done`
- **Contexto y Causa**: `ASSETS=[]` → `selectedAsset` inicia en `null`. El JSX accede a `selectedAsset.color`, `selectedAsset.symbol` etc. sin guard → crash por `Cannot read properties of undefined (reading 'color')`. El estado inicial ya fue corregido, falta el guard en render.
- **Aceptación (Done-Criteria)**:
  - [ ] En `src/views/GraficoView.tsx`, agregar early return antes del JSX principal:
    ```tsx
    if (!selectedAsset) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <span className="material-symbols-outlined text-4xl text-gray-600">candlestick_chart</span>
            <p className="text-gray-400 mt-2">Cargando activos...</p>
          </div>
        </div>
      );
    }
    ```
- **Archivos Autorizados a Modificar**: `src/views/GraficoView.tsx`
- **Archivos Prohibidos (Zonas Cero)**: `App.tsx`
- **Validación Final Exigida**: Navegar a sección Gráfico — sin crash, muestra loader bonito mientras carga.

### 🎯 [FIX-007]: Corregir CSP Pusher wildcard inválido
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `done`
- **Contexto y Causa**: `'wss://ws*.pusher.com'` en directiva CSP `connect-src` — los wildcards en subdominios no son válidos en CSP. Aparece en cada página como warning.
- **Aceptación (Done-Criteria)**:
  - [ ] Buscar `wss://ws*.pusher.com` en `vite.config.ts` y/o `server.ts`
  - [ ] Si se usa Pusher activamente: reemplazar por lista explícita `wss://ws1.pusher.com wss://ws2.pusher.com wss://ws3.pusher.com wss://ws4.pusher.com`
  - [ ] Si NO se usa Pusher: eliminarlo del `connect-src`
  - [ ] Reiniciar dev server y verificar que desaparece el warning de CSP
- **Archivos Autorizados a Modificar**: `vite.config.ts`, `server.ts`
- **Archivos Prohibidos (Zonas Cero)**: `App.tsx`
- **Validación Final Exigida**: Consola sin warning de CSP Pusher.

### 🎯 [FIX-008]: Autenticar request de YouTube en PsicotradingView
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `done`
- **Contexto y Causa**: `POST /api/youtube/extract 401 Unauthorized` → el endpoint requiere token pero PsicotradingView no lo envía en los headers.
- **Aceptación (Done-Criteria)**:
  - [ ] En `src/views/PsicotradingView.tsx` función `handleExtractYouTube` (línea ~149), agregar auth header al fetch. Investigar cómo otros endpoints del mismo archivo o proyecto envían autenticación y replicar el patrón
  - [ ] Verificar en `server.ts` cómo valida el token para esa ruta y asegurar que el cliente lo provea
- **Archivos Autorizados a Modificar**: `src/views/PsicotradingView.tsx`
- **Archivos Prohibidos (Zonas Cero)**: `App.tsx`, `server.ts` (solo lectura)
- **Validación Final Exigida**: Click en "Extraer" de PsicotradingView → no 401, proceso inicia.

### 🎯 [FIX-009]: Eliminar doble disparo de RECORD_LOGIN (x4 renders)
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `done`
- **Contexto y Causa**: `[INFO] [RECORD_LOGIN] Success for userId: admin_braiurato` aparece 4 veces por carga. El `useEffect` que llama `recordDailyLogin` tiene dependencias incorrectas o está en un componente que re-renderiza.
- **Aceptación (Done-Criteria)**:
  - [ ] Buscar en `src/App.tsx` el `useEffect` que llama `RECORD_LOGIN` o `recordDailyLogin`
  - [ ] Agregar un `useRef` guard para que solo dispare una vez por sesión:
    ```tsx
    const loginRecordedRef = useRef(false);
    useEffect(() => {
      if (!usuario || loginRecordedRef.current) return;
      loginRecordedRef.current = true;
      // ... lógica de login record ...
    }, [usuario?.id]);
    ```
- **Archivos Autorizados a Modificar**: `src/App.tsx` (SOLO el useEffect de login, nada más)
- **Archivos Prohibidos (Zonas Cero)**: Todo lo demás en `App.tsx`
- **Validación Final Exigida**: RECORD_LOGIN aparece exactamente 1 vez en consola al cargar.

### 🎯 [FIX-010]: Agregar frame-src para bitacora-de-trading.vercel.app
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `done`
- **Contexto y Causa**: `Framing 'https://bitacora-de-trading.vercel.app/' violates CSP frame-src` — la URL está siendo enmarcada (iframe) pero no está en la whitelist de `frame-src`.
- **Aceptación (Done-Criteria)**:
  - [ ] Buscar definición de `frame-src` en `vite.config.ts` o `server.ts`
  - [ ] Agregar `https://bitacora-de-trading.vercel.app` a la directiva `frame-src`
  - [ ] Verificar que el iframe carga correctamente en la sección correspondiente
- **Archivos Autorizados a Modificar**: `vite.config.ts`, `server.ts`
- **Archivos Prohibidos (Zonas Cero)**: `App.tsx`
- **Validación Final Exigida**: No más warning de CSP frame-src en consola.

---


*Generadas por Mente Maestra tras cruzar 259 funciones dormidas.*

### 🎯 [EPIC-001]: Sistema Integral de Publicidad (Ads & Subastas)
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `done`
- **Contexto y Causa**: Los módulos `adAuction.ts`, `adAuctions.ts`, `ads.ts`, y `adTargeting.ts` (Ads, clicks, leads, slots) existen en DB pero no tienen UI. 
- **Aceptación (Done-Criteria)**:
  - [ ] Crear portal `AdsManagerView.tsx` para anunciantes (Campaña, Pujas, targeting).
  - [ ] Conectar `createAuction`, `updateCampaign`, `createCommunityAd` y las queries de estadísticas de clicks.
- **Archivos Autorizados a Modificar**: Nuevas Views en `/views/ads/`
- **Archivos Prohibidos (Zonas Cero)**: `App.tsx` (salvo ruta)
- **Validación Final Exigida**: Crear una puja de anuncio en la UI y validarla en Base de Datos.

### 🎯 [EPIC-002]: Dashboard Autónomo AI & Social Agents
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `done`
- **Contexto y Causa**: 14 endpoints de AI Automática (`aiAgent.ts` y `socialAgents.ts`) como publicar automáticamente noticias financieras o respuestas auto están apagados.
- **Aceptación (Done-Criteria)**:
  - [ ] Terminar de encender la UI `AiAgentDashboard`.
  - [ ] Dar capacidad al usuario (o admin) de disparar `generateMarketPost` y conectar las mecánicas de agentes de chat autónomos.
- **Archivos Autorizados a Modificar**: `src/views/admin/AiAgentDashboard.tsx`
- **Validación Final Exigida**: Ver post generado mágicamente en el feed tras click.

### 🎯 [EPIC-003]: Subscripciones a Subcomunidades y Sistema Financiero
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `done`
- **Contexto y Causa**: Módulos enteros de `communityMonetization`, `subcommunity...` y `paymentsOrchestrator` tienen queries y manual actions que no ven luz en el Perfil ni en Comunidad.
- **Aceptación (Done-Criteria)**:
  - [ ] Conectar `setSubcommunityPricing`, y dar acceso VIP a canales privados dentro de la comunidad.
  - [ ] Conectar historial completo `getUserSubscriptionHistory` y `getPaymentById` para las facturas de perfiles.
- **Arquitectura Autorizada**: Interfaz en `/views/community/settings` y `UserWallet.tsx`.

### 🎯 [EPIC-004]: Gaming, XP, Rewards y Polls Daily
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `done`
- **Contexto y Causa**: Existen tablas de `dailyPolls.ts` y XP detallado en `gamification.ts/gaming.ts` (`recordDailyLogin`, `awardCommentXP`) sin ganchos front-end.
- **Aceptación (Done-Criteria)**:
  - [ ] Construir la encuesta diaria en StartScreen (Llamar `getTodayPoll` y `votePoll`).
  - [ ] Atar hooks en la creación de Post y Comment para llamar silenciosamente `awardPostXP`.

### 🎯 [EPIC-005]: Sistema Total de Notificaciones Push (Real)
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `done`

### 🎯 [EPIC-006]: Bóveda de Backups e Investigaciones (Admin)
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `done`

### 🎯 [EPIC-007]: Analytics y Estadísticas Maestras
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `done`

### 🎯 [EPIC-008]: Chat Social, Auto-Respuestas y Menciones
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `done`

### 🎯 [EPIC-009]: Engine Avanzado de Publicaciones (Scheduler)
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `done`

### 🎯 [EPIC-010]: Datos de Mercado y Proveedores de Señales
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `done`

### 🎯 [EPIC-011]: Pasarela de Pagos Global y Roles
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `done`

### 🎯 [EPIC-012]: Control General de Operaciones y Webhooks
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `done`

### 🎯 [EPIC-013]: Marketplace, Tienda y Referidos
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `done`

### 🎯 [EPIC-014]: Identidad (KYC), Settings y Autorización Frontal
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `done`

---

## 🔥 SPRINT 6: SEGURIDAD, REFACTORING Y FEATURES (2026-04-03)
*Generadas desde tradeshare_mejoras.md + implementation_plan.md*

### 🎯 [SEC-001]: Eliminar API Key ImgBB hardcodeada
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `pending`

### 🎯 [SEC-002]: Reemplazar MOCKED_AUTH con Auth real
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `pending`

### 🎯 [SEC-003]: Eliminar comentarios passwords históricos
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `pending`

### 🎯 [SEC-004]: Hash contraseñas con bcrypt
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `pending`

### 🎯 [SEC-005]: CSP Headers completos
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `pending`

### 🎯 [SEC-006]: Chat Moderation
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `pending`

### 🎯 [REF-001]: Eliminar console.log (26+)
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `pending`

### 🎯 [REF-002]: Reducir @ts-ignore (78+ → <10)
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `pending`

### 🎯 [REF-003]: Dividir storage.ts (2334 líneas)
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `pending`

### 🎯 [REF-004]: Dividir AdminView.tsx (3228 líneas)
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `pending`

### 🎯 [REF-005]: Unificar mapConvexPost
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `pending`

### 🎯 [REF-006]: Unificar extractYoutubeId
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `pending`

### 🎯 [PWA-001]: PWA Offline Mode con Service Worker
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `pending`

### 🎯 [PWA-002]: Feed Ranking UI con boost badges
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `pending`

### 🎯 [PWA-003]: Trust Score Layer visible
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `pending`

### 🎯 [PWA-004]: Creator Flywheel completo
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `pending`

### 🎯 [UX-001]: Popup perfil (posición + auto-close)
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `pending`

### 🎯 [UX-002]: Tema claro funcional
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `pending`

### 🎯 [UX-003]: Email duplicado en AuthModal
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `pending`

### 🎯 [UX-004]: Lazy loading feed (5 en 5)
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `pending`

### 🎯 [UX-005]: Responsive mobile completo
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `pending`

### 🎯 [UX-006]: Passwords fuera localStorage
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `pending`

### 🎯 [FEAT-001]: Posts IA generados automáticamente
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `pending`

### 🎯 [FEAT-002]: MercadoPago real con webhooks
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `pending`

### 🎯 [FEAT-003]: Zenobank real
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `pending`

### 🎯 [FEAT-004]: Moderación visible
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `pending`

### 🎯 [FEAT-005]: Exness API Sync
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `pending`

### 🎯 [FEAT-006]: Affiliate System
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `pending`

### 🎯 [FEAT-007]: Invoice System
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `pending`

### 🎯 [TEST-001]: Suite de tests Vitest
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `pending`

### 🎯 [TEST-002]: Tests E2E Playwright
- **Asignado**: Qwen (AGENT-008)
- **Estado**: `pending`

### 🎯 [IDEA-001]: Web builder por prompts
- **Asignado**: Disponible
- **Estado**: `pending`

### 🎯 [IDEA-002]: Strategy lab para MT5
- **Asignado**: Disponible
- **Estado**: `pending`

### 🎯 [IDEA-003]: AI room multiagente
- **Asignado**: Disponible
- **Estado**: `pending`
