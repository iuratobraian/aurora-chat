# Auth Architecture — Server-side Authorization

## Problema actual

Los endpoints críticos del servidor confían en datos del cliente:

| Endpoint | Auth actual | Riesgo |
|---|---|---|
| `/api/instagram/publish` | `userId` en body | Cualquiera puede publicar como otro usuario |
| `/api/mercadopago/preference` | `userId` en body | Cualquiera puede crear pagos para otro |
| `/api/zenobank/payment` | `userId` en body | Idem |
| `/api/ai/external/chat` | `x-internal-api-key` header | ✅ Protegido (si está configurado) |
| `/api/notification-click` | Ninguna | Bajo riesgo (tracking anónimo) |
| `/api/ai/providers` | Ninguna | Bajo riesgo (solo lectura) |
| Webhooks | Ver firma | Ver PAYMENT_HARDENING.md |

## Propuesta

### Capa de auth middleware

```typescript
interface AuthenticatedRequest extends Request {
  userId?: string;
  userRole?: string;
}

async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }
  
  try {
    // Validar contra Convex o JWT
    const session = await validateSession(token);
    if (!session) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }
    req.userId = session.userId;
    req.userRole = session.role;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Error de autenticación' });
  }
}

async function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  await requireAuth(req, res, () => {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    next();
  });
}
```

### Clasificación de endpoints

| Endpoint | Auth level | Justificación |
|---|---|---|
| `GET /api/health` | Pública | Health check |
| `GET /api/ai/providers` | Pública | Info pública |
| `POST /api/notification-click` | Pública | Tracking anónimo |
| `POST /api/mercadopago/preference` | `requireAuth` | Crear pago requiere usuario |
| `POST /api/zenobank/payment` | `requireAuth` | Crear pago requiere usuario |
| `GET /api/instagram/auth-url` | `requireAuth` | Conectar cuenta propia |
| `GET /api/instagram/callback` | Pública (OAuth) | Callback de OAuth |
| `POST /api/instagram/publish` | `requireAuth` | Publicar en cuenta propia |
| `POST /api/ai/generate-caption` | `requireAuth` | Usar IA |
| `POST /api/ai/external/chat` | `requireAuth` + key | Chat IA protegido |
| `POST /webhooks/*` | Ver firma (ver PAYMENT_HARDENING.md) | Callbacks de providers |

### Validación de sesión

Opción A: Validar token contra Convex
```typescript
async function validateSession(token: string) {
  const convex = new ConvexHttpClient(CONVEX_URL);
  return await convex.query(api.auth.validateSession, { token });
}
```

Opción B: JWT firmado por el servidor
```typescript
import jwt from 'jsonwebtoken';

function validateSession(token: string) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; role: string };
  } catch {
    return null;
  }
}
```

**Recomendación:** Opción A (Convex) para mantener un solo sistema de auth.

## Validación de inputs

Cada endpoint POST debe validar su body:

```typescript
import { z } from 'zod'; // o validación manual

const CreatePreferenceSchema = z.object({
  userId: z.string().min(1),
  amount: z.number().positive(),
  description: z.string().min(1).max(500),
  plan: z.string().optional(),
  courseId: z.string().optional(),
});

app.post('/api/mercadopago/preference', requireAuth, (req, res) => {
  const parsed = CreatePreferenceSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Body inválido', details: parsed.error.issues });
  }
  // req.userId viene del middleware, NO del body
  // parsed.data.amount, parsed.data.description, etc.
});
```

## Qué NO hacer

- ❌ No confiar en `userId` del body del request
- ❌ No enviar tokens en query params (`?token=xxx`)
- ❌ No loggear tokens en producción
- ❌ No hardcodear credenciales de admin

## Checklist

- [ ] Implementar `requireAuth` middleware
- [ ] Aplicar a endpoints de pagos
- [ ] Aplicar a endpoints de Instagram
- [ ] Aplicar a endpoint de AI chat
- [ ] Validar body de todos los POST endpoints
- [ ] Test: llamar endpoint sin token → 401
- [ ] Test: llamar endpoint con token inválido → 401
- [ ] Test: llamar endpoint de otro usuario → 401
