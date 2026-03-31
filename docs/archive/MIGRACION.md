# 🚀 Guía de Migración de TradeShare Platform

Esta guía detalla los pasos necesarios para migrar TradeShare a un nuevo servidor o entorno de producción de forma sencilla y ordenada.

## 📋 Pasos para la Migración

### 1. Preparar el Repositorio
1.  **Clona el código**:
    `git clone <url-de-tu-nuevo-repositorio>`
2.  **Instala las dependencias**:
    `npm install`
3.  **Configura el entorno**:
    Copia `.env.example` a `.env.local` y rellena los datos necesarios.

### 2. Configurar el Backend (Convex)
Convex es nuestra base de datos y servidor de funciones en tiempo real.
1.  **Inicia sesión**:
    `npx convex login`
2.  **Inicia el proyecto**:
    `npx convex dev` (esto configurará el proyecto localmente).
3.  **Despliega a producción**:
    `npx convex deploy`
4.  Asegúrate de copiar la URL de Convex que te proporcione el panel y ponerla en tus variables de entorno de frontend.

### 3. Configurar el Frontend (Vercel)
Vercel sirve nuestra aplicación web.
1.  Conecta tu repositorio a un nuevo proyecto en **Vercel**.
2.  Agrega las **Variables de Entorno** (Environment Variables) en el dashboard de Vercel:
    *   `VITE_CONVEX_URL`: La URL de tu servidor de producción de Convex.
    *   `VITE_SUPABASE_URL`: (Si se usa Supabase para el login antiguo o storage).
    *   `VITE_SUPABASE_ANON_KEY`: (Si se usa Supabase).
3.  Haz el deploy: El propio Vercel lo hará al detectar el `git push`.

### 4. Verificación Post-Migración
1.  Entra en el panel de **Convex** y verifica que el usuario de administración (brai) tenga sus credenciales correctas.
2.  Prueba el acceso a la plataforma (Frontend).
3.  Verifica que las imágenes y videos se carguen correctamente.

---
💡 **Consejo:** Para actualizaciones futuras del sistema, simplemente usa el comando `git push` y luego `npx convex deploy` (puedes usar el comando automatizado `/deploy` si usas este asistente).
