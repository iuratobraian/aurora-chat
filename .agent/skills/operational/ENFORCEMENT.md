# Enforcement

## Objetivo

Pasar de reglas aspiracionales a reglas verificables.

## Qué se valida automáticamente

- existencia del Project OS mínimo
- consistencia entre `TASK_BOARD.md` y `CURRENT_FOCUS.md`
- unicidad de task ids
- un solo task activo por scope
- owner obligatorio en tareas activas
- actualización de coordinación cuando cambia código
- actualización de decisiones cuando cambian archivos críticos

## Scripts

- `npm run validate:ops`
  - valida disciplina operativa y trazabilidad
- `npm run agent:preflight`
  - imprime lectura mínima y confirma que el entorno documental está completo
- `npm run release:gate`
  - bloquea releases cuando hay blockers abiertos
- `npm run guard:hardcodes`
  - detecta hardcodes y patrones de secretos
- `npm run guard:immutable`
  - bloquea cambios al núcleo inmutable sin override
- `npm run ops:status`
  - muestra estado general del sistema operativo del proyecto
- `npm run ops:open`
  - lista trabajo abierto
- `npm run ops:critical`
  - reporta archivos críticos o guarded tocados
- `npm run ops:scorecard`
  - resume carga y cierre de tareas por agente
- `npm run ops:finish`
  - verifica que tareas bloqueadas tengan salida formal
- `npm run ops:templates`
  - lista templates disponibles para nuevas estructuras

## Regla

Si CI falla por enforcement, el equipo no debe “saltear” el proceso. Debe actualizar el Project OS para que represente el trabajo real.

## Configuración reusable

La validación usa `.agent/project-os.config.json`, así que el framework puede portarse a otros repos sin reescribir los scripts centrales.
