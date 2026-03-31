# QA Release

## Objetivo

Evitar que el equipo vuelva a declarar progreso inexistente.

## Smoke tests mínimos por release

1. Carga inicial sin loops de loader.
2. Navegación principal completa.
3. Feed principal usable.
4. Login y registro sin roturas visibles.
5. Pricing accesible y CTA funcional.
6. Perfil y menú de usuario sin overlays rotos.
7. Mobile básico en viewport pequeño.

## Checklist de entrega

- cambios aplicados en código
- board actualizado
- handoff registrado si corresponde
- riesgo residual explicitado

## Evidencia esperada

- archivo modificado
- verificación manual o test
- nota breve en `AGENT_LOG.md`

## Regla de honestidad operativa

Si una integración depende de API keys, servicios externos o deploy pendiente, su estado correcto es `blocked` o `partial`, nunca `done`.
