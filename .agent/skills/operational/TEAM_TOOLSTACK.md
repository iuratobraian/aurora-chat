# Team Toolstack

## Objetivo

Definir el stack de herramientas recomendado para que el equipo opere como un grupo full stack serio, rápido y trazable.

## MCPs recomendados

## 1. Documentación y conocimiento

### OpenAI Docs MCP

- uso: documentación oficial de OpenAI, modelos, Responses API, Agents, prompting y cambios recientes
- valor: evita respuestas inventadas o desactualizadas
- estado: ya existe como skill del sistema si el entorno lo soporta

### Docs / knowledge MCP del stack

- uso: docs oficiales de Convex, Vercel, React, Vite, Stripe, MercadoPago, Sentry
- valor: resolver dudas técnicas con fuente primaria
- recomendación: priorizar MCPs o conectores oficiales de docs antes que búsquedas genéricas

## 2. Repositorio y coordinación

### GitHub MCP

- uso: PRs, issues, checks, comments, review status
- valor: conecta ejecución del repo con el flujo operativo del equipo
- prioridad: alta

### Linear o Jira MCP

- uso: roadmap, bugs, planning, estados externos al repo
- valor: sincroniza trabajo del Project OS con gestión de producto
- prioridad: media-alta si el equipo usa ticketing real

## 3. Frontend y UX

### Browser / Playwright MCP

- uso: validar navegación, auth, pricing, mobile, regresiones visuales
- valor: subir calidad de QA y reducir “funciona en teoría”
- prioridad: muy alta

### Figma MCP

- uso: inspección de specs, tokens, spacing, contenido aprobado
- valor: alinear diseño con implementación
- prioridad: media, muy útil si hay diseño formal

## 4. Infraestructura y operaciones

### Vercel MCP

- uso: deploys, logs, variables, dominios, previews
- valor: operar producción y previews sin cambiar de contexto
- prioridad: muy alta

### Sentry MCP

- uso: errores, issues, releases, stack traces
- valor: observabilidad real para bugs de frontend y backend
- prioridad: muy alta

### Convex MCP o acceso operativo equivalente

- uso: revisar deployment, functions, tablas, cron jobs, logs
- valor: controlar la base real del negocio
- prioridad: crítica para este proyecto

## 5. Datos y APIs

### Postman / OpenAPI MCP

- uso: documentar y probar endpoints internos
- valor: estabiliza integraciones y webhooks
- prioridad: media-alta

### Database inspector MCP

- uso: cuando un proyecto tenga Postgres, Redis u otra base aparte
- valor: inspección segura y rápida de datos reales
- prioridad: futura, según arquitectura

## Scripts y automatizaciones recomendadas

## Críticos

- `npm run validate:ops`
- `npm run agent:preflight`
- `npm run release:gate`
- `npm run guard:hardcodes`
- `npm run ops:status`
- `npm run ops:open`
- `npm run ops:critical`
- `npm run ops:scorecard`

## Recomendados a agregar después

- smoke test browser automatizado
- check de env requerido por entorno
- changelog de release automático

## Política de herramienta

1. Preferir herramientas que dejen rastro verificable.
2. Preferir fuentes primarias.
3. No agregar MCPs “porque sí”; cada uno debe ahorrar tiempo o reducir riesgo.
4. Si un MCP toca producción, su uso debe quedar ligado a checklist y ownership.
