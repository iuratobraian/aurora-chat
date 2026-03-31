# Security Hardening — Arquitectura

## Amenazas actuales

| Amenaza | Severidad | Estado actual | Mitigación |
|---|---|---|---|
| XSS → token theft | Alta | Auth tokens en localStorage | Migrar a httpOnly cookies (P1) |
| API sin auth | Alta | 8+ endpoints sin autenticación | Implementar auth middleware |
| Webhook spoofing | Alta | Sin verificación de firma | Verificar firma de cada provider |
| CSP muy permisivo | Media | `unsafe-inline` + `unsafe-emit` | Mantener por ahora, hardenear después |
| Env vars expuestas | Media | VITE_* en server (ya corregido) | ✅ SEC-002 completado |
| Inyección NoSQL | Media | Sin sanitización de inputs | Validar y sanitizar todos los inputs |
| DoS sin rate limit | Media | Sin rate limiting | Agregar rate limiter |

## Guardas mínimas implementadas

| Guarda | Archivo | Estado |
|---|---|---|
| CSP headers | vercel.json, vite.config.ts | ✅ Presente |
| X-Content-Type-Options | vercel.json | ✅ `nosniff` |
| X-Frame-Options | vercel.json | ✅ `SAMEORIGIN` |
| X-XSS-Protection | vercel.json | ✅ `1; mode=block` |
| Referrer-Policy | vercel.json | ✅ `strict-origin-when-cross-origin` |
| Permissions-Policy | vercel.json | ✅ Cámara, mic, geo deshabilitados |
| Request ID | server.ts | ✅ UUID por request |
| Structured logging | serverLogger.ts | ✅ Timestamps + niveles |

## Guardas faltantes (prioridad)

### P0 — Implementar antes de launch
1. **Auth middleware en server.ts** — proteger endpoints sensibles (ver AUTH_ARCHITECTURE.md)
2. **Webhook signature verification** — verificar firma de MercadoPago y Zenobank (ver PAYMENT_HARDENING.md)
3. **Rate limiting** — `express-rate-limit` en endpoints públicos
4. **Input validation** — validar body de todos los POST endpoints

### P1 — Primer mes post-launch
5. **Helmet.js** — headers de seguridad automáticos
6. **CORS restrictivo** — solo permitir dominios conocidos
7. **HTTPS redirect** — forzar HTTPS en Express
8. **Cookie-based auth** — migrar de localStorage a httpOnly cookies

### P2 — Cuando haya tiempo
9. **WAF** — Cloudflare o similar
10. **Audit log** — log de acciones sensibles
11. **Penetration testing** — escaneo de vulnerabilidades

## Decisión de runtime

Ver `RUNTIME_DECISION.md`. Express server independiente de Vercel.

## CSP actual

La CSP está definida en dos lugares:
- `vercel.json` — para producción en Vercel (frontend)
- `vite.config.ts` — para desarrollo local

Ambas deben mantenerse sincronizadas. La CSP permite:
- `unsafe-inline` y `unsafe-eval` en scripts (necesario para React/Vite)
- Google Fonts, Google Auth, Sentry, Convex, TradingView, Cloudinary

**No se puede hardenear CSP sin romper la app actual.** Mantener hasta que se refactorice.

## Headers recomendados para Express

```typescript
// Agregar a server.ts cuando se use Helmet o manualmente
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
```

## Checklist pre-deploy

- [ ] Auth en endpoints sensibles
- [ ] Webhook signature verification
- [ ] Rate limiting en /api/*
- [ ] Input validation en POST endpoints
- [ ] Env vars server-side configuradas (APP_URL, CONVEX_URL, FRONTEND_URL)
- [ ] CORS restrictivo
- [ ] Logs de errores activos
