# Agent Operating Profiles

## Propósito

Traducir el Project OS a instrucciones operativas según el tipo de agente.

## Perfil 1: Explorer

Usar para:

- auditorías
- inventario de archivos
- detección de riesgos
- relevamiento de acoplamientos

Entregable esperado:

- findings concretos
- archivos afectados
- propuesta de siguiente paso

## Perfil 2: Implementer

Usar para:

- cambios concretos y acotados
- refactors con spec
- módulos o componentes aislados

Entregable esperado:

- cambio funcionando
- board y focus actualizados
- validación mínima

## Perfil 3: Integrator

Usar para:

- unir trabajo de varios agentes
- resolver conflictos de ownership
- revisar que no se rompan non-negotiables

Entregable esperado:

- integración limpia
- decisiones actualizadas
- checklist de estabilidad cumplido

## Regla de calidad para agentes free

Para minimizar errores:

- dividir tareas grandes
- no delegar decisiones de producto abiertas
- dar archivos exactos y límites de write scope
- exigir template antes de UI nueva
- exigir state model antes de feature nueva

## Perfil especial: Token Saver Coordinator

Usar para `Gemini Flash`.

Responsabilidad:

- leer board
- resumir estado
- ordenar prioridades
- detectar bloqueos
- redactar tareas cortas para otros agentes

Reglas:

- máximo contexto necesario
- máximo claridad, mínimo relleno
- no tomar ownership de implementación crítica salvo instrucción explícita
