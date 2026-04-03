# TradeStack — Especificación Técnica

Especificación canónica para crear apps profesionales usando la infraestructura del proyecto. Toda nueva app del Creador de Apps debe seguir este documento como base.

## Índice

1. [Stack Completo](#1-stack-completo)
2. [Estructura de Proyecto](#2-estructura-de-proyecto)
3. [Convex: DB, Queries y Mutations](#3-convex-db-queries-y-mutations)
4. [Express: Relay y Webhooks](#4-express-relay-y-webhooks)
5. [Frontend: React + Vite](#5-frontend-react--vite)
6. [Estado y Datos](#6-estado-y-datos)
7. [Seguridad](#7-seguridad)
8. [Estilos: Obsidian Ether](#8-estilos-obsidian-ether)
9. [Despliegue](#9-despliegue)
10. [Checklist de Lanzamiento](#10-checklist-de-lanzamiento)

---

## 1. Stack Completo

```
┌──────────────────────────────────────────────────────────┐
│                    FRONTEND                               │
│  Vite + React 18+ → Vercel / Netlify                    │
│  Vanilla CSS + CSS Variables (Obsidian Ether)             │
└──────────────────────────────────────────────────────────┘
                            ↕
┌──────────────────────────────────────────────────────────┐
│                    CONVEX CLOUD                           │
│  Queries (lectura real-time)                             │
│  Mutations (escritura)                                   │
│  Auth (Convex Auth)                                     │
└──────────────────────────────────────────────────────────┘
                            ↕
┌──────────────────────────────────────────────────────────┐
│                    EXPRESS RELAY                          │
│  Node.js + Express → Railway / Render                   │
│  Webhooks (pagos, OAuth, redes sociales)                  │
│  Tasks programadas (cron, backup, sync)                  │
└──────────────────────────────────────────────────────────┘
```

---

## 2. Estructura de Proyecto

```
mi-app/
├── convex/                  # Backend serverless (Convex)
│   ├── schema.ts           # Definición de tablas
│   ├── auth.ts             # Auth handlers
│   ├── *.ts                # Queries y mutations
│   └── _generated/         # No tocar
├── server/
│   ├── index.ts            # Entry point Express
│   ├── routes/             # Routers por dominio
│   │   ├── webhooks/       # Handlers de webhook
│   │   └── api/            # Endpoints internos
│   ├── middleware/         # Auth, logging, rate limit
│   └── lib/                # Helpers, clients
├── src/
│   ├── components/         # Componentes React
│   │   ├── ui/             # Componentes base
│   │   └── [feature]/      # Por feature
│   ├── views/              # Vistas/páginas
│   ├── hooks/              # Custom hooks
│   ├── services/           # Service layer
│   │   ├── api/            # Llamadas a Express
│   │   └── convex/         # Queries y mutations
│   ├── lib/                # Utilidades
│   ├── types/              # Tipos compartidos
│   ├── App.tsx             # Router principal
│   └── main.tsx            # Entry point
├── public/                 # Assets estáticos
├── styles/                 # CSS global
│   ├── variables.css       # Tokens de diseño
│   └── global.css          # Reset y base
├── .env.example            # Variables de ejemplo
├── .env.local              # Variables locales (no commitear)
├── convex.json             # Config Convex
├── vite.config.ts          # Config Vite
├── tsconfig.json           # Config TypeScript
└── package.json
```

---

## 3. Convex: DB, Queries y Mutations

### Schema

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    externalId: v.string(), // ID del proveedor OAuth
    createdAt: v.number(),
  }).index('by_email', ['email'])
    .index('by_external', ['externalId']),

  sessions: defineTable({
    userId: v.id('users'),
    token: v.string(),
    expiresAt: v.number(),
  }).index('by_token', ['token']),

  // Agregar tablas específicas de la app
});
```

### Queries (lectura)

```typescript
// convex/queries.ts
import { query } from './_generated/server';
import { v } from 'convex/values';

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('tabla').take(100);
  },
});

export const getById = query({
  args: { id: v.id('tabla') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
```

### Mutations (escritura)

```typescript
// convex/mutations.ts
import { mutation } from './_generated/server';
import { v } from 'convex/values';

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');

    const id = await ctx.db.insert('tabla', {
      title: args.title,
      description: args.description,
      createdBy: identity.subject,
      createdAt: Date.now(),
    });
    return id;
  },
});
```

### Auth

```typescript
// convex/auth.ts
import { mutation } from './_generated/server';

export const handleOAuthCallback = mutation({
  args: { provider: v.string(), token: v.string() },
  handler: async (ctx, args) => {
    // Validar token con provider
    // Crear o actualizar usuario en ctx.db
    // Devolver sesión
  },
});
```

### Reglas

- Queries: `take(100)` máximo, usar índices para filtrar
- Mutations: siempre validar `ctx.auth.getUserIdentity()` primero
- No guardar secretos en Convex (variables de entorno de Express)
- Usar `v.optional()` cuando un campo puede ser null
- Timestamps: guardar como `number` (Date.now()), no como string

---

## 4. Express: Relay y Webhooks

### Entry Point

```typescript
// server/index.ts
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import webhookRouter from './routes/webhooks';
import apiRouter from './routes/api';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/logger';
import { rateLimiter } from './middleware/rateLimiter';
import { requireInternalAuth } from './middleware/auth';

const app = express();

// Raw body para webhooks (antes de json parser)
app.use('/webhooks', express.raw({ type: '*/*' }), webhookRouter);

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') ?? [],
  credentials: true,
}));
app.use(express.json());
app.use(requestLogger);
app.use(rateLimiter);

