# Infra Tech Plan

## Meta

Dejar la app con una arquitectura de datos y servidores limpia, ejecutable y trazable.

## Fase 0: Descubrimiento y decisión de runtime

### Objetivo

Confirmar cómo se va a servir el backend real.

### Tareas

- auditar si `server.ts` participa o no en producción
- decidir entre:
  - backend serverless separado
  - migración a server-side de Convex donde aplique
- documentar la decisión en `coordination/DECISIONS.md`

### Salida

- decisión única de runtime
- lista de endpoints que sobreviven
- lista de endpoints a migrar o eliminar

## Fase 1: Configuración y secrets

### Objetivo

Eliminar configuración ambigua.

### Tareas

- crear mapa único de variables frontend y backend
- eliminar fallbacks hardcodeados de Convex y URLs
- agregar validación de entorno al arranque
- normalizar `APP_URL`, `API_URL`, `CONVEX_URL`, `WEBHOOK_BASE_URL`

### Aceptación

- sin URLs hardcodeadas fuera del config oficial
- errores explícitos si falta configuración crítica

## Fase 2: Capa de datos

### Objetivo

Definir a Convex como source of truth real.

### Tareas

- crear cliente Convex único reutilizable
- auditar `localStorage` y clasificar uso:
  - cache permitido
  - draft permitido
  - dato de negocio a migrar
- reducir escrituras paralelas Convex + local sin reconciliación

### Aceptación

- todo dato crítico tiene dueño claro
- `localStorage` no reemplaza backend para negocio

## Fase 3: Pagos y webhooks

### Objetivo

Hacer pagos operables y seguros.

### Tareas

- definir endpoint productivo real para webhooks
- verificar firmas de MercadoPago y Zenobank
- persistir webhook events
- agregar idempotency key / duplicate protection
- reconciliar estado de pago contra backend

### Aceptación

- webhooks válidos y repetibles sin efectos dobles
- pagos no dependen del frontend para quedar confirmados

## Fase 4: Auth y confianza server-side

### Objetivo

No confiar en input del cliente para acciones sensibles.

### Tareas

- revisar endpoints que reciben `userId` en body
- exigir sesión o token validado
- agregar permisos mínimos y rate limiting

### Aceptación

- endpoints sensibles protegidos
- acciones críticas asociadas a identidad real

## Fase 5: Integraciones y observabilidad

### Objetivo

Cerrar la capa operativa.

### Tareas

- endurecer integración Instagram
- separar tokens sensibles de almacenamiento reversible
- agregar logs estructurados
- agregar guía de operación y diagnóstico

### Aceptación

- errores trazables
- fallos distinguibles por integración
- operación básica documentada

## Dependencias

- Fase 0 desbloquea todo lo demás
- Fase 1 debe cerrarse antes de Fase 3
- Fase 2 y Fase 4 pueden correr en paralelo parcial
- Fase 5 entra cuando Fase 3 y Fase 4 estén encaminadas
