# Workspace Rules

## Propósito

Establecer un flujo de trabajo limpio, trazable y sin duplicación.

## Reglas obligatorias

1. Antes de tocar código, reclamar tarea en `../workspace/coordination/TASK_BOARD.md`.
2. Antes de empezar, registrar intención de trabajo en `../workspace/coordination/CURRENT_FOCUS.md`.
3. Antes de empezar, leer `PROJECT_CHARTER.md`, `NON_NEGOTIABLES.md`, `ATTACK_PRIORITY.md`, `ROADMAP_30D.md` y `AGENT_TASK_DIVISION.md`.
3. Cada tarea debe tener:
   - owner
   - estado
   - archivos afectados
   - criterio de aceptación
4. Cada tarea reclamada debe declarar qué va a hacer exactamente, sobre qué archivos y qué no va a tocar.
5. Cada cambio relevante debe dejar registro en `../workspace/coordination/AGENT_LOG.md`.
6. Cada entrega entre agentes debe registrarse en `../workspace/coordination/HANDOFFS.md`.
7. Ningún agente puede editar archivos reclamados por otro agente sin coordinar handoff.
8. No usar la documentación vieja como fuente de verdad.
9. No declarar una tarea completada sin validación mínima.
10. Nadie puede romper `NON_NEGOTIABLES.md` aunque la tarea parezca urgente.
11. Toda estructura nueva debe nacer con spec o template antes de implementarse.
12. Todo trabajo nuevo debe poder cerrarse en `done`, `blocked` o `cut`.
13. El core inmutable del sistema no se toca sin override explícito.
14. Toda tarea importante debe dejar aprendizaje en `LEARNING_LOG.md`.
15. Todo agente debe usar una plantilla operativa adecuada para intake, ejecución, validación, delegación o cierre.
16. Toda integracion compleja, mantenimiento critico o cambio de escalado debe abrir dossier o runbook antes de implementarse.

## Estados permitidos

- `todo`
- `claimed`
- `in_progress`
- `blocked`
- `review`
- `done`

## Definition of ready

Una tarea está lista para ejecutarse cuando:

- tiene objetivo claro
- tiene archivos o área definidos
- tiene owner
- tiene intención de trabajo registrada
- tiene criterio de aceptación
- no pisa trabajo ya reclamado

## Definition of done

Una tarea solo puede pasar a `done` si:

- el cambio existe realmente
- el comportamiento fue revisado
- se actualizaron logs y board
- no dejó conflictos abiertos

## Prohibiciones

- crear planes paralelos
- duplicar backlog en archivos nuevos
- abrir nuevas épicas sin aprobación
- usar porcentajes de avance inflados
- marcar “completado” con base en intención o código parcial
- arrancar sin dejar trazado en `CURRENT_FOCUS.md`
- tocar archivos críticos sin reclamo explícito