app.use('/api', requireInternalAuth, apiRouter);

// Health check público
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.use(errorHandler);

const PORT = parseInt(process.env.PORT ?? '3001', 10);
createServer(app).listen(PORT, '0.0.0.0', () => {
  console.log(`[${new Date().toISOString()}] Server running on port ${PORT}`);
});
```

### Webhook Handler

```typescript
// server/routes/webhooks/payments.ts
import { Router } from 'express';
import crypto from 'crypto';

const router = Router();

// MercadoPago
router.post('/mercadopago', async (req, res) => {
  try {
    const signature = req.headers['x-signature'] as string;
    const body = req.body; // Raw body ya parseado

    // Verificar firma
    const expected = crypto
      .createHmac('sha256', process.env.MP_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = JSON.parse(body.toString());
    // Procesar evento...
    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

export default router;
```

### Middleware de Auth

```typescript
// server/middleware/auth.ts
export function requireInternalAuth(req: Request, res: Response, next: NextFunction) {
  const key = req.headers['x-internal-api-key'];
  if (key !== process.env.INTERNAL_API_SHARED_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}
```

### Variables de Entorno Requeridas

```env
# Server
PORT=3001
NODE_ENV=production
ALLOWED_ORIGINS=https://mi-app.vercel.app

# Auth
INTERNAL_API_SHARED_KEY=generated-secret

# Convex
CONVEX_DEPLOYMENT=production
CONVEX_HTTP_URL=https://actual-deployment.convex.cloud

# Webhooks
MP_WEBHOOK_SECRET=
ZENOBANK_WEBHOOK_SECRET=

# Providers
OPENAI_API_KEY=
```

### Reglas

- Siempre usar `express.raw()` para webhooks antes de `express.json()`
- Verificar firma con `crypto.timingSafeEqual`, nunca con `===`
- Rate limiting en todos los endpoints públicos
- Logs con timestamps y requestId
- No exponer claves en logs

---

## 5. Frontend: React + Vite

### Vite Config

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { convexVite } from 'convex-vite';

export default defineConfig({
  plugins: [
    react(),
    convexVite(),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});
```

### App Router

```typescript
// src/App.tsx
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

export default function App() {
  return (
    <ConvexProvider client={convex}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </BrowserRouter>
    </ConvexProvider>
  );
}
```

### Variables de Entorno Frontend

```env
# .env.example
VITE_CONVEX_URL=https://actual-deployment.convex.cloud
VITE_APP_NAME=MiApp
```

---

## 6. Estado y Datos

### Service Layer Pattern

```
Component → Hook → Service → Convex / API
```

```typescript
// services/tablaService.ts
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

export function useTablaList() {
  return useQuery(api.tabla.list);
}

export function useCreateTabla() {
  return useMutation(api.tabla.create);
}
```

### Offline-First

- Convex queries son real-time por defecto — no necesita estado manual
- Para persistencia local: usar `localStorage` solo para cache, nunca como source of truth
- SyncManager para coordinar writes entre local y Convex

---

## 7. Seguridad

### Reglas

1. **Nunca confiar en `userId` del cliente** — siempre resolver desde auth token
2. **Validar inputs** — usar schema validation (zod o `v` de Convex) en todo endpoint
3. **CORS** — lista blanca de origins exactos, nunca `*` en producción
4. **Rate limiting** — proteger todos los endpoints públicos
5. **Secrets** — nunca en código, solo en variables de entorno de Railway/Render
6. **Webhooks** — verificar firma antes de procesar

---

## 8. Estilos: Obsidian Ether

Tokens base en `variables.css`:

```css
:root {
  /* Fondo */
  --bg-primary: #0a0a0b;
  --bg-secondary: #111113;
  --bg-elevated: #1a1a1d;
  --bg-glass: rgba(26, 26, 29, 0.8);

  /* Acentos */
  --accent-primary: #2563eb;
  --accent-secondary: #3b82f6;
  --accent-success: #00ff94;
  --accent-danger: #ff003c;
  --accent-warning: #ffd700;

  /* Texto */
  --text-primary: #f4f4f5;
  --text-secondary: #a1a1aa;
  --text-muted: #52525b;

  /* Espaciado */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-4: 1rem;
  --space-8: 2rem;

  /* Border */
  --border-subtle: rgba(255, 255, 255, 0.06);
  --border-default: rgba(255, 255, 255, 0.1);
  --border-active: rgba(37, 99, 235, 0.5);

  /* Radius */
  --radius-sm: 0.5rem;
  --radius-md: 1rem;
  --radius-lg: 1.5rem;

  /* Glassmorphism */
  --glass-blur: blur(16px);
  --glass-bg: rgba(26, 26, 29, 0.85);

  /* Shadow */
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.4);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.5);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.6);
  --shadow-glow: 0 0 20px rgba(37, 99, 235, 0.3);
}
```

Componente Card base:

```css
.card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
}
```

---

## 9. Despliegue

### Frontend (Vercel)

1. Conectar repo en Vercel
2. Configurar variables de entorno:
   - `VITE_CONVEX_URL` → URL del deployment Convex
   - `VITE_APP_NAME` → nombre de la app
3. Deploy automático en push a `main`

### Backend Express (Railway)

1. Crear proyecto en Railway
2. Conectar repo, setear root como `server/`
3. Configurar start command: `node dist/index.js`
4. Variables de entorno:
   - Todas las de la sección 4
   - `PORT` (Railway lo setea automáticamente)
5. Health check: `GET /health`

### Base de Datos (Convex)

1. `npx convex dev` para desarrollo local
2. `npx convex deploy` para subir a producción
3. Deployment URL → setear en `VITE_CONVEX_URL` y `CONVEX_HTTP_URL`

### Dominio Personalizado (opcional)

- Vercel: agregar dominio en project settings
- Railway: configurar en networking → generate subdomain

---

## 10. Checklist de Lanzamiento

- [ ] Schema de Convex definido con índices
- [ ] Auth implementado (Convex Auth o externo)
- [ ] Todas las mutations validan identidad
- [ ] Webhooks con verificación de firma
- [ ] Rate limiting activo
- [ ] CORS con origins en lista blanca
- [ ] `.env.example` actualizado
- [ ] Variables de entorno en Vercel y Railway
- [ ] Health check responde 200
- [ ] Lint pasa: `tsc --noEmit`
- [ ] Build pasa: `npm run build`
- [ ] No hay secretos en código
- [ ] CSS variables de Obsidian Ether aplicadas
- [ ] Responsive (mobile-first)
- [ ] Error boundaries en React

---

## Metadata

- **Creado:** 2026-03-22
- **Versión:** 1.0
- **Stack:** Vite + React + Convex + Express + Vanilla CSS
- **Obsoleto:** nunca — actualizar en lugar de reemplazar
