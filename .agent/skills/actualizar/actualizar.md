---
name: actualizar
description: Protocolo para sincronizar cambios con GitHub y desplegar a plataformas de producción (Vercel/Convex).
---

# Skill: Actualizar (Deploy & Sync)

## Propósito
Este skill define el proceso estándar para llevar los cambios desde el entorno de desarrollo local hacia el control de versiones y los servidores de producción, asegurando la integridad del código y la disponibilidad de la plataforma.

## Paso a Paso del Despliegue

### 1. Auditoría de Preparación
- Ejecutar `npm run lint` para asegurar que no hay errores de tipos.
- Revisar que `.env.example` esté actualizado si se añadieron nuevas variables.

### 2. Sincronización con GitHub
- `git add .`
- `git commit -m "feat/fix: descripción del cambio"` (Seguir convenciones de Commits en AGENTS.md).
- `git push origin main`

### 3. Despliegue de Backend (Convex)
- `npx convex deploy`
- Verificar que las mutaciones y esquemas se hayan actualizado correctamente en el dashboard de Convex.

### 4. Despliegue de Frontend (Vercel)
- `npx vercel --prod`
- Verificar la URL de producción (ej: https://tradeportal-2025-platinum.vercel.app).

## Registro de Éxito
Cada despliegue debe ser registrado en:
1.  `.agent/workspace/coordination/GLOBAL_CHAT_HISTORY.md` (Como un hito del proyecto).
2.  `.agent/skills/actualizaciones/actualizaciones.md` (Para informar a otros agentes).
