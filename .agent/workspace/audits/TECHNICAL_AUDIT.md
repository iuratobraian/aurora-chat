# Technical Audit

## Diagnóstico

La app funciona como una SPA grande con múltiples superficies, pero la estructura principal todavía concentra demasiado estado y demasiada responsabilidad en pocos archivos.

## Riesgos

1. `App.tsx` como shell demasiado cargado.
2. `Navigation.tsx` con navegación amplia y mucha lógica visual.
3. `ComunidadView.tsx` con demasiados concerns mezclados.
4. documentación histórica no confiable.
5. riesgo de colisión entre agentes si no se respeta ownership.

## Acción recomendada

- atacar primero marca, navegación, home, comunidad y pricing
- después separar shell y responsabilidades grandes
- mantener backlog y board como única verdad operativa
