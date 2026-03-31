# Runtime Decision — API y Webhooks

## Estado actual

| Componente | Runtime | Dónde corre | Puerto |
|---|---|---|---|
| Frontend (SPA) | Vercel (Vite static) | Vercel CDN | 443 (HTTPS) |
| API + Webhooks | Express custom server | `server.ts` | 3000 |
| Backend de datos | Convex | Convex cloud | managed |
| WebSocket | `ws` sobre Express | `server.ts` | 3000 |

## Problema

**Vercel NO ejecuta `server.ts`.** El `vercel.json` actual solo sirve el frontend estático con un rewrite SPA. Todos los endpoints `/api/*` y `/webhooks/*` del Express server corren en un proceso separado (manual o via `npm run dev`).

Esto significa:
- En producción (Vercel), los webhooks de MercadoPago/Zenobank no llegan a ningún lado.
- Los endpoints de Instagram, AI relay y health check no están disponibles.
- WebSocket no funciona en Vercel.

## Decisión

### Runtime oficial: Express server separado

El backend (API + webhooks + WebSocket) corre en un **servidor Express independiente** de Vercel. Opciones:

| Opción | Pros | Contras |
|---|---|---|
| **A. Railway / Render / Fly.io** | WebSocket nativo, persistencia de proceso, env vars server-side | Costo (~$5-7/mes), deploy separado |
| **B. Vercel Functions** | Un solo deploy, serverless | Sin WebSocket, cold starts, límite de ejecución |
| **C. VPS (DigitalOcean / Hetzner)** | Control total, barato | Mantenimiento manual |

**Recomendación: Opción A (Railway o Render)** — WebSocket funciona, proceso persistente, env vars server-side limpias.

## Inventario de endpoints

### API (Express en server.ts)

| Ruta | Método | Auth | Body | Propósito |
|---|---|---|---|---|
| `/api/health` | GET | Pública | — | Health check |
| `/api/ai/providers` | GET | Pública | — | Lista providers IA (sin keys) |
| `/api/notification-click` | POST | Pública | `{notificationId, action, timestamp}` | Tracking clicks push |
| `/api/mercadopago/preference` | POST | Pública | `{userId, amount, description, plan, courseId}` | Crear preferencia MP |
| `/api/zenobank/payment` | POST | Pública | `{userId, amount, currency, email, description}` | Procesar pago Zenobank |
| `/api/instagram/auth-url` | GET | Pública | — | URL OAuth Instagram |
| `/api/instagram/callback` | GET | Pública (OAuth) | — | Callback OAuth |
| `/api/instagram/publish` | POST | `userId` body | `{userId, postId}` | Publicar en IG |
| `/api/ai/generate-caption` | POST | Pública | `{topic, context, language}` | Generar caption IA |
| `/api/ai/external/chat` | POST | `x-internal-api-key` header | `{messages, model, ...}` | Chat IA externo |

### Webhooks (Express en server.ts)

| Ruta | Método | Fuente | Propósito |
|---|---|---|---|
| `/webhooks/mercadopago` | POST | MercadoPago | Callback de pagos |
| `/webhooks/zenobank` | POST | Zenobank | Callback de pagos |

### WebSocket (ws sobre server.ts)

| Evento | Dirección | Propósito |
|---|---|---|
| Conexión | Client→Server | Init con posts, ads, users |
| `post:create/update/delete` | Client→Server | CRUD posts en tiempo real |
| `ad:save/delete` | Client→Server | CRUD ads |
| `user:save` | Client→Server | Update usuario |
| Broadcast | Server→All | Sync de cambios |

## Estrategia de deploy

```
┌─────────────┐     ┌─────────────────┐     ┌──────────────┐
│   Vercel    │     │  Railway/Render │     │   Convex     │
│  (Frontend) │────▶│  (Express API)  │────▶│  (Database)  │
│  Vite SPA   │     │  + WebSocket    │     │  + Functions │
└─────────────┘     └─────────────────┘     └──────────────┘
       │                     │
       │              ┌──────┴──────┐
       │              │  Webhooks   │
       │              │  MercadoPago│
       │              │  Zenobank   │
       │              └─────────────┘
       │
  ┌────┴────┐
  │  Users  │
  │ Browser │
  └─────────┘
```

## Configuración requerida

### Vercel (Frontend)
- `VITE_CONVEX_URL` — URL de Convex
- `VITE_APP_URL` — URL pública de la app en Vercel
- `VITE_API_URL` — URL del Express server (ej: `https://api.tradeportal.io/api`)

### Railway/Render (Backend Express)
- `PORT` — Puerto (Railway/Render lo proveen via env, server.ts usa `process.env.PORT || 3000`)
- `APP_URL` — URL pública del Express server
- `CONVEX_URL` — URL de Convex
- `FRONTEND_URL` — URL de Vercel para redirects
- Todas las vars server-side de `.env.example`

### Convex
- `CONVEX_DEPLOYMENT`
- Variables de payment providers

## Estado de preparación para deploy

| Componente | Estado |
|---|---|
| server.ts PORT configurable | ✅ Listo (`process.env.PORT`) |
| WebSocket sobre Express | ✅ Implementado |
| Health check `/api/health` | ✅ Implementado |
| Webhooks con firma + idempotencia | ✅ Implementado (PAY-002, PAY-003) |
| Rate limiter AI | ✅ Implementado |
| Idempotencia webhooks | ✅ Implementado |

## Qué falta ejecutar

1. Deploy de `server.ts` a Railway/Render
2. Configurar dominio custom para API (ej: `api.tradeportal.io`)
3. Actualizar `VITE_API_URL` en Vercel para apuntar al Express server
4. Configurar webhooks de MercadoPago/Zenoback para apuntar al Express server
5. Verificar WebSocket conecta desde el frontend
