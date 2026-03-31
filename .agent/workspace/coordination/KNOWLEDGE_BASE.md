# 🧠 KNOWLEDGE BASE — TradeShare

> **Propósito:** Documentar soluciones, patrones y aprendizajes para que cualquier agente pueda resolver rápido sin reinventar.

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

---

## 💳 Payments

### MercadoPago Integration
- **Patrón:** Crear preference → redirect a checkout → webhook confirma pago
- **Files:** `convex/mercadopagoApi.ts`, `server.ts` (webhook handler)
- **Endpoint:** `POST /api/mercadopago/preference`, `POST /webhooks/mercadopago`
- **Notas:** ⚠️ Webhook necesita `express.raw()` antes de `express.json()`

### Subscription Flow
- **Patrón:** Usuario elige plan → crea preference MP → webhook activa suscripción
- **Files:** `convex/subscriptions.ts`, `convex/payments.ts`
- **Notas:** Verificar que webhook actualice estado correctamente

---

## 🏘️ Communities

### Community Creation
- **Patrón:** Formulario → Convex mutation → crea registro en `communities`
- **Files:** `convex/communities.ts`
- **Notas:** Solo usuarios autenticados pueden crear

### Access Control
- **Patrón:** Verificar suscripción antes de permitir acceso
- **Files:** `convex/communities.ts`, `convex/subscriptions.ts`
- **Notas:** ⚠️ Implementar middleware de verificación de acceso

---

## 📝 Posts & Comments

### Post Creation
- **Patrón:** Formulario → Convex mutation → crea en `posts` → notifica seguidores
- **Files:** `convex/posts.ts`
- **Notas:** Verificar permisos antes de crear

### Comments System
- **Patrón:** Comentarios anidados almacenados como array en post
- **Files:** `convex/posts.ts`
- **Notas:** Considerar mover a tabla separada si crece mucho

---

## 🎨 UI Patterns

### Glassmorphism Components
- **Patrón:** `backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl`
- **Files:** `src/index.css` (clases glass)
- **Uso:** Cards, modals, overlays

### Loading States
- **Patrón:** `ElectricLoader` component con frases de trading
- **Files:** `src/components/ElectricLoader.tsx`
- **Uso:** Suspense fallbacks, initial load

### Error Boundaries
- **Patrón:** Wrap cada sección con `ErrorBoundary` con fallback específico
- **Files:** `src/components/ErrorBoundary.tsx`
- **Uso:** Prevenir crash total de la app

---

## ⚡ Performance

### Code Splitting
- **Patrón:** `lazy(() => import('./views/...'))` para todas las vistas
- **Files:** `src/App.tsx`
- **Notas:** Todas las vistas están lazy-loaded

### Convex Queries
- **Patrón:** Usar `useQuery` con pagination, evitar queries innecesarios
- **Files:** Todos los componentes que usan Convex
- **Notas:** ⚠️ 81 usos de `v.any()` en schema — reducir para type safety

---

## 🔧 Common Fixes

### Merge Conflicts
- **Comando:** `grep -rn "<<<<<<" src/` para encontrar conflictos
- **Notas:** Siempre verificar después de git pull

### Convex _generated Missing
- **Solución:** `npx convex deploy` para regenerar tipos
- **Notas:** Necesita CONVEX_DEPLOY_KEY configurado

### npm audit vulnerabilities
- **Comando:** `npm audit fix` (safe), `npm audit fix --force` (breaking)
- **Notas:** Revisar cambios antes de commitear

---

## 📋 Checklist Pre-Commit

- [ ] `npm run lint` pasa
- [ ] No hay merge conflicts
- [ ] No hay console.log de debug
- [ ] No hay secrets hardcodeados
- [ ] Archivos prohibidos no fueron tocados
- [ ] Documentado en AGENT_HIVE.md

---

*Última actualización: 2026-03-31*
