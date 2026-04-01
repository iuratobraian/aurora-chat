# 🧠 KNOWLEDGE BASE — TradeShare

> **Propósito:** Documentar soluciones, patrones y aprendizajes para que cualquier agente pueda resolver rápido sin reinventar.
> **Última actualización:** 2026-03-31 (Sesión masiva de 61 tareas)

---

## 🔐 Auth & Sessions

### JWT Session Management
- **Patrón:** Tokens JWT firmados con `JWT_SECRET` almacenados en localStorage
- **Endpoint:** `POST /api/auth/login`, `POST /api/auth/register`
- **Files:** `src/services/auth/authService.ts`, `server.ts` (rutas auth)
- **Notas:** ⚠️ JWT_SECRET fallback es débil — cambiar en producción

### Convex Auth
- **Patrón:** `requireUser()` en mutations para verificar identidad
- **Files:** `convex/lib/auth.ts`
- **Notas:** Verificar que todas las mutations sensibles tengan auth check

### CRITICAL: No usar userId como token (FIXED)
- **Problema:** `verifyTokenWithConvex` permitía usar cualquier string como userId y autenticaba
- **Solución:** Eliminar fallback. Solo JWT válido autentica. WebSocket también fixeado.
- **Files:** `server.ts` (requireAuth, verifyWSToken)

### Registration Validation
- **Validaciones:** email regex, password min 6 chars, username alfanumérico 3+ chars
- **Password:** Se hashea ANTES de enviar a Convex (nunca plaintext)
- **Files:** `src/services/auth/authService.ts`

---

## 💳 Payments

### MercadoPago Integration
- **Patrón:** Crear preference → redirect a checkout → webhook confirma pago
- **Files:** `convex/mercadopagoApi.ts`, `server.ts` (webhook handler), `convex/payments.ts`
- **Endpoint:** `POST /api/mercadopago/preference`, `POST /webhooks/mercadopago`
- **Notas:** Webhook necesita `express.raw()` antes de `express.json()` — skip `/webhooks/` en express.json()

### Webhook Idempotency
- **Problema:** Webhooks duplicados creaban créditos/suscripciones múltiples
- **Solución:** Check `externalReference` antes de procesar. Si ya existe y status=completed, retornar.
- **Files:** `convex/mercadopagoApi.ts` (processPaymentWebhook), `server.ts` (webhook handler)

### Subscription Activation
- **Problema:** Suscripciones se creaban con status "pending" y nunca se activaban
- **Solución:** Webhook crea con status "active" y `currentPeriodEnd` calculado
- **Files:** `server.ts` (webhook handler), `convex/subscriptions.ts`

### Subscription Schema Fix
- **Problema:** `createSubscription` no aceptaba `status` ni `currentPeriodEnd` como args
- **Solución:** Agregar args opcionales. `.collect()` → `.take(50)` en queries.
- **Files:** `convex/subscriptions.ts`

---

## 🏘️ Communities

### Community Creation Validation
- **Validaciones:** nombre 2-60 chars, slug regex `[a-z0-9]+(-[a-z0-9]+)*`, descripción max 500, precio >= 0, maxMembers >= 1
- **Files:** `convex/communities.ts` (createCommunity)

### Join/Leave Auth Fix
- **Problema:** `assertOwnershipOrAdmin` bloqueaba a usuarios normales de unirse/salir
- **Solución:** Reemplazar con `requireUser(ctx)` + verificar identidad.subject === userId
- **Files:** `convex/communities.ts` (joinCommunity, leaveCommunity)

### Ownership Checks
- **Problema:** updateCommunity, deleteCommunity, restoreCommunity no verificaban ownership
- **Solución:** Agregar verificación `community.ownerId === args.userId` antes de patch
- **Files:** `convex/communities.ts`

### Private Communities
- **Fix:** Agregar check `community.visibility === "private"` en joinCommunity
- **Files:** `convex/communities.ts`

---

## 📝 Posts

### CreatePost Mutation Fix
- **Problema:** CreatePostModal llamaba `createPublicPost`, `createCommunityPost`, `createSubcommunityPost` que no existían
- **Solución:** Unificar en `createPost` con args opcionales `communityId`, `subcommunityId`
- **Files:** `convex/posts.ts`, `src/components/CreatePostModal.tsx`

