---
name: migracion_servidor
description: Instrucciones paso a paso para migrar el servidor y la plataforma TradeShare a un nuevo entorno.
---

# Guía de Migración de TradeShare Platform

Usa este skill cuando necesites mover la aplicación a un nuevo servidor o repositorio de producción.

## 1. Preparación del Entorno
- Clona el repositorio: `git clone <url_repo>`
- Instala dependencias: `npm install`
- Copia las variables de entorno: `cp .env.example .env.local`

## 2. Configuración de Convex (Backend/Database)
- Inicia sesión: `npx convex login`
- Crea un nuevo proyecto en el dashboard de Convex.
- Despliega las funciones y el esquema: `npx convex deploy`
- Copia la URL de Convex generada al archivo `.env.local` como `VITE_CONVEX_URL`.

## 3. Configuración de Vercel (Frontend)
- Instala Vercel CLI o usa el dashboard.
- Conecta el repositorio.
- Configura las variables de entorno en el panel de Vercel (incluyendo la URL de Convex).
- Despliega con `vercel --prod`.

## 4. Verificación de Seguridad
- Asegúrate de que las credenciales de administrador (brai) estén configuradas en la base de datos de producción desde el dashboard de Convex después del despliegue.

## 5. Mantenimiento
- Para futuras actualizaciones, usa el workflow `/deploy`.
