# Aurora Multi Repo And Console

## Objetivo

Permitir que Aurora trabaje sobre distintos repositorios de desarrollo desde una misma capa de coordinacion, sin forzar nada y manteniendo el repo activo bajo control.

## Capacidades

- registro de repositorios en `.agent/aurora/repos.json`
- seleccion de repo activo
- consola Aurora para ejecutar comandos permitidos sobre el repo activo
- registro de agentes externos
- rastreo local seguro del entorno
- inventario de conectores y MCP

## Comandos

- `npm run aurora:repos`
- `npm run aurora:agentes`
- `npm run aurora:rastreo`
- `npm run aurora:conectores`
- `npm run aurora:shell`

## Consola Aurora

La consola no es una shell libre total.

Solo ejecuta comandos de inspeccion o scripts permitidos para no romper el entorno:

- `git status`
- `npm run ...`
- `npm test`
- `node --version`
- `rg ...`
- `dir`
- `Get-ChildItem`

## Regla

Aurora coordina y trabaja sobre repos de desarrollo.
No toma control destructivo ni intenta operar fuera del alcance definido.
