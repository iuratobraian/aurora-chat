# Learning Log

## Propósito

Registrar aprendizaje destilado de cada tarea para alimentar el cerebro local del proyecto.

## Regla

Toda tarea importante que llegue a `done`, `blocked` o `cut` debe dejar una entrada.

## Plantilla

```md
## TASK-ID
- Fecha:
- Estado final:
- Qué se intentó:
- Qué funcionó:
- Qué no funcionó:
- Qué se aprendió:
- Patrón reusable:
- Anti-patrón a evitar:
- Recomendación futura:
```

## Entradas

## INF-BOOT-001
- Fecha: 2026-03-20
- Estado final: done
- Qué se intentó: ordenar el proyecto con un sistema operativo interno unificado
- Qué funcionó: centralizar board, focus y decisions
- Qué no funcionó: trabajar con planes duplicados y estados inflados
- Qué se aprendió: el equipo rinde mejor cuando existe una sola fuente de verdad operativa
- Patrón reusable: usar `TASK_BOARD.md` + `CURRENT_FOCUS.md` + `AGENT_LOG.md` como tríada mínima
- Anti-patrón a evitar: múltiples planes paralelos con progreso ficticio
- Recomendación futura: nunca arrancar una fase nueva sin pasarla antes al board único

## INF-BOOT-002
- Fecha: 2026-03-20
- Estado final: done
- Qué se intentó: proteger la estabilidad del repo mientras se amplía el equipo de agentes
- Qué funcionó: crear non-negotiables, release gate, immutable core y guards
- Qué no funcionó: confiar solo en disciplina humana para sostener reglas críticas
- Qué se aprendió: sin enforcement automático, el proceso termina degradándose
- Patrón reusable: convertir reglas críticas en checks verificables
- Anti-patrón a evitar: asumir que el equipo recordará siempre las reglas sin CI ni guardias
- Recomendación futura: cada nueva regla importante debe tener su mecanismo de verificación

## INF-BOOT-003
- Fecha: 2026-03-20
- Estado final: done
- Qué se intentó: mejorar creación de nuevas secciones y features sin improvisación
- Qué funcionó: contracts visuales y funcionales + blueprints + templates
- Qué no funcionó: permitir diseño o implementación nueva sin spec
- Qué se aprendió: la calidad de estructuras nuevas mejora muchísimo cuando se obliga a pasar por templates
- Patrón reusable: todo módulo nuevo debe nacer con `NEW_SECTION_SPEC`, `NEW_FEATURE_SPEC` o `NEW_PAGE_SPEC`
- Anti-patrón a evitar: secciones creadas “sobre la marcha” dentro de componentes grandes
- Recomendación futura: agregar revisión estructural antes de cerrar cualquier pantalla nueva

## INF-BOOT-004
- Fecha: 2026-03-20
- Estado final: done
- Qué se intentó: asignar modelos distintos al trabajo correcto
- Qué funcionó: definir perfiles por agente y por costo/capacidad
- Qué no funcionó: pedirle a modelos free que resuelvan ambigüedad, arquitectura y multiarchivo crítico a la vez
- Qué se aprendió: los agentes free mejoran radicalmente cuando reciben scope estrecho, blueprint y aceptación explícita
- Patrón reusable: usar coordinadores baratos para orden y modelos más fuertes para integración o ambigüedad alta
- Anti-patrón a evitar: delegación ambigua a agentes de bajo costo
- Recomendación futura: revisar siempre `AGENT_FUNCTION_MATRIX.md` antes de repartir tareas

## INF-BOOT-005
- Fecha: 2026-03-20
- Estado final: done
- Qué se intentó: crear un cerebro local del proyecto útil desde el primer día
- Qué funcionó: destilar decisiones, logs, prompts, anti-patrones y recomendaciones en una base local
- Qué no funcionó: esperar que la inteligencia local aparezca sola sin disciplina de aprendizaje
- Qué se aprendió: una super IA local del proyecto empieza como memoria bien curada, no como modelo mágico
- Patrón reusable: registrar aprendizaje en cada tarea importante y sincronizar el cerebro local
- Anti-patrón a evitar: pensar que basta con tener muchos agentes sin memoria compartida
- Recomendación futura: alimentar `LEARNING_LOG.md` al cerrar tareas importantes y regenerar el brain snapshot
