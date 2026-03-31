# Aurora Terminal Operations

## Objetivo

Permitir operar Aurora Core desde terminal con una API local, un CLI simple y menús de acceso rápido.

## Qué resuelve

- consultar estado
- ver tareas abiertas
- ver catálogo de creaciones posibles
- inspeccionar salud de Aurora Core
- tener una entrada única para coordinar agentes

## Componentes

- `scripts/aurora-api.mjs`
- `scripts/aurora-cli.mjs`
- `/.agent/aurora/creation-catalog.json`

## Comandos

- `npm run aurora:api`
- `npm run aurora:menu`
- `npm run aurora:status`
- `npm run aurora:tasks`
- `npm run aurora:creations`

## Regla

Aurora Terminal no reemplaza el Project OS.
Lo expone de forma cómoda y accesible.

## Menú esperado

1. estado general
2. tareas abiertas
3. blockers
4. catálogo de creaciones
5. acciones de Aurora Core
6. referencia de skills base

## Acciones de Aurora Core

- priorizar backlog
- sugerir siguiente lote
- mostrar tareas por scope
- listar creaciones futuras
- mostrar skills canónicas

## Uso recomendado

1. levantar `aurora:api`
2. abrir `aurora:menu`
3. elegir operación
4. asignar trabajo
5. volver a validar estado

## Regla final

Aurora Terminal debe simplificar coordinación, no agregar otra capa de caos.
