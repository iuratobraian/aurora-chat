# Production Playbook

## Regla base

Producción se trata como zona hostil.

## Antes de producción

- release blockers revisados
- non-negotiables revisados
- archivos críticos revisados
- cambios sensibles con decisión registrada
- tareas abiertas clasificadas en done, blocked o cut

## Nunca asumir

- que un webhook “seguro funciona”
- que una auth “debería estar bien”
- que un fallback local es aceptable para negocio
- que un cambio chico no puede romper nada

## Regla

Si un cambio no resiste pre-production guard, no está listo.
