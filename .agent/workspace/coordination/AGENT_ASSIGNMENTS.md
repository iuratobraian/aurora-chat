# Agent Assignments

## Objetivo

Repartir el saneamiento de infraestructura sin duplicación.

## Asignación vigente

### AGENT-1

- Área: `deployment_and_runtime`
- Ownership:
  - `server.ts`
  - `vercel.json`
  - `package.json`
  - documentación de runtime
- Responsabilidad:
  - decidir y ejecutar el modelo real de backend
  - inventariar endpoints `/api` y `/webhooks`
  - proponer qué queda, qué migra y qué se elimina

### AGENT-2

- Área: `config_and_data_layer`
- Ownership:
  - `src/config.ts`
  - `src/config/urls.ts`
  - cliente Convex compartido
  - servicios que hoy hardcodean URLs
- Responsabilidad:
  - unificar configuración
  - eliminar fallbacks hardcodeados
  - mapear `localStorage` vs datos de negocio

### AGENT-3

- Área: `payments_and_webhooks`
- Ownership:
  - `convex/lib/mercadopago.ts`
  - `convex/lib/zenobank.ts`
  - rutas de pago y webhook
- Responsabilidad:
  - endurecer pagos
  - definir validación de webhook
  - diseñar idempotencia y reconciliación

### AGENT-4

- Área: `auth_and_integrations`
- Ownership:
  - endpoints server de Instagram y AI
  - auth server-side
  - protección de acciones sensibles
- Responsabilidad:
  - revisar confianza en `userId`
  - proponer autenticación de endpoints
  - endurecer manejo de tokens e integraciones

### AGENT-5

- Área: `observability_and_qa`
- Ownership:
  - logging operativo
  - checklist técnico
  - smoke tests de infra
- Responsabilidad:
  - definir qué medir
  - preparar checklist de verificación
  - registrar riesgos residuales

## Regla de coordinación

- Cada agente debe reclamar sus tasks en `TASK_BOARD.md`.
- Cada agente debe declarar foco activo en `CURRENT_FOCUS.md` antes de tocar código.
- Si necesita tocar archivo fuera de su ownership, abre handoff antes.
- No se cierran tareas de infraestructura sin decisión documentada en `DECISIONS.md`.
- Todo agente debe respetar `NON_NEGOTIABLES.md` y `STABILITY_CHECKLIST.md`.
