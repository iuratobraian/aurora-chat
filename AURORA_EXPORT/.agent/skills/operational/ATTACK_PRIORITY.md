# Attack Priority

## Propósito

Cuando un agente tenga dudas sobre qué atacar, este orden manda.

## Orden permanente de ataque

1. Estabilidad del sitio.
2. Runtime real de backend y webhooks.
3. Configuración y secretos.
4. Source of truth de datos.
5. Auth y confianza server-side.
6. Pagos y reconciliación.
7. Observabilidad y QA.
8. Branding, navegación y home.
9. Conversión y pricing.
10. Features secundarias.

## Reglas prácticas

- Si algo rompe carga, sesión, navegación o datos, eso va primero.
- Si el backend real es ambiguo, no seguir agregando features.
- Si hay duda entre estética y infraestructura, gana infraestructura.
- Si hay duda entre una feature nueva y deuda que afecta estabilidad, gana la deuda.

## Qué atacar siempre

- duplicación de fuentes de verdad
- fallbacks hardcodeados
- endpoints sin auth
- webhooks sin seguridad
- archivos raíz demasiado cargados
- tareas sin dueño claro
