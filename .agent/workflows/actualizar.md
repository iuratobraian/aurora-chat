---
description: Ejecuta el protocolo completo de sincronización de GitHub y despliegue a producción (Vercel + Convex)
---

# Workflow: /actualizar

Este comando lanza la secuencia de guardado y despliegue profesional.

// turbo-all

## Secuencia de Ejecución
1.  **Validación**: Ejecutar `npm run lint`.
2.  **Hito de GitHub**:
    - Generar un mensaje de commit descriptivo basado en `CURRENT_FOCUS.md`.
    - `git add .`
    - `git commit -m "[mensaje]"`
    - `git push`
3.  **Despliegue Multi-Cloud**:
    - **Convex**: `npx convex deploy`
    - **Vercel**: `npx vercel --prod`
4.  **Notificación**: Informar al usuario la URL de producción y registrar el éxito en `GLOBAL_CHAT_HISTORY.md`.

## Uso
Simplemente escribe `/actualizar` para que el agente inicie la proactividad de despliegue.
