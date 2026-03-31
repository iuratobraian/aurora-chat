---
name: meta_api_integration
description: Instrucciones paso a paso para configurar la app en Facebook Developers y realizar la integración de la API de Meta (Instagram Graph API).
---

# Integración con Meta API (Instagram Graph API)

Este documento detalla el procedimiento para configurar las credenciales OAuth y obtener acceso para conectar cuentas de Instagram Business a TradeHub.

## 1. Requisitos de la Aplicación (Facebook Developers)
Para enviar la aplicación a revisión en Meta, debes tener habilitados y accesibles los siguientes 4 recursos en producción:
- **Icono de la Aplicación:** Imagen validada (1024x1024) alojada en `/app-icon.png`.
- **Política de Privacidad:** Archivo HTML estático ubicado en `/privacy-policy.html`.
- **Condiciones del Servicio:** Archivo HTML estático ubicado en `/terms-of-service.html`.
- **Eliminación de Datos del Usuario:** Archivo HTML con instrucciones en `/data-deletion.html`.

*Importante*: Configurar reglas de rescritura en el servidor (ej: `vercel.json`) para que el framework frontend no intercepte estas URLs estáticas y devuelva un error estético; deben ser directamente legibles por el Crawler de Facebook.

## 2. Variables de Entorno (Convex)
Configura en el dashboard de Convex (y opcionalmente en Vercel) las siguientes variables para tu backend:
- `INSTAGRAM_APP_ID`: El ID de tu App en Meta Developers.
- `INSTAGRAM_APP_SECRET`: El App Secret correspondiente.
- `INSTAGRAM_REDIRECT_URI`: La URL exacta de tu frontend donde Meta retornará el código (ej: `https://tu-dominio.com/instagram/callback`).

*Nota*: Se sugiere que `INSTAGRAM_REDIRECT_URI` use `https://tradeportal-2025-platinum.vercel.app/instagram/callback` o el dominio real de producción.

## 3. Flujo OAuth en la Aplicación
1. **Frontend (ConfiguracionView)**: Se consulta el Mutation/Query en Convex (`getInstagramAuthUrl`) para generar la URL dinámica hacia Facebook Oauth, inyectando el `client_id` y los `scopes` necesarios (`instagram_basic, pages_show_list`, etc.).
2. **Redirección a Meta**: El usuario acepta los permisos de Instagram/Facebook.
3. **El Callback (`/instagram/callback`)**: El usuario es devuelto a la app con el `?code=XXXX`. 
4. **Backend (Convex)**: 
   - El frontend captura el `code` y llama a `exchangeCodeForToken` en Convex.
   - Convex llama a Meta para intercambiar el `code` por un Access Token de larga duración.
   - Convex recupera la página y cuenta vinculada (`getInstagramBusinessAccount`).
   - El backend guarda (o parchea) estos datos en el documento del usuario correspondiente (Mutation `connectInstagramAccount`).

## 4. Troubleshooting Frecuente
- **URL No Coincide / Redirect URI Mismatch**: El valor en Facebook Login Settings (Valid OAuth Redirect URIs) y el `INSTAGRAM_REDIRECT_URI` deben coincidir exactamente, incluyendo trailing slashes (`/`).
- **Problemas de `URL_PLACEHOLDER` en revisión**: Si Meta rechaza tus URLs argumentando que usas un dominio "de prueba", asegúrate de usar siempre la URL de Vercel/Producción definitiva y nunca dominios inventados como `.test` o `.app` si no están registrados por ti.
- **Cuenta no Business (IG)**: Solo funciona con perfiles de Instagram que hayan sido convertidos a Cuentas Profesionales/Negocio y estén vinculados a una página de Facebook.
