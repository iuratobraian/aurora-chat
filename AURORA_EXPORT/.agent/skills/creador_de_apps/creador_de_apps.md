---
name: creador_de_apps
description: Suite para la creación de aplicaciones profesionales basada en nuestra infraestructura y experiencia.
---

# Skill: Creador de Apps (Project OS)

## Propósito
Este skill centraliza el conocimiento acumulado en el desarrollo de TradePortal y otros proyectos para permitir la creación autónoma y profesional de nuevas aplicaciones. Utiliza la misma infraestructura (Convex, React/Vite, Express) y los mismos estándares de diseño (Obsidian Ether) y operación (Project OS).

## Operación con /apps
Al activar el comando `/apps`, el agente entra en modo "App Creator Studio":
1.  **Contexto**: Leer `.agent/skills/creador_de_apps/README.md` y guías de `infrastructure/`.
2.  **Mesa de Trabajo**: Utilizar exclusivamente:
    - `.agent/skills/creador_de_apps/workspace/TASK_BOARD.md`
    - `.agent/skills/creador_de_apps/workspace/CURRENT_FOCUS.md`
    - `.agent/skills/creador_de_apps/workspace/AGENT_LOG.md`
3.  **Búsqueda de Noticias**: Revisar `.agent/skills/creador_de_apps/news/` para tendencias o requerimientos nuevos.
4.  **Autonomía**: Aplicar las mismas reglas de independencia total definidas en la skill `inicio`.

## Estándares Técnicos
- **Frontend**: Vite + React + Vanilla CSS (Obsidian Ether).
- **Backend**: Convex (Mutaciones/Queries) + Express (Webhooks/Relay).
- **Mobile**: Expo/React Native (si aplica).
- **Auth**: Clerk / Convex Auth.
- **Pagos**: MercadoPago / Stripe / Zenobank (según plan).

## Mesa de Trabajo
Cualquier agente trabajando en este módulo debe mantener la disciplina de logs y focos en la carpeta `workspace/` interna de este skill.