### Dead Code Block
- **Problema:** Bloque de código huérfano entre `getPostsPaginated` y `getPostsByUser` (líneas 165-173)
- **Solución:** Eliminar bloque huérfano
- **Files:** `convex/posts.ts`

### .collect() Performance
- **Problema:** `givePostPoints` y `getTopPointsPosts` usaban `.collect()` cargando TODOS los posts
- **Solución:** `.collect()` → `.get(postId)` y `.take(100)`
- **Files:** `convex/posts.ts`

---

## 🎬 YouTube Extractor

### Server-Side Extraction
- **Problema:** API key expuesta en client bundle (`VITE_YOUTUBE_API_KEY`)
- **Solución:** Crear endpoint `/api/youtube/extract` en server.ts. API key solo en server.
- **Files:** `server.ts`, `src/services/youtube/psychotradingExtractor.ts`, `src/views/PsicotradingView.tsx`

### Named Export Fix
- **Problema:** AdminView importaba `{ YouTubePsychotradingExtractor }` pero solo existía default export
- **Solución:** Agregar named export además del default
- **Files:** `src/services/youtube/psychotradingExtractor.ts`

---

## 🛡️ Admin Panel

### Full-Width Fix
- **Problema:** Admin panel tenía `max-w-[1800px] mx-auto` limitando el ancho
- **Solución:** Eliminar max-width constraints en AdminPanelDashboard y CommunityAdminPanel
- **Files:** `src/components/admin/AdminPanelDashboard.tsx`, `src/components/admin/CommunityAdminPanel.tsx`

---

## ⚡ Performance

### .collect() → .take() Pattern
- **Regla:** NUNCA usar `.collect()` sin límite en Convex queries
- **Patrón:** `.take(50)` o `.take(100)` según necesidad
- **Archivos afectados:** `convex/subscriptions.ts`, `convex/posts.ts`, `convex/communities.ts`

### npm audit
- **Estado:** 4 vulnerabilidades high en `vite-plugin-pwa` → `serialize-javascript`
- **Solución:** Requiere breaking change. No crítico para producción.

---

## 🚫 PROHIBIDO

- ❌ TurboQuant — eliminado permanentemente
- ❌ Modificar `src/App.tsx`, `src/Navigation.tsx`, `src/views/ComunidadView.tsx`, `src/views/PricingView.tsx` sin tarea explícita
- ❌ Hardcodear secrets o API keys
- ❌ Usar localStorage como source of truth compartida
- ❌ Dejar mocks, placeholders o toasts "en desarrollo"

---

## 🔄 Deploy & CI/CD

### GitHub Actions Pipeline
- **Trigger:** Push a `main`
- **Jobs:** project-os → quality → build → deploy
- **Deploy:** Vercel (frontend) + Convex (backend)
- **Files:** `.github/workflows/ci.yml`

### Convex Deploy
- **Requiere:** `CONVEX_DEPLOY_KEY` real del dashboard (no deployment token)
- **Comando:** `npx convex deploy`
- **Nota:** La deploy key se encuentra en dashboard.convex.dev → Settings → Deploy Key

### Build Fix
- **Problema común:** `package-lock.json` desincronizado
- **Solución:** `npm install` para regenerar lock file antes de push
- **Error típico:** `npm ci` falla con "Missing: X from lock file"

---

## 📋 Agent Workflow

### Inicio Command
- `npm run inicio` → git pull + Notion sync + TASK_BOARD.md generation
- Flujo: Notion → elegir tarea → progress → trabajar → done → commit → push → repetir
- Cada 5 tareas → git push obligatorio

### Task Action Commands
- `node scripts/notion-task-action.mjs list` — listar tareas
- `node scripts/notion-task-action.mjs progress "nombre"` — marcar en progreso
- `node scripts/notion-task-action.mjs done "nombre"` — marcar como lista

### Coordination Files
- `MASTER_PLAN.md` — Plan estratégico 4 fases
- `AGENT_HIVE.md` — Daily updates, Q&A, knowledge sharing
- `KNOWLEDGE_BASE.md` — Este archivo

---

*Última actualización: 2026-03-31*
*Sesión: 61 tareas completadas, 20+ commits, 50+ archivos modificados*
