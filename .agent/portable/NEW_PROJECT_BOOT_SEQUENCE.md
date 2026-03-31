# New Project Boot Sequence

## Objetivo

Levantar un proyecto nuevo con el sistema completo sin volver al caos.

## Secuencia

1. Copiar el starter kit.
2. Ajustar `project-os.config.json`.
3. Reescribir charter y scope.
4. Definir non-negotiables del proyecto.
5. Definir board inicial con P0 reales.
6. Definir blockers de release.
7. Definir roster de agentes disponibles.
8. Sembrar el Project Brain con decisiones iniciales.
9. Ejecutar:
   - `npm run agent:preflight`
   - `npm run validate:ops`
   - `npm run brain:sync`
10. Recién después abrir tareas de implementación.

## Regla

Ninguna feature nueva antes del boot completo.
