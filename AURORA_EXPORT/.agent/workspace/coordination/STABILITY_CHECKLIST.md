# Stability Checklist

## Propósito

Checklist rápida que todo agente debe repasar antes de cerrar una tarea relevante.

## Básico

- la app sigue cargando
- la navegación principal sigue visible y usable
- no se rompió auth o sesión
- no se agregó hardcoded de entorno
- no se degradó la trazabilidad del board

## Infra

- no se expuso secreto o token
- no se agregó endpoint sensible sin auth
- no se confió en `userId` enviado por cliente para acciones críticas
- no se reforzó `localStorage` como fuente de verdad

## Cierre

- board actualizado
- focus actualizado o liberado
- log registrado
- handoff creado si corresponde
