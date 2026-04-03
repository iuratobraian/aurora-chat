# AI Room Integration Playbook

## Objetivo

Convertir la Sala de IA en un subsistema estable, externo y útil para administración, soporte y comunidad sin cargar la infraestructura principal con inferencia pesada.

## Base ya implementada

- `server.ts`
  - `GET /api/ai/providers`
  - `POST /api/ai/external/chat`
- `lib/ai/externalProviders.ts`
  - registro de providers externos
  - orden de fallback
- `components/admin/AIRoomSection.tsx`
  - consola inicial para operar la sala desde Admin
- `views/AdminView.tsx`
  - sección `aiRoom`

## Filosofía

1. La inferencia ocurre fuera de nuestra infraestructura.
2. Nuestro servidor solo enruta, protege, limita y registra.
3. La UI nunca debe depender de un solo provider.
4. Toda integración nueva debe degradar con elegancia.

## Orden de implementación para agentes

### AI-001 - Infra del relay

Responsable: `AGENT-AI-INFRA`

1. agregar rate limiting por IP y por usuario a `/api/ai/external/chat`
2. agregar timeout configurable por provider
3. registrar provider usado, latencia, error y fallback aplicado
4. agregar `requestId` a cada ejecución
5. ocultar internamente cualquier error sensible de provider

Aceptación:
- relay con fallback real
- sin exposición de claves
- con trazabilidad básica

### AI-002 - Sala IA Admin

Responsable: `AGENT-AI-ADMIN`

1. agregar presets:
   - soporte a comunidad
   - debugging frontend
   - debugging backend
   - revisión de copy
   - búsqueda de solución técnica
2. agregar historial local de conversaciones en admin
3. agregar comparación entre providers
4. agregar botón de reintento con siguiente fallback
5. agregar guardas para no enviar prompts vacíos o enormes

Aceptación:
- admin puede operar la sala sin tocar código
- historial claro
- fallback visible

### AI-003 - Herramientas para comunidad

Responsable: `AGENT-AI-COMMUNITY`

1. conectar la sala a flujos útiles:
   - responder dudas básicas
   - explicar conceptos de inversión
   - resumir publicaciones largas
   - orientar onboarding
   - sugerir siguiente acción
2. nunca enviar datos sensibles sin sanitización
3. limitar uso por contexto y prioridad
4. siempre ofrecer salida humana o fallback no-IA

Aceptación:
- IA útil para usuarios
- no bloquea la app si falla
- no rompe privacidad

## Providers sugeridos

Orden base:
1. `groq`
2. `openrouter`
3. `cerebras`

Política:
- usar el más rápido para soporte y resolución breve
- usar routers multi-modelo para fallback y modelos free
- usar contexto largo solo cuando realmente aporte valor

## Reglas de seguridad

1. no exponer API keys al browser
2. no persistir prompts sensibles completos sin necesidad
3. sanitizar contexto antes de enviarlo a terceros
4. aplicar `INTERNAL_API_SHARED_KEY` si la ruta se usa fuera del panel
5. no enviar tokens, passwords, webhooks ni secretos operativos

## Regla de UX

Si la IA falla:
- la pantalla no debe colapsar
- mostrar mensaje simple
- ofrecer reintento
- ofrecer fallback manual
- conservar el contexto escrito por el usuario

## Definition of Done

- provider externo funcionando
- fallback probado
- UI estable aunque el provider falle
- logs básicos disponibles
- task board y agent log actualizados
