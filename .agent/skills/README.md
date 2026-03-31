# Skills README

## Aviso Importante

Antes de tocar código, reclamar tareas o dar algo por `done`, todo agente debe leer en este orden:

1. `./mandatory-startup-readiness/SKILL.md`
2. `./foundations/README.md`
3. `./agents/AGENT_TASK_DIVISION.md`
4. `../workspace/coordination/TASK_BOARD.md`
5. `../workspace/coordination/CURRENT_FOCUS.md`

## Regla obligatoria

Ningún agente puede marcar una tarea como terminada si todavía existe cualquiera de estas condiciones:

- mocks, demo data o placeholders visibles
- `localStorage` como fuente de verdad compartida
- mutaciones/queries Convex sin validación explícita de identidad/rol
- mismatch entre args del frontend y firma real del backend
- uso de `internalMutation/internalAction` desde UI cliente
- caminos legacy paralelos al flujo oficial de pagos/datos
- botones o flujos con mensajes “en desarrollo”
- smoke de prod o doble check sin ejecutar

## Propósito

Este README unifica el punto de entrada que `AGENTS.md` exige leer y fuerza la lectura del skill de arranque obligatorio creado a partir de la auditoría real del proyecto.
