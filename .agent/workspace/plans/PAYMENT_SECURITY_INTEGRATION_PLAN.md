# Payment Security Integration Plan

## Objetivo

Dejar la app lista para terminar integraciones de pago con un estándar de seguridad fuerte, trazable y operable.

## Hallazgos actuales

- `server.ts`
  - webhooks reciben payload y responden sin verificación fuerte
  - mezcla `express.json()` y `express.raw()` sin pipeline claro por proveedor
  - usa `VITE_*` del lado servidor
- `convex/lib/mercadopago.ts`
  - usa defaults productivos peligrosos
  - no define firma, idempotencia ni reconciliación
- `convex/lib/zenobank.ts`
  - callbacks dependen de `process.env.VITE_API_URL`
  - no hay evidencia de validación de firma o replay protection
- `vercel.json`
  - sigue orientado a sitio Vite estático, no a backend serio con pasarelas

## Arquitectura objetivo

### Capa 1: Ingreso

- `POST /api/payments/:provider/create`
- `POST /webhooks/:provider`
- `GET /api/payments/:provider/status/:id`

### Capa 2: Guardas

- content type validation
- request id
- auth server-side en endpoints internos
- rate limiting
- payload schema validation
- raw body para webhooks con firma

### Capa 3: Orquestación

- construir payment intent/preference/order
- generar metadata consistente
- persistir estado inicial
- devolver URL o token de checkout

### Capa 4: Reconciliación

- webhook verificado
- consulta server-to-server si el estado es ambiguo
- idempotency store
- transición de estados controlada

### Capa 5: Observabilidad

- event log
- payment log
- webhook failures
- provider health

## Fuente de verdad

La fuente de verdad del pago debe ser backend + proveedor, nunca el frontend.

## Estados sugeridos

- `created`
- `pending`
- `processing`
- `approved`
- `rejected`
- `cancelled`
- `refunded`
- `failed_verification`

## Definition of Done para pagos

- firma validada
- idempotencia implementada
- estado reconciliado
- logs disponibles
- fallback si el proveedor falla
- rollback documentado

## Tareas

### PAY-001
- cerrar runtime real de backend para pagos y webhooks

### PAY-002
- separar env server-side de env browser

### PAY-003
- agregar middleware de verificación e idempotencia

### PAY-004
- crear payment event log y reconciliation flow

### PAY-005
- agregar healthchecks y status de proveedor

## Orden de ejecución

1. runtime
2. config
3. middleware
4. persistencia y reconciliación
5. observabilidad
6. QA de pagos
