# Aurora: 100 Funcionalidades Útiles para Aurora y Otros Agentes

Objetivo: dejar una base canónica de funcionalidades que vuelvan a Aurora y a cualquier agente del equipo más rápidos para entender el repo, operar con criterio, programar mejor, validar más rápido y coordinarse sin perder contexto.

Regla: cada función debe reducir fricción, ahorrar contexto o evitar errores repetidos. Si una función no mejora comprensión, velocidad o calidad, no entra.

## 1. Comprensión del Repo

1. `repo-map`: generar un mapa corto del repo con carpetas clave, entrypoints y contratos importantes.
2. `stack-detect`: identificar frontend, backend, datos, testing, pagos y capa IA desde archivos reales.
3. `entrypoint-trace`: mostrar por dónde arranca la app, el server y Aurora.
4. `feature-surface-map`: relacionar superficies de producto con archivos concretos.
5. `dependency-neighbors`: listar dependencias cercanas antes de editar un archivo.
6. `critical-file-guard`: marcar archivos sensibles o con guardrails antes de operar.
7. `ownership-check`: leer board y focus para confirmar si el scope está libre o tomado.
8. `scope-infer`: inferir scope probable de la tarea según lenguaje natural.
9. `source-of-truth-check`: indicar qué archivo o servicio es la fuente de verdad del dato.
10. `architecture-brief`: resumir en 8-10 líneas la arquitectura relevante para una tarea.

## 2. Lectura y Contexto Activo

11. `task-context-pack`: reunir board, focus, handoffs y conocimiento relacionado para una tarea.
12. `recent-change-scan`: detectar cambios recientes importantes por archivos calientes.
13. `file-summary`: resumir un archivo largo en propósito, contratos y riesgos.
14. `cross-file-explain`: explicar cómo se conectan varios archivos en un flujo.
15. `unused-context-filter`: separar contexto útil de ruido documental.
16. `naming-normalizer`: detectar términos duplicados o inconsistentes en dominio y código.
17. `todo-hotspots`: ubicar TODOs, FIXMEs y deuda técnica priorizable.
18. `error-hotspots`: cruzar errores conocidos con archivos frecuentes.
19. `signal-vs-noise-rank`: priorizar qué docs o logs leer primero.
20. `repo-faq`: responder preguntas recurrentes del equipo con contexto local curado.

## 3. Razonamiento Operativo

21. `classify-task`: clasificar una tarea por scope, superficie y dominio.
22. `complexity-estimate`: estimar si la tarea es baja, media o alta complejidad.
23. `risk-detect`: detectar riesgo por auth, pagos, datos, guarded files o release.
24. `suggest-next-step`: proponer el siguiente paso correcto antes de editar.
25. `build-execution-plan`: generar un plan corto y reversible de ejecución.
26. `quick-checks`: proponer checks rápidos según el tipo de cambio.
27. `dependency-impact`: mostrar qué módulos podrían romperse por side effect.
28. `acceptance-extract`: convertir un objetivo difuso en criterio de salida concreto.
29. `rollback-think`: sugerir cómo volver atrás si el cambio falla.
30. `minimal-change-path`: orientar a la modificación mínima con mejor relación valor/riesgo.

## 4. Programación Asistida

31. `file-open-order`: indicar qué archivos abrir primero para una tarea.
32. `implementation-skeleton`: proponer esqueleto de implementación sin inflar diseño.
33. `contract-check`: validar que types, payloads y firmas sigan consistentes.
34. `adapter-detect`: ubicar adapters, mappers y transformaciones relevantes.
35. `service-call-trace`: rastrear cómo viaja un dato desde UI a backend/Convex.
36. `schema-awareness`: advertir si una tarea toca schema, queries, mutations o contratos de datos.
37. `frontend-impact-view`: mostrar vistas y componentes afectados por una feature.
38. `backend-impact-view`: mostrar endpoints, server hooks y módulos tocados.
39. `dependency-install-hint`: sugerir dependencias faltantes solo si son realmente necesarias.
40. `code-style-align`: recordar convenciones y límites del repo antes de escribir código.

## 5. Validación Técnica

41. `validation-minimum`: sugerir validación mínima según el scope.
42. `validation-expanded`: sugerir validación fuerte cuando el riesgo es alto.
43. `build-relevance-check`: decir si hace falta build o no para ese cambio.
44. `test-target-suggest`: proponer qué tests correr o crear.
45. `runtime-smoke-check`: indicar smoke tests concretos después del cambio.
46. `api-check`: proponer llamadas reales para validar endpoints.
47. `ui-checklist`: listar verificaciones de UX, responsive y estados vacíos.
48. `data-integrity-check`: revisar consistencia de datos, migrations y fallbacks.
49. `security-check`: aplicar una pasada rápida de auth, secretos, headers y permisos.
50. `release-readiness-check`: decir si la tarea está lista para handoff, review o release.

## 6. Errores y Prevención

51. `error-catalog-match`: vincular una tarea con errores históricos parecidos.
52. `guarded-pattern-alert`: detectar patrones que el repo no quiere repetir.
53. `anti-regression-list`: enumerar regresiones típicas del área tocada.
54. `unsafe-edit-warning`: avisar si la edición propuesta tiene alto costo de rollback.
55. `missing-validation-warning`: señalar cuando falta una prueba obvia.
56. `scope-drift-alert`: detectar cuando la tarea se está expandiendo demasiado.
57. `hidden-coupling-alert`: avisar dependencias invisibles pero peligrosas.
58. `fallback-check`: revisar si el flujo tiene degradación limpia.
59. `null-state-check`: asegurar estados vacíos, errores y loading correctos.
60. `production-risk-note`: dejar nota clara cuando algo no es seguro para prod.

