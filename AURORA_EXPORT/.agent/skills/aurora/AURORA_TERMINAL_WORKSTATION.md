# Aurora Terminal Workstation

## Objetivo

Convertir Aurora en una workstation terminal-first, cómoda y mantenible, alineada con cómo operan muchos sistemas de IA potentes.

## Por qué terminal-first

- menos capas frágiles
- mantenimiento más simple
- más velocidad
- mejor automatización
- mejor integración con repos de desarrollo

## Comando principal

- `npm run aurora:shell`

## Capacidades

- hablar con Aurora por texto
- revisar estado
- listar tareas
- consultar conocimiento
- crear incubadores
- inspeccionar focus actual

## Comandos internos

- `/help`
- `/status`
- `/tasks`
- `/creations`
- `/knowledge <query>`
- `/chat <message>`
- `/create <kind> <name>`
- `/focus`
- `/exit`

## Regla

La terminal es la superficie principal.
La UI local y la app de escritorio son capas complementarias.

## Regla final

Aurora debe ser usable incluso si solo existe una terminal y un repo.
