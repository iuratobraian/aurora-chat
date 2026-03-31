# Aurora Local Creation Runtime

## Objetivo

Permitir que Aurora Core opere desde terminal y servidor local para iniciar nuevas creaciones dentro del repo de desarrollo sin forzar cambios destructivos.

## Qué hace

- expone estado por API
- lista tareas y creaciones
- consulta la base de conocimiento
- crea scaffolds de incubación para nuevos productos
- sirve una UI local funcional en `/app`

## Regla principal

Aurora crea puntos de arranque y rutas de trabajo.
No debe invadir el producto actual ni sobrescribir código crítico.

## Flujo recomendado

1. levantar `aurora:api`
2. revisar `aurora:status`
3. revisar `aurora:creations`
4. consultar `aurora:knowledge`
5. bootstrappear una nueva creación con `aurora:create`

## Resultados del bootstrap

Cada creación nueva debe quedar en:

- `.agent/workspace/incubator/<slug>/SPEC.md`
- `.agent/workspace/incubator/<slug>/TASKS.md`
- `.agent/workspace/incubator/<slug>/NOTES.md`

## Capacidades mínimas del runtime

- health
- status
- tasks
- creations
- knowledge
- bootstrap
- app

## Regla final

Aurora Local Runtime existe para iniciar trabajo profesional con orden, no para improvisar proyectos paralelos.
