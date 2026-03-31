# Release Checklist - TradePortal

## Pre-Build

- [ ] **Dependencias actualizadas**: `npm run lint` pasa sin errores
- [ ] **TypeScript**: `npx tsc --noEmit` sin errores
- [ ] **Tests**: `npm run test` pasa (>60% coverage)
- [ ] **Build**: `npm run build` exitoso

## Pre-Deploy

- [ ] **Variables de entorno**: `.env` correcto para producción
- [ ] **CSP**: Headers configurados en vite.config.ts + vercel.json
- [ ] **Sentry**: DSN configurado si está habilitado
- [ ] **Convex**: `npx convex deploy` exitoso

## Smoke Tests (Manual)

### Autenticación
- [ ] Login con email/contraseña funciona
- [ ] Login con Google funciona
- [ ] Logout limpia sesión correctamente
- [ ] Sesión persiste tras refresh

### Navegación
- [ ] Dashboard carga sin errores
- [ ] Comunidad feed carga posts
- [ ] Perfil muestra datos del usuario
- [ ] Pricing muestra planes correctamente

### Interacciones
- [ ] Crear post funciona
- [ ] Like/Unlike funciona
- [ ] Chat enví­a mensajes
- [ ] Navigation entre tabs funciona

### Responsive
- [ ] Mobile: menú hamburguesa funciona
- [ ] Tablet: layout adapta correctamente
- [ ] Desktop: sin overflow horizontal

### Errores
- [ ] Console sin errores rojos
- [ ] Fallbacks de ErrorBoundary funcionan
- [ ] Loading states visibles

## Post-Deploy

- [ ] Verificar producción: `https://tradeportal-2025-platinum.vercel.app`
- [ ] Build succeeded en Vercel
- [ ] No hay errores en Sentry (si está configurado)
- [ ] SEO meta tags presentes

---

## Quick Run Commands

```bash
# Full QA
npm run lint && npx tsc --noEmit && npm run build

# Deploy
npx convex deploy
```

**Última actualización**: 2026-03-20