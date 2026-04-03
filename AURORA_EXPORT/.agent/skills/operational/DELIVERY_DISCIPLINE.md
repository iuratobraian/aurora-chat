# Delivery Discipline

## Objetivo

Asegurar que cada nueva sección, módulo o feature llegue a una salida limpia.

## Reglas

1. No crear código sin task.
2. No crear task sin aceptación.
3. No abrir una feature si no puede terminarse o bloquearse formalmente.
4. Toda nueva sección debe tener spec.
5. Toda nueva feature debe tener source of truth y state model.
6. Todo trabajo parcialmente integrado debe quedar en handoff o blocked.

## Anti-zombie code

Si existe código nuevo y:

- no tiene task clara
- no tiene owner
- no tiene log
- no tiene intención declarada

ese código se considera zombie y debe corregirse antes de seguir.
