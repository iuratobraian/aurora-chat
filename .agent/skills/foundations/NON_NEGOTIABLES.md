# Non Negotiables

## Propósito

Este documento define lo que no se rompe por ninguna tarea, urgencia o experimento.

## Contrato de estabilidad

1. La app debe iniciar.
2. La navegación principal no debe quedar rota.
3. Auth, sesión y permisos no pueden degradarse silenciosamente.
4. Los datos de negocio no pueden depender solo de `localStorage`.
5. Los pagos no pueden confirmarse desde el frontend.
6. Los webhooks no pueden aceptarse sin validación e idempotencia cuando pasen a productivo.
7. Ningún secreto o token sensible puede quedar expuesto en cliente o almacenamiento reversible.
8. No se agregan hardcoded URLs de producción o deployments alternativos dentro de servicios.
9. No se rompe la trazabilidad de tareas, handoffs y decisiones.
10. No se marca `done` sin verificación mínima real.

## Archivos críticos

- `App.tsx`
- `components/Navigation.tsx`
- `views/ComunidadView.tsx`
- `views/PricingView.tsx`
- `components/SEO.tsx`
- `index.html`
- `server.ts`
- `src/config.ts`
- `src/config/urls.ts`
- `services/storage.ts`
- `services/auth/authService.ts`
- `services/posts/postService.ts`
- `services/users/userService.ts`

## Regla

Si una tarea exige comprometer uno de estos principios, la tarea se frena y se eleva a decisión.
