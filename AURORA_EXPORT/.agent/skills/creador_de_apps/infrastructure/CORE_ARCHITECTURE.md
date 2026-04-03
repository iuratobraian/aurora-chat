# Core Architecture: TradeStack

Nuestra infraestructura probada para aplicaciones escalables y eficientes.

## Stack Tecnológico (SOT)

- **Framework**: Vite + React 18+
- **Backend (Serverless DB)**: Convex
  - Queries para suscripciones en tiempo real
  - Mutations para escrituras
  - Auth con validación de tokens
- **Relay/Internal Server**: Node.js + Express
  - Webhooks externos (pagos, OAuth, redes sociales)
  - Procesamiento pesado o tareas programadas
- **Estilos**: Vanilla CSS con variables CSS (Obsidian Ether)

## Stack Completo Visual

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  FRONTEND       │     │  CONVEX CLOUD    │     │  EXPRESS RELAY   │
│  Vite + React   │────▶│  Queries/Mutations│────▶│  Node.js        │
│  Vercel         │     │  Real-time DB    │     │  Railway/Render │
│  CSS Variables  │     │  Auth            │     │  Webhooks       │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## Patrones Reusables

### 1. Service Layer
Separar la lógica de negocio de los componentes UI en `services/`.

```
Component → Hook → Service → Convex / API Express
```

### 2. Autonomous Sync
Uso de SyncManager para operaciones offline-first. Convex queries son real-time por defecto.

### 3. Trust-Based Ranking
Algoritmos de ordenamiento basados en reputación y engagement (heredado de TradePortal).

### 4. Security
- Middleware `requireAuth` centralizado en Express
- Validación de tokens en Convex
- Verificación de firma en webhooks con `crypto.timingSafeEqual`
- Rate limiting en todos los endpoints públicos
- CORS con lista blanca de origins

## Estructura de Proyecto Estándar

```
mi-app/
├── convex/           # Backend serverless
│   ├── schema.ts     # Tablas e índices
│   ├── auth.ts       # Auth handlers
│   └── *.ts          # Queries y mutations
├── server/           # Express relay
│   ├── index.ts      # Entry point
│   ├── routes/       # Routers por dominio
│   └── middleware/   # Auth, logging, rate limit
├── src/
│   ├── components/   # Componentes React
│   ├── views/        # Vistas/páginas
│   ├── hooks/        # Custom hooks
│   ├── services/     # Service layer
│   └── lib/          # Utilidades
├── styles/           # CSS (Obsidian Ether)
└── .env.example     # Variables template
```

## Patrón de Convex

### Schema
```typescript
export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
  }).index('by_email', ['email']),
});
```

### Query
```typescript
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('tabla').take(100);
  },
});
```

### Mutation
```typescript
export const create = mutation({
  args: { title: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');
    return await ctx.db.insert('tabla', { title: args.title });
  },
});
```

## Patrón de Express

```typescript
const app = express();

// Raw body para webhooks (antes de json)
app.use('/webhooks', express.raw({ type: '*/*' }), webhookRouter);

app.use(cors({ origin: ALLOWED_ORIGINS }));
app.use(express.json());
app.use(requestLogger);
app.use(rateLimiter);
app.use('/api', requireInternalAuth, apiRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});
```

## Despliegue

| Capa | Plataforma | Notas |
|------|-----------|-------|
| Frontend | Vercel | Deploy automático, variables `VITE_*` |
| Backend Express | Railway / Render | `node dist/index.js`, health check |
| DB | Convex Cloud | `npx convex deploy` |

## Variables Obligatorias por Capa

**Frontend (Vercel):**
- `VITE_CONVEX_URL`
- `VITE_APP_NAME`

**Backend Express (Railway):**
- `PORT` (auto)
- `NODE_ENV`
- `ALLOWED_ORIGINS`
- `INTERNAL_API_SHARED_KEY`
- `CONVEX_HTTP_URL`
- `MP_WEBHOOK_SECRET` (si aplica)
- Provider API keys

## Accesibilidad y Estilos

- **Obsidian Ether** como sistema de diseño base
- Tokens en CSS variables (bg, accent, text, spacing, radius, shadow)
- Glassmorphism para cards y modals
- Mobile-first, responsive real
- Accesibilidad: contraste WCAG AA mínimo, focus visible

## Reglas de Seguridad

1. Nunca confiar en `userId` del cliente — resolver desde auth token
2. Rate limiting en todos los endpoints públicos
3. Verificar firma de webhooks antes de procesar
4. No exponer claves en logs
5. CORS lista blanca, nunca `*` en producción
6. No guardar secretos en código — variables de entorno

## Documentación Relacionada

- Spec completa: `TRADESTACK_SPEC.md`
- UX/Design: `../experience/UX_DESIGN_PRINCIPLES.md`
- Saboteador como ejemplo: `../plans/saboteador_invisible_plan.md`
