# Architecture Guardrails

## Objetivo

Permitir mejoras rápidas sin seguir aumentando el caos estructural.

## Problemas principales

- `App.tsx` concentra demasiada lógica de shell.
- vistas grandes mezclan datos, layout y comportamiento.
- documentación histórica no refleja el estado real.
- el proyecto tiene demasiadas superficies “semi activas”.

## Reglas técnicas

1. No aumentar el tamaño de archivos ya críticos sin extraer responsabilidad.
2. Cada refactor debe reducir acoplamiento visible.
3. UI compleja debe dividirse por secciones con ownership claro.
4. No mover navegación, branding y pricing sin revisar impacto transversal.

## Áreas prioritarias

### Shell de aplicación

- `App.tsx`
- `components/Navigation.tsx`

### Experiencia principal

- `views/ComunidadView.tsx`
- `views/PricingView.tsx`
- `components/SEO.tsx`
- `index.html`

### Refactor pendiente

- separar shell de app de concerns de onboarding, promo, chat y routing visual
- limpiar naming de marca
- centralizar reglas de navegación

## Criterio de cambio aceptable

- menos branching visual en componentes raíz
- menos estado mezclado por responsabilidad
- más posibilidad de que varios agentes trabajen sin tocar el mismo archivo
