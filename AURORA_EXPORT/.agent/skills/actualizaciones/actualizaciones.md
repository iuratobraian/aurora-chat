---
name: actualizaciones
description: Registro cronológico de cambios, mejoras y correcciones críticas en el ecosistema.
---

# Skill: Actualizaciones (Changelog de Agentes)

## Propósito
Este skill sirve como la "memoria compartida" de corto plazo para todos los agentes. Asegura que cada nuevo agente que se sume al proyecto esté al tanto de los últimos cambios estructurales, técnicos o de diseño realizados por sus predecesores.

## Registro de Actualizaciones

### [2026-03-22] - WEB & INFRA
- **Post/Signal Toggle**: Implementado en `CreatePostInline.tsx`. Ahora admite creación técnica de señales con Entry, SL y TP.
- **Signal UI**: Actualizado `PostCard.tsx` con diseño Obsidian Ether exclusivo para señales.
- **Schema Update**: Convex `posts` table ahora soporta metadata de señales.
- **Admin Skills**: Creadas las skills `creador_de_apps` y `actualizaciones`.
- **Protocolo de Inicio**: Actualizado para incluir la auditoría obligatoria de esta skill.

### [2026-03-22] - MOBILE & DEPLOY
- **Mobile Menu Fix**: Cambiado `<div role="button">` por `<button type="button">` nativo en `Navigation.tsx` para items del menú móvil. Resuelve falta de respuesta táctil en iOS/Android WebView.
- **Android APK Build**: Creado `.github/workflows/android-build.yml` para automatización de APK con Capacitor en cada push a main.
- **Broken File Cleanup**: Removida referencia a `AiChatView` inexistente de `App.tsx` que bloqueaba el build.


---
**Nota para Agentes**: Si realizas un cambio estructural, una refactorización mayor o añades una funcionalidad clave, DEBES registrarlo en este archivo inmediatamente.
