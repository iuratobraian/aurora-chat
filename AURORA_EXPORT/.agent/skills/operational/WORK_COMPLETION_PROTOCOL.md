# Work Completion Protocol

## Propósito

Evitar trabajo huérfano, código perdido, features medias y ramas invisibles.

## Regla principal

Todo trabajo nuevo debe nacer con criterio de finalización y morir en `done`, `blocked` o `cut`.

Nunca queda “por ahí”.

## Estados válidos para cerrar una línea de trabajo

- `done`
- `blocked`
- `cut`

## `done`

Usar solo si:

- el cambio existe
- está integrado
- quedó registrado
- tiene validación mínima

## `blocked`

Usar si:

- depende de credenciales, acceso o decisión externa
- depende de otro task que no terminó
- seguir empujando generaría deuda o código zombie

Debe dejar:

- qué lo bloquea
- quién lo desbloquea
- siguiente paso exacto

## `cut`

Usar si:

- se abandona una idea
- no entra en foco
- la implementación parcial no debe seguir viva

Debe dejar:

- por qué se corta
- si hay que revertir o archivar algo

## Prohibido

- dejar feature viva sin owner
- dejar código sin registro en board
- dejar una sección nueva sin checklist estructural
- marcar `done` y dejar pendientes operativos escondidos

## Finalización obligatoria por trabajo nuevo

Todo trabajo nuevo debe definir desde el inicio:

- señal de salida
- definición de done
- condición de bloqueo
- condición de corte

## Aprendizaje obligatorio

Al cerrar una tarea importante:

- registrar aprendizaje en `LEARNING_LOG.md`
- sincronizar `Project Brain` cuando corresponda
