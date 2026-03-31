# Prompt Library

## Objetivo

Esta carpeta contiene prompts operativos creados para elevar la calidad del equipo completo.

## Uso

Cada agente debe elegir el prompt base correcto antes de trabajar y combinarlo con:

- `PROJECT_CHARTER.md`
- `NON_NEGOTIABLES.md`
- `ATTACK_PRIORITY.md`
- `AGENT_TASK_DIVISION.md`
- el spec o template de la tarea

## Familias de prompts

- `user-understanding/`
  - entender mejor lo que pide el usuario
- `planning/`
  - convertir pedidos en planes ejecutables
- `implementation/`
  - ejecutar con calidad técnica alta
- `review/`
  - revisar cambios como profesional senior
- `integration/`
  - integrar trabajo de varios agentes sin romper
- `qa-release/`
  - validar antes de producción
- `agent-profiles/`
  - adaptar el estilo de trabajo al agente
- `production-mode/`
  - prompts de rigor máximo
  - usar `LIBERATOR_MODE.md` cuando se quiera máxima intensidad sin romper reglas ni seguridad
  - usar `LIBERATOR_DEBUGGING.md`, `LIBERATOR_REFACTOR.md`, `LIBERATOR_INTEGRATION.md`, `LIBERATOR_PRODUCTION.md`, `LIBERATOR_COMMUNITY_SUPPORT.md`, `LIBERATOR_GAME_CREATION.md`, `LIBERATOR_WEB_CREATION.md` y `AURORA_CONVERSATION_MODE.md` para bajar ese modo a conversación útil y orientada a proyecto

## Regla

Un agente no debería improvisar su modo de trabajo. Debe arrancar desde un prompt de esta librería.
