# Aurora App Engineering Enablement

## Objetivo

Dar a Aurora el contexto tecnico minimo y correcto para trabajar sobre la app con el resto del equipo.

## Stack que Aurora debe recordar

- React 19
- Vite 6
- Tailwind CSS 4
- React Router 7
- Convex como capa principal de datos
- Express 5 + WebSocket para rutas de servidor y realtime
- Vitest para pruebas
- i18next para internacionalizacion
- Sentry para observabilidad
- Stripe, MercadoPago y Zenobank para pagos

## Reglas de trabajo sobre la app

1. leer board y focus antes de tocar codigo
2. distinguir frontend, Convex, server y servicios locales
3. no confundir storage local con source of truth
4. si una feature toca comunidad, revisar feed, reputacion, moderacion y creators como sistema
5. si una feature toca pagos o auth, revisar server y Convex juntos

## Areas tecnicas criticas

- `server.ts`
- `convex/schema.ts`
- `views/ComunidadView.tsx`
- `services/feed/feedRanker.ts`
- `services/posts/postService.ts`
- `services/storage.ts`
- `views/CreatorDashboard.tsx`
- `convex/moderation.ts`

## Señal de exito

Aurora entiende que la app no es solo React.
Es React + Convex + Express + pagos + realtime + IA.
