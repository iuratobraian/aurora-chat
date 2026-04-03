# Security Fortress

## Objetivo

Blindar la app para que seguridad y pagos no dependan de intuición ni de cambios improvisados.

## Principios

1. Ningún endpoint sensible confía en datos críticos enviados por el cliente.
2. Ningún pago se considera exitoso por una respuesta de frontend.
3. Ningún webhook cambia estado sin verificación, idempotencia y trazabilidad.
4. Ningún secreto vive en el browser.
5. Ninguna integración externa entra sin fallback, timeout, logging y plan de rollback.

## Frentes obligatorios

- `auth`
- `config`
- `payments`
- `webhooks`
- `secrets`
- `observability`
- `release gates`
- `fallback UX`

## Estándar mínimo

### Auth

- sesión válida del lado servidor para operaciones sensibles
- rate limiting en endpoints críticos
- validación estricta de payload
- no confiar en `userId` del body

### Payments

- creación de intent/preference solo server-side
- metadata mínima y consistente
- estado final reconciliado por webhook o consulta server-to-server
- ledger o event log
- idempotency keys

### Webhooks

- raw body cuando el proveedor lo exija
- verificación de firma
- rechazo explícito cuando falle la firma
- reintentos seguros
- no procesar el mismo evento dos veces

### Secrets

- claves solo en entorno servidor
- rotación documentada
- no exponer secretos en `VITE_*`
- no hardcodear deployments ni endpoints productivos

### Observability

- request id
- logs estructurados
- errores clasificados
- trazabilidad de pagos
- estado del proveedor externo

## Archivos que mandan

- `../workspace/plans/PAYMENT_SECURITY_INTEGRATION_PLAN.md`
- `../workspace/coordination/SECURITY_REGISTER.md`
- `../workspace/coordination/TASK_BOARD.md`

## Regla

Si una implementación de pagos o seguridad no puede ser explicada con:
- entrada
- validación
- fuente de verdad
- fallback
- salida

entonces no está lista.
