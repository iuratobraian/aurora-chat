# Sesión: 27 de Marzo, 2026 - TradeShare Platform Stabilization

## Resumen de Ideas y Prompt Compartidos

### Estabilización de Infraestructura
- **Instagram OAuth**: Se identificó que la pérdida del `userId` en el callback de Instagram causaba errores de vinculación. La solución fue pasar el `userId` en el parámetro `state` de la URL de autorización.
- **MercadoPago Orchestrator**: Se corrigió un error crítico donde la acción de Convex no retornaba el objeto de preferencia, y se agregaron logs de diagnóstico detallados para monitorear transacciones en tiempo real.

### Mejoras de UI/UX (Feedback de Usuario)
- **Banners Rotativos**: Implementación de `RotatingAdBanner` en la parte superior del feed de comunidad para mejorar la estética y la rotación de anuncios.
- **Inyección de Publicidad**: Activación de la lógica de `injectAds` para intercalar anuncios orgánicamente dentro del feed de posts.
- **Iconografía y Categorías**: Expansión de categorías de posts (9 categorías en total) con iconos de Material Symbols específicos para cada una (`bar_chart`, `lightbulb`, `trending_up`, `psychology`, `newspaper`, `folder`, `help`, `group`, `apps`).

### Decisiones de Arquitectura
- **Truth Remediation**: Compromiso de eliminar `localStorage` como fuente de verdad, priorizando siempre el estado de Convex para la vinculación de cuentas y configuraciones del sistema.

### Memoria del Instructor
- El usuario solicita guardar estas sesiones diariamente para poder buscar prompts o ideas compartidas en el futuro.
- Carpeta de destino: `instructor/{fecha}/`.
