# Cloud Agent Functions

## Objetivo

Definir funciones explícitas para agentes cloud adicionales y evitar mal uso.

## Regla

Cada agente debe usarse por función, no por hype.

## Modelos y funciones

### `Gemma 3 4B`

- función ideal:
  - microtareas
  - limpieza de texto
  - resúmenes cortos
  - clasificación simple
- no usar para:
  - arquitectura
  - seguridad
  - integración multiarchivo crítica

### `Nemotron 3`

- función ideal:
  - análisis técnico
  - reasoning moderado con estructura
  - revisión de lógica
- no usar para:
  - decisiones abiertas de producto sin guía

### `Ollama Qwen 3.5`

- función ideal:
  - trabajo local repetible
  - drafting técnico
  - transformaciones controladas
- no usar para:
  - resolución de problemas muy ambiguos

### `Kimi-K2.5 Cloud`

- función ideal:
  - análisis amplio
  - lectura de contexto largo
  - síntesis de alternativas
- no usar para:
  - tareas pequeñas que no justifican costo/contexto

### `Qwen 3.5 Cloud`

- función ideal:
  - coding generalista
  - apoyo en implementación con buen spec
  - refactors moderados
- no usar para:
  - ownership total de arquitectura crítica sin revisión

### `GLM5 Cloud`

- función ideal:
  - coordinación conversacional
  - drafting de planes
  - soporte a documentación y specs
- no usar para:
  - decisiones finales de seguridad o producción sin guardrails

### `minimax-m2.7 cloud`

- función ideal:
  - exploración técnica mejorada
  - implementación acotada con contexto claro
  - revisión rápida de soluciones
- no usar para:
  - grandes integraciones ambiguas sin liderazgo fuerte
