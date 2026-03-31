# Environment Variables

## Regla

**`VITE_*` = browser. Sin prefijo = server.** Nunca poner claves secretas en vars con prefijo `VITE_`.

## Por qué

Vite reemplaza `import.meta.env.VITE_*` en el bundle del cliente. Cualquier secret en una var `VITE_*` queda expuesto en el JavaScript que llega al navegador.

## Mapeo browser → server

| Browser (VITE_*) | Server (sin prefijo) | Propósito |
|---|---|---|
| `VITE_CONVEX_URL` | `CONVEX_URL` | URL de instancia Convex |
| `VITE_APP_URL` | `APP_URL` | URL pública de la app |
| `VITE_API_URL` | — | URL de API (solo browser, compuesta de APP_URL) |
| `VITE_FRONTEND_URL` | `FRONTEND_URL` | URL para redirects del servidor |
| `VITE_MERCADOPAGO_PUBLIC_KEY` | — | Key pública (solo browser, ok) |
| `VITE_IMGBB_API_KEY` | — | Key de ImgBB (solo browser, ok) |
| `VITE_SENTRY_DSN` | — | DSN público de Sentry (solo browser, ok) |

## Dónde se usa cada una

### Browser (`import.meta.env.VITE_*`)
- `src/config/urls.ts` — fuente única de URLs para el cliente
- `src/config.ts` — re-exporta de urls.ts
- `components/SEO.tsx` — canonical URL
- `services/*` — ConvexHttpClient para queries del cliente

### Server (`process.env.*`)
- `server.ts` — Express endpoints, webhooks, Instagram, AI relay
- `convex/lib/mercadopago.ts` — pagos (Convex functions)
- `convex/lib/zenobank.ts` — pagos (Convex functions)

## Reglas para nuevas vars

1. Si la necesita el browser → `VITE_` prefijo, sin secretos.
2. Si la necesita solo el server → sin prefijo, nunca `VITE_`.
3. Si la necesitan ambos → crear dos vars (`VITE_X` + `X`) con el mismo valor.
4. Nunca hardcodear un fallback de producción en el código.

## Vars que NO deberían existir como VITE_*

Estas están fuera de scope de esta tarea (convex/) pero documentadas para referencia:

| Var actual | Problema | Archivo |
|---|---|---|
| `VITE_APP_URL` en `convex/lib/mercadopago.ts` | Convex functions son server-side, no necesitan VITE_ | convex/lib/mercadopago.ts |
| `VITE_API_URL` en `convex/lib/zenobank.ts` | Idem | convex/lib/zenobank.ts |
