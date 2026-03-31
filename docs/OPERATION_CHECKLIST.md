# Operation Checklist

## Pre-deploy smoke tests

Ejecutar estos checks antes de cualquier release. Si alguno falla, el deploy se bloquea.

### 1. Health endpoint

```bash
curl -s http://localhost:3000/api/health | jq .
```

Esperado: `{"status":"ok","clients":0,"requestId":"<uuid>"}`

Verificar: el header `x-request-id` está presente en la respuesta.

### 2. Request ID trazabilidad

```bash
curl -s -D- http://localhost:3000/api/health 2>&1 | grep x-request-id
```

Esperado: `x-request-id: <uuid>`

### 3. Webhook MercadoPago acepta POST

```bash
curl -s -X POST http://localhost:3000/webhooks/mercadopago \
  -H "Content-Type: application/json" \
  -d '{"test":true}' | jq .
```

Esperado: `{"received":true}`

### 4. Webhook Zenobank acepta POST

```bash
curl -s -X POST http://localhost:3000/webhooks/zenobank \
  -H "Content-Type: application/json" \
  -d '{"test":true}' | jq .
```

Esperado: `{"received":true}`

### 5. AI relay protegido

```bash
curl -s -X POST http://localhost:3000/api/ai/external/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"test"}]}' | jq .
```

Esperado: `401 Unauthorized` si `INTERNAL_API_KEY` está configurado, o `500` si no hay providers.

### 6. Instagram auth URL

```bash
curl -s http://localhost:3000/api/instagram/auth-url | jq .
```

Esperado: respuesta con `url` o error controlado (no crash).

### 7. CSP headers presentes

```bash
curl -s -D- http://localhost:3000/ 2>&1 | grep -i content-security-policy
```

Esperado: header CSP presente.

### 8. WebSocket conecta

```bash
# Con wscat o similar
wscat -c ws://localhost:3000
```

Esperado: mensaje `{"type":"init","data":{...}}` al conectar.

---

## Logger verificaciones

### Logs con timestamp

Los logs del servidor deben mostrar formato:
```
[2026-03-20T17:00:00.000Z] [INFO] Server running on http://0.0.0.0:3000
[2026-03-20T17:00:01.123Z] [INFO] GET /api/health 200 5ms {"requestId":"abc-123"}
```

### Error logs en producción

Los `logger.error()` y `logger.warn()` siempre se imprimen, incluso con `NODE_ENV=production`.

---

## Endpoints inventario

| Ruta | Método | Auth | Propósito |
|---|---|---|---|
| `/api/health` | GET | Pública | Health check |
| `/api/ai/providers` | GET | Pública | Lista de providers IA |
| `/api/notification-click` | POST | Pública | Tracking de clicks |
| `/api/mercadopago/preference` | POST | Pública | Crear preferencia de pago |
| `/api/zenobank/payment` | POST | Pública | Procesar pago Zenobank |
| `/webhooks/mercadopago` | POST | Webhook | Callback MercadoPago |
| `/webhooks/zenobank` | POST | Webhook | Callback Zenobank |
| `/api/instagram/auth-url` | GET | Pública | URL de auth Instagram |
| `/api/instagram/callback` | GET | Pública | Callback OAuth Instagram |
| `/api/instagram/publish` | POST | userId body | Publicar en Instagram |
| `/api/ai/generate-caption` | POST | Pública | Generar caption con IA |
| `/api/ai/external/chat` | POST | x-internal-api-key header | Chat con IA externa |

---

## WebSocket eventos

| Evento | Dirección | Propósito |
|---|---|---|
| `init` | Server→Client | Datos iniciales al conectar |
| `post:create` | Client→Server | Crear post |
| `post:created` | Server→Broadcast | Post creado |
| `post:update` | Client→Server | Actualizar post |
| `post:updated` | Server→Broadcast | Post actualizado |
| `post:delete` | Client→Server | Eliminar post |
| `post:deleted` | Server→Broadcast | Post eliminado |
| `ad:save` | Client→Server | Guardar anuncio |
| `ad:saved` | Server→Broadcast | Anuncio guardado |
| `ad:delete` | Client→Server | Eliminar anuncio |
| `ad:deleted` | Server→Broadcast | Anuncio eliminado |
| `user:save` | Client→Server | Guardar usuario |
| `user:saved` | Server→Broadcast | Usuario guardado |

---

## Variables de entorno requeridas

| Variable | Dónde | Requerida |
|---|---|---|
| `VITE_CONVEX_URL` | Frontend | Sí |
| `VITE_APP_URL` | Frontend | No (default: localhost) |
| `VITE_API_URL` | Frontend | No |
| `NODE_ENV` | Server | No (default: development) |
| `INTERNAL_API_SHARED_KEY` | Server | No (protege AI relay) |
| `SENTRY_ORG` | Build | No |
| `SENTRY_PROJECT` | Build | No |
| `SENTRY_AUTH_TOKEN` | Build | No |

---

## Reglas operativas

1. Nunca deployar si el health check falla.
2. Nunca deployar si hay errores de typecheck (`npm run lint`).
3. Si un webhook devuelve 5xx por más de 5 minutos, activar rollback.
4. Error logs deben incluir `requestId` para trazabilidad.
5. Los `@ts-ignore` en server.ts son deuda técnica pendiente — no agregar nuevos.
