# Critical Failures To Remember

## Fallas ya observadas en este repo

### 1. Source of truth roto

- Feeds y paneles admin cerrados con fallback a `localStorage`.
- Resultado: dos navegadores muestran estados distintos.

### 2. Backend abierto o con RLS incompleto

- Queries por `userId` sin comprobar `ctx.auth`.
- Mutations admin protegidas solo por un `adminId` enviado desde el cliente.
- Resultado: leaks de datos y acciones sensibles forjables.

### 3. Contrato frontend/backend desalineado

- UI llamando mutations sin args requeridos.
- UI usando funciones `internal` como si fueran públicas.
- Resultado: botones que parecen funcionar pero fallan en runtime o quedan solo locales.

### 4. Trabajo marcado como done con placeholders

- Toasters “en desarrollo”.
- analytics en cero o calculados por estimación.
- mocks ocultos detrás de una vista premium.

### 5. Caminos legacy paralelos

- pagos por `fetch('/api/...')` conviviendo con orquestadores Convex
- wrappers viejos mezclados con hooks nuevos

## Checklist duro antes de cerrar una tarea

- ¿La data visible sale de Convex o de una fuente real verificable?
- ¿La mutación valida identidad/ownership/admin en backend?
- ¿La UI envía exactamente los args que el backend exige?
- ¿No hay mocks, `localStorage`, `window.convex` ni placeholders activos?
- ¿No quedó un camino legacy compitiendo con el flujo oficial?
- ¿Se probó el caso real en prod o al menos con smoke verificable?

## Consejos para escribir sin romper el sistema

- Primero leer el handler Convex; después tocar la vista.
- Preferir helpers de auth reutilizables.
- Preferir paginación e índices a `collect()` completo.
- No mezclar demo y prod en el mismo servicio.
- No dar por bueno un fix si solo “deja de romper”; debe quedar coherente.
- Si descubres que una tarea previa marcada `done` no estaba cerrada, reabrir el gap en el board en lugar de esconderlo.