## 7. Memoria y Aprendizaje

61. `knowledge-ingest`: guardar aprendizaje útil con metadata consistente.
62. `knowledge-dedupe`: evitar duplicados o semiduplicados en memoria.
63. `knowledge-retrieval`: buscar conocimiento por tarea, dominio, riesgo o superficie.
64. `knowledge-confidence`: puntuar confianza del conocimiento guardado.
65. `knowledge-reuse-score`: medir si un aprendizaje se reutiliza de verdad.
66. `episodic-memory`: recordar contexto por sprint, tarea o incidente.
67. `semantic-memory`: conservar principios y patrones de largo plazo.
68. `learning-distill`: transformar actividad cruda en aprendizaje compacto.
69. `noise-reject`: impedir que documentación redundante degrade la señal.
70. `daily-digest`: generar digest de aprendizajes, fallos y oportunidades.

## 8. Coordinación Multiagente

71. `agent-registry`: saber qué agentes existen, qué hacen y dónde aportan más.
72. `scope-assignment`: sugerir qué agente debería tomar cada tipo de tarea.
73. `claim-check`: confirmar si una tarea puede reclamarse sin conflicto.
74. `handoff-summary`: resumir una tarea para que otro agente continúe rápido.
75. `handoff-close`: generar cierre con validación y riesgo restante.
76. `blocked-status-report`: explicar por qué una tarea está trabada y qué desbloquea.
77. `parallel-split-suggest`: dividir trabajo en frentes paralelos sin colisión.
78. `merge-risk-note`: avisar si dos frentes tocarán zonas peligrosamente cercanas.
79. `review-brief`: preparar contexto mínimo para revisión técnica útil.
80. `team-context-bridge`: traducir hallazgos técnicos a lenguaje entendible para otros perfiles.

## 9. Automatización y Operación

81. `antigravity-sync`: correr sincronización operativa completa de Aurora.
82. `pre-task-plan`: disparar plan automático antes de una tarea relevante.
83. `post-task-close`: disparar cierre automático al terminar una tarea.
84. `speed-check`: revisar salud del runtime, learner, scorecard y coverage.
85. `scorecard-report`: medir calidad estructural del aprendizaje.
86. `auto-learn-runner`: ingerir actividad nueva sin intervención manual excesiva.
87. `seed-product-context`: sembrar contexto de la app y sus superficies.
88. `seed-tech-context`: sembrar stack, runtime y dependencias reales del producto.
89. `ops-batch-run`: ejecutar lotes útiles de validación y aprendizaje.
90. `always-on-guardrails`: definir cuándo Aurora puede operar sola y cuándo debe frenar.

## 10. Inteligencia de Producto y App

91. `surface-priority-rank`: decir qué superficie de producto conviene atacar primero.
92. `onboarding-clarity-check`: evaluar si onboarding lleva al primer valor rápido.
93. `community-utility-check`: evaluar utilidad real del feed y conversación.
94. `creator-loop-check`: revisar activación, monetización y retorno para creators.
95. `trust-layer-check`: revisar reputación, señales y credibilidad del contenido.
96. `moderation-safety-check`: equilibrar seguridad con conversación útil.
97. `growth-signal-check`: identificar señales explícitas e implícitas para ranking o personalización.
98. `feature-gap-detect`: mostrar qué le falta a una superficie para estar madura.
99. `team-enablement-pack`: dar a cualquier agente contexto suficiente para programar sobre la app.
100. `next-best-system-step`: recomendar el avance con más retorno compuesto para Aurora y el producto.

## Prioridad Recomendada

Implementar primero estas 15 porque tienen el mayor retorno compuesto:

1. `repo-map`
2. `stack-detect`
3. `ownership-check`
4. `classify-task`
5. `risk-detect`
6. `build-execution-plan`
7. `quick-checks`
8. `validation-minimum`
9. `error-catalog-match`
10. `knowledge-retrieval`
11. `handoff-summary`
12. `handoff-close`
13. `speed-check`
14. `seed-tech-context`
15. `next-best-system-step`

## Qué Ya Existe Parcialmente en Aurora

- `classify-task`
- `risk-detect`
- `suggest-next-step`
- `build-execution-plan`
- `quick-checks`
- `validation-minimum`
- `handoff-summary`
- `handoff-close`
- `speed-check`
- `scorecard-report`
- `auto-learn-runner`
- `seed-product-context`
- `seed-tech-context`
- `antigravity-sync`
- `knowledge-retrieval`

## Qué Conviene Construir Después

- `repo-map`
- `entrypoint-trace`
- `task-context-pack`
- `dependency-impact`
- `test-target-suggest`
- `error-catalog-match`
- `scope-drift-alert`
- `daily-digest`
- `parallel-split-suggest`
- `next-best-system-step`

## Criterio de Calidad

Una función entra de verdad al sistema solo si cumple estas 4 condiciones:

- reduce tiempo de comprensión o ejecución;
- evita al menos un error frecuente;
- puede explicarse en una frase simple;
- tiene salida observable en shell, API, UI o logs.
