# Agent Roster

## Objetivo

Definir cómo sacar el máximo rendimiento de los agentes disponibles sin asignarles trabajo inadecuado.

## Agentes actuales

### `minimax M2.5`

- Perfil recomendado:
  - exploración técnica
  - auditoría rápida de archivos
  - limpieza documental
  - tareas medianas con contexto claro
- No ideal para:
  - refactors delicados de varios archivos críticos al mismo tiempo
  - decisiones de arquitectura ambiguas sin guía previa

### `bigpickle`

- Perfil recomendado:
  - ejecución concreta y repetible
  - tareas de mantenimiento
  - implementación de cambios acotados
  - trabajo sobre plantillas o specs bien definidos
- No ideal para:
  - diseño de sistemas
  - problemas con mucha ambigüedad o negociación de alcance

### `MIMO V2 PRO FREE`

- Perfil recomendado:
  - frontend guiado por contrato
  - trabajo modular con specs
  - implementación visual cuando ya existe blueprint
  - tareas de compatibilidad o wiring
- No ideal para:
  - seguridad, pagos, auth y runtime si no tiene guía estricta
  - ownership sobre features que toquen demasiadas capas a la vez

### `Gemini Flash` (última versión)

- Perfil recomendado:
  - coordinador ligero
  - compresión de contexto
  - organización de tareas
  - resúmenes operativos de bajo costo
- No ideal para:
  - decisiones arquitectónicas profundas
  - refactors críticos sin supervisión
- Mandato:
  - ahorrar tokens
  - ordenar
  - no expandirse innecesariamente

### `Gemini Pro`

- Perfil recomendado:
  - análisis más profundo
  - soporte en diseño de solución
  - revisión amplia de alternativas
- No ideal para:
  - trabajo de mantenimiento repetible si hay agentes más baratos disponibles

### `Claude Code`

- Perfil recomendado:
  - ejecución larga
  - refactors complejos
  - integración y debugging de varios archivos
- No ideal para:
  - trabajo pequeño que puede resolver un agente más barato

## Regla de asignación

### Alta ambigüedad

- el líder o agente principal define estrategia
- luego delega

### Baja ambigüedad

- delegar con template, archivos y criterio de aceptación

## Asignación sugerida por tipo de tarea

- arquitectura, runtime, decisiones críticas:
  - líder + validación humana
- refactor técnico acotado:
  - `minimax M2.5`
- ejecución repetible o de mantenimiento:
  - `bigpickle`
- UI y secciones nuevas con blueprint:
  - `MIMO V2 PRO FREE`
- coordinación barata y orden de equipo:
  - `Gemini Flash`
- análisis más profundo o comparación de soluciones:
  - `Gemini Pro`
- refactors complejos e integración larga:
  - `Claude Code`

## Regla dura

Ningún agente free debe recibir tareas ambiguas sobre múltiples archivos críticos sin:

- task board claro
- focus declarado
- spec o blueprint
- criterio de salida
