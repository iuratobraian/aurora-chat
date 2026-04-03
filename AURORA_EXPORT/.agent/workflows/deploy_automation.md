---
description: Guía de despliegue automatizado y manual
---

# 🚀 Despliegue de la Super App

Este workflow define cómo se sincroniza la aplicación con GitHub, Vercel y Convex.

## 🤖 Automatización CI/CD

El despliegue ocurre automáticamente cada vez que se realiza un `push` a la rama `main`. Para que esto funcione, asegúrate de tener configurados los siguientes secretos en GitHub (`Settings > Secrets > Actions`):

| Secreto GITHUB | Descripción |
|---|---|
| `CONVEX_DEPLOY_KEY` | Clave de despliegue (Convex Dashboard) |
| `CONVEX_DEPLOYMENT` | Nombre de tu despliegue (ej. `notable-sandpiper-279`) |
| `VERCEL_TOKEN` | Token de cuenta Vercel |
| `VERCEL_ORG_ID` | ID de organización Vercel |
| `VERCEL_PROJECT_ID` | ID de proyecto Vercel |

## 🛠️ Despliegue Manual (Emergencia)

Si necesitas forzar un despliegue desde tu máquina local sin esperar a GitHub:

// turbo
1. Limpiar archivos redundantes y desplegar Convex:
```bash
cmd /c clean_convex.bat && npx convex deploy --yes
```

2. Sincronizar con GitHub (disparando Vercel):
```bash
git add .
git commit -m "deploy: update production"
git push origin main
```

## 🔍 Monitoreo

- **Vercel**: Revisa la pestaña de `Deployments` en tu proyecto.
- **Convex**: Mira los logs en `Dashboard > Logs` para confirmar que las funciones se actualizaron.
- **GitHub**: Pestaña `Actions` para ver el progreso del pipeline `CI/CD Pipeline`.

---
*Mente Maestra Aurora - Optimización Continua*
