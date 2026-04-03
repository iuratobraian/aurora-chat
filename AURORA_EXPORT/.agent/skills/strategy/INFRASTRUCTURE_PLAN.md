# Infrastructure Plan

## Objetivo

Limpiar la arquitectura de datos y servidores para que la app opere con una base confiable, segura y mantenible.

## Diagnóstico resumido

- Convex ya funciona como backend real, pero convive con mucha lógica local en navegador.
- El proyecto expone rutas `/api` y `/webhooks`, pero el deploy visible está armado como frontend estático.
- Hay demasiados fallbacks hardcodeados para URLs y deployments.
- Pagos, webhooks e Instagram no están lo bastante endurecidos para producción.

## Arquitectura objetivo

### Fuente de verdad

- Convex como backend oficial para datos de negocio.
- `localStorage` solo para cache, drafts, preferencias y soporte offline no crítico.

### Backend operativo

- Opción preferida: backend serverless claro para `/api` y `/webhooks`, o migración de esos endpoints a capacidades server-side de Convex si cubren la necesidad.
- No seguir con una capa Express “a medias” si no va a desplegarse como backend real.

### Configuración

- Config centralizada y validada.
- Cero fallbacks a deployments de terceros o entornos viejos.
- Separación estricta entre variables frontend y backend.

## Frentes de implementación

1. `deployment_and_runtime`
   - definir dónde viven `/api` y `/webhooks`
   - alinear build, deploy y runtime real

2. `config_and_secrets`
   - consolidar URLs y variables
   - eliminar hardcoded fallbacks
   - validar env al inicio

3. `data_layer_cleanup`
   - reducir dependencia de `localStorage`
   - unificar cliente Convex
   - explicitar cache vs truth source

4. `payments_and_webhooks`
   - validar firma
   - agregar idempotencia
   - persistir eventos
   - reconciliar estados

5. `auth_and_server_trust`
   - no aceptar `userId` pelado en endpoints server
   - validar sesión, permisos y rate limits

6. `integrations_hardening`
   - Instagram
   - AI endpoints
   - proveedores de pago

7. `observability_and_ops`
   - logs estructurados
   - correlation ids
   - checklist operativo

## Regla de implementación

No tocar la app visual primero. Primero cerrar arquitectura, datos y seguridad operacional.

## Resultado esperado

- un backend operativo consistente
- rutas server realmente desplegadas
- menos desincronización entre cliente y backend
- menos riesgo en pagos e integraciones
